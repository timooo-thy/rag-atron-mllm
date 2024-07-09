import {
  LangChainStream,
  StreamingTextResponse,
  Message as VercelChatMessage,
  formatStreamPart,
} from "ai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { HumanMessage, MessageContent } from "@langchain/core/messages";
import {
  REPHRASE_PROMPT,
  IMAGE_PROMPT,
  IMAGE_CLASSIFIER_PROMPT,
  HISTORY_PROMPT,
} from "@/utils/prompt-templates";
import { PromptTemplate } from "@langchain/core/prompts";
import initialiseVectorStore from "@/utils/db";
import { formSchema } from "@/lib/utils";
import OpenAI from "openai";
import { ChatOpenAI } from "@langchain/openai";
import { toFile } from "openai/uploads";
import {
  formatMessage,
  getRetriever,
  uploadImagesAndGenerateUrls,
  uploadVideo,
} from "@/lib/rag-functions";
import { Prompt } from "@/lib/type";

export const dynamic = "force-dynamic";

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

  // Formatting messages following Llama:3's format
  const formattedPreviousMessages = typedMessages
    .slice(0, -1)
    .map(formatMessage);

  // Get the latest k buffer window (memory)
  const latestKBufferWindow =
    context === 0 ? [] : formattedPreviousMessages.slice(-context);

  // Get the current user's query
  const currentMessageContent = typedMessages[typedMessages.length - 1].content;

  // Video transcription
  if (fileType === "video" && chatFilesBase64 && chatFilesBase64.length > 0) {
    // Upload video to S3 and get the video url
    const video_url = await uploadVideo(chatFilesBase64[0]);

    if (!video_url) {
      return Response.json({ error: "Error uploading video" });
    }

    try {
      const response = await fetch("https://narconetvideo.ngrok.app/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Body contains the video url and the user's query
        body: JSON.stringify({
          query: currentMessageContent,
          video_url: video_url,
        }),
      });

      if (!response.body) {
        return Response.json({ error: "Error fetching response" });
      }

      // Streaming purposes
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const stream = new ReadableStream({
        async start(controller) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            // Decode the Uint8Array chunk to a string
            const chunk = decoder.decode(value, { stream: true });
            // Text chunks are lines that look like this 0:my-chunk\n hence the need to reformat
            const formattedChunk = formatStreamPart("text", chunk);
            // Enqueue the chunk to the controller
            controller.enqueue(formattedChunk);
          }
          controller.close();
        },
      });
      return new StreamingTextResponse(stream);
    } catch (e) {
      return Response.json({ error: "Error fetching response" });
    }
  }

  // Initialise OpenaAI model with stream and handlers
  const { stream, handlers } = LangChainStream();

  // Main LLM
  const llm = new ChatOpenAI({
    model: modelName,
    callbacks: [handlers],
    streaming: true,
    temperature: temperature,
  });

  // History Aware LLM
  const rephrasingLLM = new ChatOpenAI({
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
      // Convert base64 to array buffer back to file
      const bufferData = await toFile(Buffer.from(data, "base64"), "audio.mp3");

      // OpenAI's Whisper model for audio transcription
      const transcription = await openai.audio.transcriptions.create({
        file: bufferData,
        model: "whisper-1",
        language: "en",
      });
      responses.push(transcription.text);
    }

    // Small hack to enable streaming response
    llm.invoke(
      `There is/are ${responses.length} audio clips. Repeat the exact full audio transcriptions in text format and label each clip if more than 1. If transcription is empty, ask user to retry. Transcriptions:` +
        responses +
        "Begin your answer with 'Here is/are the audio transcription(s):'"
    );
  } else if (
    fileType === "image" &&
    chatFilesBase64 &&
    chatFilesBase64.length > 0
  ) {
    const retreiverLLM = new ChatOpenAI({
      model: "gpt-4o",
      temperature: 0,
    });

    const selectRetrieverChain = IMAGE_CLASSIFIER_PROMPT.pipe(retreiverLLM);

    const response = await selectRetrieverChain.invoke({
      query: currentMessageContent,
    });

    if (response.content === "Image Lookup") {
      imageToImage = 1;

      const describerLLM = new ChatOpenAI({
        model: "gpt-4o",
        temperature: 0.6,
      });

      // Using LLM to describe the image for search query
      const response = await describerLLM.invoke([
        new HumanMessage({
          content: [
            {
              type: "text",
              text: `Describe this image succinctly while being descriptive under 30 words to be used as a search query in a vector database.`,
            },
            { type: "image_url", image_url: { url: chatFilesBase64[0] } },
          ],
        }),
      ]);

      description = response.content;
    } else {
      // Upload images to S3 and get the image urls
      const imageUrls = await uploadImagesAndGenerateUrls(chatFilesBase64);

      const prompt: Prompt = {
        content: [
          {
            type: "text",
            text: `Describe this image under 30 words to be used as exhibit captioning for a narcotics team. Use markdown table format (no spaces) into 2 columns: 'Exhibition Image', 'Description'. Under the Exhibition Image, use this URL: ${imageUrls} to display the image via (![image_title](URL)). User's query: ${currentMessageContent}`,
          },
        ],
      };

      for (let i = 0; i < chatFilesBase64.length; i++) {
        prompt.content.push({
          type: "image_url",
          image_url: { url: chatFilesBase64[i] },
        });
      }

      llm.invoke([new HumanMessage(prompt)]);
    }
  }

  // Image to image query or text query
  if (imageToImage || !fileType) {
    let vectorStore;
    let combineDocsChains;

    // Image to image query (Finding similar images based on image)
    if (imageToImage) {
      const { embeddings } = await initialiseVectorStore();

      // Retrieve image vector store
      vectorStore = await Chroma.fromExistingCollection(embeddings, {
        collectionName: "images",
        url: process.env.CHROMA_DB_URL!,
      });

      // Combine documents chain with url, caseId and page content
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
      if (!vectorStore || !combineDocsChains) {
        const retrieverChain = HISTORY_PROMPT.pipe(llm);
        retrieverChain.invoke({
          chat_history: latestKBufferWindow,
          query: currentMessageContent,
        });
      } else {
        // Retrieve k similar documents based on the user's query
        const retriever = vectorStore.asRetriever({
          k: similarity,
          filter: { caseId: caseId },
        });

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
    }
  }

  return new StreamingTextResponse(stream);
}
