import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import {
  QNA_PROMPT,
  RETRIEVER_PROMPT,
  IMAGE_PROMPT,
} from "@/utils/prompt-templates";
import initialiseVectorStore from "@/utils/db";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { PromptTemplate } from "@langchain/core/prompts";

export async function getRetriever(query: string, llm: ChatOllama) {
  const retreiverLLM = new ChatOllama({
    model: "llama3:instruct",
    temperature: 0,
  });

  const selectRetrieverChain = RETRIEVER_PROMPT.pipe(retreiverLLM);

  const response = await selectRetrieverChain.invoke({
    query: query,
  });

  // Retrieve the vector store
  const { embeddings } = await initialiseVectorStore();

  let vectorStore;
  let combineDocsChains;

  if (response.content === "Image Lookup") {
    vectorStore = await Chroma.fromExistingCollection(embeddings, {
      collectionName: "images",
      url: process.env.CHROMA_DB_URL!,
    });
    combineDocsChains = await createStuffDocumentsChain({
      llm: llm,
      prompt: IMAGE_PROMPT,
      documentSeparator: "\n-----------\n",
      documentPrompt: new PromptTemplate({
        inputVariables: ["caseId", "url", "page_content"],
        template: `caseId: {caseId}
          url: {url} 
          page content: {page_content}`,
      }),
    });
  } else {
    vectorStore = await Chroma.fromExistingCollection(embeddings, {
      collectionName: "text",
      url: process.env.CHROMA_DB_URL!,
    });
    combineDocsChains = await createStuffDocumentsChain({
      llm: llm,
      prompt: QNA_PROMPT,
      documentSeparator: "\n-----------\n",
      documentPrompt: new PromptTemplate({
        inputVariables: ["caseId", "url", "page_content"],
        template: `caseId: {caseId}
          url: {url} 
          page content: {page_content}`,
      }),
    });
  }
  return { vectorStore, combineDocsChains };
}
