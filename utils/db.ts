import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";

// Initialise Pinecone, PineconeStore, and OllamaEmbeddings
const pinecone = new Pinecone();
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);
const embeddings = new OllamaEmbeddings({
  model: "llama3",
});

const vectorStore = async () =>
  await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: "test",
  });

export { vectorStore, pineconeIndex, embeddings };
