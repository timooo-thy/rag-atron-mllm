import {
  LangChainStream,
  StreamingTextResponse,
  Message as VercelChatMessage,
} from "ai";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { vectorStore } from "@/utils/db";
import { QNA_PROMPT, REPHASE_PROMPT } from "@/utils/prompt-templates";
import { ScoreThresholdRetriever } from "langchain/retrievers/score_threshold";

export const dynamic = "force-dynamic";

const formatMessage = (message: VercelChatMessage) => {
  return message.role === "user"
    ? new HumanMessage(message.content)
    : new AIMessage(message.content);
};

export async function POST(req: Request) {
  const { messages, caseId } = await req.json();

  const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
  const currentMessageContent = messages[messages.length - 1].content;

  // Initialise ChatOllama model with stream and handlers
  const { stream, handlers } = LangChainStream();

  const llm = new ChatOllama({
    model: "llama3:70b",
    callbacks: [handlers],
    temperature: 0.3,
  });

  const rephrasingLLM = new ChatOllama({
    model: "llama3:70b",
    temperature: 0.3,
  });

  // Retrieve the vector store
  const retriever = (await vectorStore()).asRetriever({
    k: 3,
    filter: { caseId: parseInt(caseId) },
  });

  // const retriever = ScoreThresholdRetriever.fromVectorStore(
  //   await vectorStore(),
  //   {
  //     filter: { caseId: parseInt(caseId) },
  //     minSimilarityScore: 0.01,
  //     maxK: 50,
  //     kIncrement: 2,
  //   }
  // );

  // Create history aware retriever chain
  const historyAwareRetrieverChain = await createHistoryAwareRetriever({
    llm: rephrasingLLM,
    retriever: retriever,
    rephrasePrompt: REPHASE_PROMPT,
  });

  // RAG pipeline
  const combineDocsChains = await createStuffDocumentsChain({
    llm: llm,
    prompt: QNA_PROMPT,
    documentSeparator: "\n-----------\n",
  });

  const retrieverChain = await createRetrievalChain({
    combineDocsChain: combineDocsChains,
    retriever: historyAwareRetrieverChain,
  });

  // Invoke the chain and stream response back
  retrieverChain.invoke({
    chat_history: formattedPreviousMessages,
    input: currentMessageContent,
    case_id: caseId,
  });

  return new StreamingTextResponse(stream);
}
