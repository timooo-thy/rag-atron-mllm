import {
  LangChainStream,
  StreamingTextResponse,
  Message as VercelChatMessage,
} from "ai";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import {
  REPHRASE_PROMPT,
  QNA_PROMPT,
  RETRIEVER_PROMPT,
  IMAGE_PROMPT,
} from "@/utils/prompt-templates";
import { PromptTemplate } from "@langchain/core/prompts";
import { ScoreThresholdRetriever } from "langchain/retrievers/score_threshold";
import initialiseVectorStore from "@/utils/db";
import { formSchema } from "@/lib/utils";
import OpenAI from "openai";
import { toFile } from "openai/uploads";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";

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

type Content =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "image_url";
      image_url: string;
    };

export async function POST(req: Request) {
  const body = await req.json();
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
  const currentMessageContent =
    "<|start_header_id|>user<|end_header_id|>" +
    typedMessages[typedMessages.length - 1].content +
    "<|eot_id|>";

  // Initialise ChatOllama model with stream and handlers
  const { stream, handlers } = LangChainStream();

  const llm = new ChatOllama({
    model:
      chatFilesBase64 && chatFilesBase64.length > 0 ? "llava:13b" : modelName,
    callbacks: [handlers],
    temperature: temperature,
  });

  const rephrasingLLM = new ChatOllama({
    model: modelName,
    temperature: temperature,
  });

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

    const s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_BUCKET_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    const uploadImagesAndGenerateUrls = async (chatFilesBase64: string[]) => {
      const imageUrls: string[] = [];
      const uploadPromises = chatFilesBase64.map(async (file) => {
        try {
          const uuid = uuidv4();
          const buffer = Buffer.from(file.split(",")[1], "base64");
          const resizedFile = await sharp(buffer).resize(200).toBuffer();

          const putObjectCommand = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: uuid,
            Body: resizedFile,
          });

          const signedURL = await getSignedUrl(s3Client, putObjectCommand, {
            expiresIn: 60,
          });

          await fetch(signedURL, {
            method: "PUT",
            body: resizedFile,
            headers: {
              "Content-Type": "image/jpeg",
            },
          });

          imageUrls.push(
            `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uuid}`
          );
        } catch (error) {
          console.error(error);
        }
      });

      await Promise.all(uploadPromises);
      return imageUrls;
    };

    const imageUrls = await uploadImagesAndGenerateUrls(chatFilesBase64);

    let content: Content[] = [
      {
        type: "text",
        text: `There are ${
          chatFilesBase64.length
        } images. The URLs of the image in order is: ${imageUrls}.
        Describe each image in detail to be used as exhibit captioning for a narcotics team. 
        Use markdown table format (no spaces) columns: 'Exhibition Image', 'Description'. 
        Display the identified images in order of the URLs given (![image_title](URL)) in proper markdown.
        Each row in the table tallies to one image with its own description.
        Ensure there are the same number of rows as images excluding headers.
        User Query: ${typedMessages[typedMessages.length - 1].content}`,
      },
    ];

    chatFilesBase64.forEach((url) => {
      content.push({
        type: "image_url",
        image_url: url,
      });
    });

    llm.invoke([
      new HumanMessage({
        content: content,
      }),
    ]);
  } else {
    const { vectorStore, combineDocsChains } = await getRetriever(
      currentMessageContent,
      llm
    );

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

    // RAG pipeline
    const retrieverChain = await createRetrievalChain({
      combineDocsChain: combineDocsChains,
      retriever: historyAwareRetrieverChain,
    });

    // Invoke the chain and stream response back
    retrieverChain.invoke({
      chat_history: latestKBufferWindow,
      input: currentMessageContent,
      case_id: caseId,
    });
  }

  return new StreamingTextResponse(stream);
}

async function getRetriever(query: string, llm: ChatOllama) {
  const retreiverLLM = new ChatOllama({
    model: "llama3:instruct",
    temperature: 0,
  });

  const selectRetrieverChain = RETRIEVER_PROMPT.pipe(retreiverLLM);

  const response = await selectRetrieverChain.invoke({
    query: query,
  });

  // Retrieve the vector store
  const { embeddings } = await initialiseVectorStore();

  let vectorStore;
  let combineDocsChains;

  if (response.content === "Image Lookup") {
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
    vectorStore = await Chroma.fromExistingCollection(embeddings, {
      collectionName: "text",
      url: process.env.CHROMA_DB_URL!,
    });
    combineDocsChains = await createStuffDocumentsChain({
      llm: llm,
      prompt: QNA_PROMPT,
      documentSeparator: "\n-----------\n",
      documentPrompt: new PromptTemplate({
        inputVariables: ["caseId", "url", "page_content"],
        template: `caseId: {caseId}
        url: {url} 
        page content: {page_content}`,
      }),
    });
  }
  return { vectorStore, combineDocsChains };
}
