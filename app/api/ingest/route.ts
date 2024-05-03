import { NextRequest, NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PineconeStore } from "@langchain/pinecone";
import initialiseVectorStore from "@/utils/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const text = body.text;
  const modelName = body.modelName;

  try {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 256,
      chunkOverlap: 20,
      separators: ["["],
    });

    const splitDocuments = await splitter.createDocuments([text]);

    //TODO: Add caseId to metadata
    for (var doc of splitDocuments) {
      doc.metadata["caseId"] = 12345;
    }

    const { embeddings, pineconeIndex } = await initialiseVectorStore(
      modelName
    );

    await PineconeStore.fromDocuments(splitDocuments, embeddings, {
      pineconeIndex: pineconeIndex,
      maxConcurrency: 5,
      namespace: "text",
    });

    console.log(
      `Successfully indexed ${splitDocuments.length} documents in vector db.`
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
