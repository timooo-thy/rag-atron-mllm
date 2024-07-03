import { NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import initialiseVectorStore from "@/utils/db";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { embedTextSchema } from "@/lib/utils";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@/lib/rag-functions";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();
  const result = embedTextSchema.parse(body);
  const { caseEmbedId, text } = result;

  try {
    const uuid = uuidv4();

    // Upload image to s3
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: uuid,
      Body: text,
      Metadata: { caseId: caseEmbedId.toString() },
    });

    await s3Client.send(putObjectCommand);

    const signedURL = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 60,
    });

    await fetch(signedURL, {
      method: "PUT",
      body: new TextEncoder().encode(text),
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });

    console.log("Successfully uploaded text to s3.");

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 256,
      chunkOverlap: 20,
      separators: ["["],
    });

    const splitDocuments = await splitter.createDocuments([text]);

    for (var doc of splitDocuments) {
      doc.metadata["caseId"] = caseEmbedId;
      doc.metadata[
        "url"
      ] = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uuid}`;
    }

    const { embeddings } = await initialiseVectorStore();

    // const client = new ChromaClient({
    //   path: process.env.CHROMA_DB_URL!,
    // });
    // console.log(await client.listCollections());

    await Chroma.fromDocuments(splitDocuments, embeddings, {
      collectionName: "text",
      url: process.env.CHROMA_DB_URL!,
      collectionMetadata: {
        "hnsw:space": "cosine",
      },
    });

    console.log(
      `Successfully indexed ${splitDocuments.length} documents in vector db.`
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
