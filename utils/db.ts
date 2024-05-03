import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { UpstashVectorStore } from "@langchain/community/vectorstores/upstash";
import { Index } from "@upstash/vector";
import { Model } from "@/lib/type";

const initialiseVectorStore = async (modelName: Model) => {
  // Initialise Pinecone, PineconeStore, and OllamaEmbeddings
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
  const pineconeIndex = pinecone.Index(
    modelName == "llama3:instruct"
      ? process.env.PINECONE_INDEX_LLAMA!
      : process.env.PINECONE_INDEX_LLAMA_70B!
  );

  const embeddings = new OllamaEmbeddings({
    model: modelName,
  });

  // Creating the index from the environment variables automatically.
  // const indexFromEnv = new Index();

  // const vectorStore = async () =>
  //   new UpstashVectorStore(embeddings, {
  //     index: indexFromEnv,
  //   });

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: "text",
  });

  return { vectorStore, pineconeIndex, embeddings };
};

export default initialiseVectorStore;
