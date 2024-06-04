import {
  LangChainStream,
  StreamingTextResponse,
  Message as VercelChatMessage,
  formatStreamPart,
} from "ai";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import {
  AIMessage,
  HumanMessage,
  MessageContent,
} from "@langchain/core/messages";
import {
  REPHRASE_PROMPT,
  IMAGE_PROMPT,
  IMAGE_CLASSIFIER_PROMPT,
} from "@/utils/prompt-templates";
import { PromptTemplate } from "@langchain/core/prompts";
import initialiseVectorStore from "@/utils/db";
import { formSchema } from "@/lib/utils";
import OpenAI from "openai";
import { toFile } from "openai/uploads";
import {
  getRetriever,
  uploadImagesAndGenerateUrls,
  uploadVideo,
} from "@/lib/rag-functions";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const formatMessage = (message: VercelChatMessage) => {
  return message.role === "user"
    ? new HumanMessage(
        "<|start_header_id|>user<|end_header_id|>" +
          message.content +
          "<|eot_id|>"
      )
    : new AIMessage(
        "<|start_header_id|>assistant<|end_header_id|>" +
          message.content +
          "<|eot_id|>"
      );
};

export async function POST(req: Request) {
  const body = await req.json();

  // Destructure and validate the request body
  const result = formSchema.parse(body);
  const {
    messages,
    caseId,
    temperature,
    similarity,
    context,
    modelName,
    chatFilesBase64,
    fileType,
  } = result;

  const typedMessages = messages as VercelChatMessage[];

  const formattedPreviousMessages = typedMessages
    .slice(0, -1)
    .map(formatMessage);

  // Get the latest k buffer window (memory)
  const latestKBufferWindow =
    context === 0 ? [] : formattedPreviousMessages.slice(-context);
  const currentMessageContent = typedMessages[typedMessages.length - 1].content;

  // Video transcription
  if (fileType === "video" && chatFilesBase64 && chatFilesBase64.length > 0) {
    const video_url = await uploadVideo(chatFilesBase64[0]);

    if (!video_url) {
      return NextResponse.json(
        { error: "Error uploading video" },
        { status: 400 }
      );
    }
    try {
      const response = await fetch("http://localhost:8002/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: currentMessageContent,
          video_url: video_url,
        }),
      });
      if (!response.body) {
        return NextResponse.json(
          { error: "Error fetching response" },
          { status: 400 }
        );
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const stream = new ReadableStream({
        async start(controller) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            // Decode the Uint8Array chunk to a string
            const chunk = decoder.decode(value, { stream: true });
            // Text chunks are lines that look like this 0:my-chunk\n hence the need to format
            const formattedChunk = formatStreamPart("text", chunk);
            // Enqueue the chunk to the controller
            controller.enqueue(formattedChunk);
          }
          controller.close();
        },
      });
      return new StreamingTextResponse(stream);
    } catch (e) {
      return NextResponse.json(
        { error: "Error fetching response" },
        { status: 400 }
      );
    }
  }

  // Initialise ChatOllama model with stream and handlers
  const { stream, handlers } = LangChainStream();

  // Main LLM
  const llm = new ChatOllama({
    model: modelName,
    callbacks: [handlers],
    temperature: temperature,
  });

  // History Aware LLM
  const rephrasingLLM = new ChatOllama({
    model: modelName,
    temperature: temperature,
  });

  // Flag for image to image query
  let imageToImage = 0;
  let description: MessageContent = "";

  // Audio transcription
  if (fileType === "audio" && chatFilesBase64 && chatFilesBase64.length > 0) {
    const openai = new OpenAI();
    let responses = [];

    for (const data of chatFilesBase64) {
      //convert base64 to array buffer back to file
      const bufferData = await toFile(Buffer.from(data, "base64"), "audio.mp3");

      const transcription = await openai.audio.transcriptions.create({
        file: bufferData,
        model: "whisper-1",
        language: "en",
      });
      responses.push(transcription.text);
    }

    llm.invoke(
      `There is/are ${responses.length} audio clips. Repeat the exact full audio transcriptions in text format and label each clip if more than 1. If transcription is empty, ask user to retry. Transcriptions:` +
        responses
    );
  } else if (
    fileType === "image" &&
    chatFilesBase64 &&
    chatFilesBase64.length > 0
  ) {
    console.log(
      `Describe Images with LLaVa, total of ${chatFilesBase64.length} images.`
    );

    const retreiverLLM = new ChatOllama({
      model: "llama3:instruct",
      temperature: 0,
    });

    const selectRetrieverChain = IMAGE_CLASSIFIER_PROMPT.pipe(retreiverLLM);

    const response = await selectRetrieverChain.invoke({
      query: currentMessageContent,
    });

    if (response.content === "Image Lookup") {
      imageToImage = 1;

      const describerLLM = new ChatOllama({
        model: "llava:13b",
        temperature: 0.6,
      });

      const response = await describerLLM.invoke([
        new HumanMessage({
          content: [
            {
              type: "text",
              text: `Describe this image succinctly while being descriptive under 30 words to be used as a search query in a vector database.`,
            },
            { type: "image_url", image_url: chatFilesBase64[0] },
          ],
        }),
      ]);

      description = response.content;
    } else {
      const imageUrls = await uploadImagesAndGenerateUrls(chatFilesBase64);

      const prompt = [];

      for (let i = 0; i < chatFilesBase64.length; i++) {
        prompt.push([
          new HumanMessage({
            content: [
              {
                type: "text",
                text: `Describe this image under 30 words to be used as exhibit captioning for a narcotics team. Use markdown table format (no spaces) into 2 columns: 'Exhibition Image', 'Description'. Under the Exhibition Image, use this URL: ${imageUrls[i]} to display the image via (![image_title](URL)). User's query: ${currentMessageContent}`,
              },
              { type: "image_url", image_url: chatFilesBase64[i] },
            ],
          }),
        ]);
      }

      const llava_llm = new ChatOllama({
        model: "llava:13b",
        callbacks: [handlers],
        temperature: temperature,
      });

      llava_llm.batch(prompt);
    }
  }

  // Image to image query or text query
  if (imageToImage || !fileType) {
    let vectorStore;
    let combineDocsChains;

    // Image to image query
    if (imageToImage) {
      // Retrieve the vector store
      const { embeddings } = await initialiseVectorStore();

      vectorStore = await Chroma.fromExistingCollection(embeddings, {
        collectionName: "images",
        url: process.env.CHROMA_DB_URL!,
      });

      combineDocsChains = await createStuffDocumentsChain({
        llm: llm,
        prompt: IMAGE_PROMPT,
        documentSeparator: "\n-----------\n",
        documentPrompt: new PromptTemplate({
          inputVariables: ["caseId", "url", "page_content"],
          template: `caseId: {caseId}
            url: {url}
            page content: {page_content}`,
        }),
      });
    } else {
      // Text query
      ({ vectorStore, combineDocsChains } = await getRetriever(
        currentMessageContent,
        llm
      ));
    }

    const retriever = vectorStore.asRetriever({
      k: similarity,
      filter: { caseId: caseId },
    });

    // const retriever = ScoreThresholdRetriever.fromVectorStore(vectorStore, {
    //   filter: { caseId: caseId },
    //   minSimilarityScore: 0.4,
    //   maxK: 20,
    //   kIncrement: 1,
    // });

    // Create history aware retriever chain
    const historyAwareRetrieverChain = await createHistoryAwareRetriever({
      llm: rephrasingLLM,
      retriever: retriever,
      rephrasePrompt: REPHRASE_PROMPT,
    });

    // Retriever pipeline
    const retrieverChain = await createRetrievalChain({
      combineDocsChain: combineDocsChains,
      retriever: historyAwareRetrieverChain,
    });

    // Invoke the chain and stream response back
    retrieverChain.invoke({
      chat_history: latestKBufferWindow,
      input:
        description !== ""
          ? currentMessageContent +
            " Description of image to lookup: " +
            description
          : currentMessageContent,
      case_id: caseId,
    });
  }

  return new StreamingTextResponse(stream);
}
