import { NextRequest, NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PineconeStore } from "@langchain/pinecone";
import { embeddings, pineconeIndex } from "@/utils/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const text = body.text;

  try {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 256,
      chunkOverlap: 20,
    });

    const splitDocuments = await splitter.createDocuments([text]);

    for (var doc of splitDocuments) {
      doc.metadata["caseId"] = 10932;
    }

    await PineconeStore.fromDocuments(splitDocuments, embeddings, {
      pineconeIndex: pineconeIndex,
      maxConcurrency: 5,
      namespace: "test",
    });

    console.log(
      `Successfully indexed ${splitDocuments.length} documents in Pinecone`
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
