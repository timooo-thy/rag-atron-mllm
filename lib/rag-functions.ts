import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import {
  QNA_PROMPT,
  RETRIEVER_PROMPT,
  IMAGE_PROMPT,
} from "@/utils/prompt-templates";
import { Message as VercelChatMessage } from "ai";
import initialiseVectorStore from "@/utils/db";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { PromptTemplate } from "@langchain/core/prompts";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

export const formatMessage = (message: VercelChatMessage) => {
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

export async function getRetriever(query: string, llm: ChatOllama) {
  const retrieverLLM = new ChatOllama({
    model: "llama3:instruct",
    temperature: 0,
  });

  const selectRetrieverChain = RETRIEVER_PROMPT.pipe(retrieverLLM);

  const response = await selectRetrieverChain.invoke({
    query: query + "<|eot_id|>",
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

export const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_BUCKET_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadImagesAndGenerateUrls(chatFilesBase64: string[]) {
  const uploadPromises = chatFilesBase64.map(async (file, index) => {
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

      return {
        index,
        url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uuid}`,
      };
    } catch (error) {
      console.log(error);
      return { index, url: null };
    }
  });

  const results = await Promise.all(uploadPromises);
  results.sort((a, b) => a.index - b.index);

  const imageUrls = results.map((result) => result.url);
  return imageUrls;
}

export async function uploadVideo(videoBase64: string) {
  try {
    const uuid = uuidv4();
    const buffer = Buffer.from(videoBase64.split(",")[1], "base64");

    // Upload video to s3
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: uuid,
      Body: buffer,
    });

    const signedURL = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 60,
    });

    await fetch(signedURL, {
      method: "PUT",
      body: buffer,
      headers: {
        "Content-Type": "video/mp4",
      },
    });

    // Fetch video url from s3
    const videoUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uuid}`;
    return videoUrl;
  } catch (error) {
    return "";
  }
}
