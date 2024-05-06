import { NextResponse } from "next/server";
import initialiseVectorStore from "@/utils/db";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { HumanMessage } from "@langchain/core/messages";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Model } from "@/lib/type";
import { ChromaClient } from "chromadb";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const modelName = formData.get("modelName") as Model;
  const caseId = formData.get("caseId") as string;

  // Create s3 client
  const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_BUCKET_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  try {
    const uuid = uuidv4();

    // Upload image to s3
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: uuid,
      Body: file,
      Metadata: {
        caseId: caseId,
      },
    });

    const signedURL = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 60,
    });

    await fetch(signedURL, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    // Fetch image from s3 and convert to ArrayBuffer
    const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uuid}`;
    const fetchImageUrl = await fetch(imageUrl);
    const responseArrBuffer = await fetchImageUrl.arrayBuffer();

    // Describe image using llava:13b model
    const llm = new ChatOllama({
      model: "llava:13b",
      temperature: 0.5,
    });

    const res = await llm.invoke([
      new HumanMessage({
        content: [
          {
            type: "text",
            text: "Describe this image succinctly under 30 words to be used as a search query in a vector database.",
          },
          {
            type: "image_url",
            image_url: `${Buffer.from(responseArrBuffer).toString("base64")}`,
          },
        ],
      }),
    ]);

    const { embeddings } = await initialiseVectorStore(modelName);

    // const client = new ChromaClient({
    //   path: process.env.CHROMA_DB_URL!,
    // });

    // await client.deleteCollection({ name: "images" });
    // console.log(await client.listCollections());

    // Store image description in vector database with url in metadata
    await Chroma.fromTexts(
      [res.content as string],
      [{ id: uuid, url: imageUrl, caseId: parseInt(caseId) }],
      embeddings,
      {
        collectionName: "images",
        url: process.env.CHROMA_DB_URL!,
        collectionMetadata: {
          "hnsw:space": "cosine",
        },
      }
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
