import { NextRequest, NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const text = body.text;

  try {
    const pinecone = new Pinecone();

    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 256,
      chunkOverlap: 20,
    });

    const embeddings = new OllamaEmbeddings({
      model: "llama3",
    });

    const splitDocuments = await splitter.createDocuments([text]);

    for (var doc of splitDocuments) {
      doc.metadata["caseId"] = 10932;
    }

    await PineconeStore.fromDocuments(splitDocuments, embeddings, {
      pineconeIndex,
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
