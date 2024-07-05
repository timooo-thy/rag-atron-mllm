import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";

const initialiseVectorStore = async () => {
  // Embeddings for text
  const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text",
  });

  return { embeddings };
};

export default initialiseVectorStore;
