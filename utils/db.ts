import { OpenAIEmbeddings } from "@langchain/openai";

const initialiseVectorStore = async () => {
  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-large",
  });

  return { embeddings };
};

export default initialiseVectorStore;
