import { NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PineconeStore } from "@langchain/pinecone";
import initialiseVectorStore from "@/utils/db";
import { Model } from "@/lib/type";

export const dynamic = "force-dynamic";

type Request = {
  json: () => Promise<{
    text: string;
    modelName: Model;
    caseEmbedId: string;
  }>;
};

export async function POST(req: Request) {
  const { text, modelName, caseEmbedId } = await req.json();

  try {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 256,
      chunkOverlap: 20,
      separators: ["["],
    });

    const splitDocuments = await splitter.createDocuments([text]);

    for (var doc of splitDocuments) {
      doc.metadata["caseId"] = parseInt(caseEmbedId);
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
