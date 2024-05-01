import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { UpstashVectorStore } from "@langchain/community/vectorstores/upstash";
import { Index } from "@upstash/vector";

// Initialise Pinecone, PineconeStore, and OllamaEmbeddings
const pinecone = new Pinecone();
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);

const embeddings = new OllamaEmbeddings({
  model: "llama3:70b",
});

// Creating the index from the environment variables automatically.
// const indexFromEnv = new Index();

// const vectorStore = async () =>
//   new UpstashVectorStore(embeddings, {
//     index: indexFromEnv,
//   });

const vectorStore = async () =>
  await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: "test",
  });

export { vectorStore, pineconeIndex, embeddings };
