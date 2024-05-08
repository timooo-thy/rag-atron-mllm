import { NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PineconeStore } from "@langchain/pinecone";
import initialiseVectorStore from "@/utils/db";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { embedTextSchema } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();
  const result = embedTextSchema.parse(body);
  const { caseEmbedId, text } = result;

  try {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 256,
      chunkOverlap: 20,
      separators: ["["],
    });

    const splitDocuments = await splitter.createDocuments([text]);

    for (var doc of splitDocuments) {
      doc.metadata["caseId"] = caseEmbedId;
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

    // await PineconeStore.fromDocuments(splitDocuments, embeddings, {
    //   pineconeIndex: pineconeIndex,
    //   maxConcurrency: 5,
    //   namespace: "text",
    // });

    console.log(
      `Successfully indexed ${splitDocuments.length} documents in vector db.`
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
