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

type Request = {
  json: () => Promise<{
    messages: VercelChatMessage[];
    caseId: string;
    temperature: number;
    similarity: number;
    context: number;
  }>;
};

export async function POST(req: Request) {
  const { messages, caseId, temperature, similarity, context } =
    await req.json();

  const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
  // Get the latest k buffer window (memory)
  const latestKBufferWindow =
    context === 0 ? [] : formattedPreviousMessages.slice(-context);
  const currentMessageContent = messages[messages.length - 1].content;

  // Initialise ChatOllama model with stream and handlers
  const { stream, handlers } = LangChainStream();

  const llm = new ChatOllama({
    model: "llama3:70b-instruct",
    callbacks: [handlers],
    temperature: temperature,
  });

  const rephrasingLLM = new ChatOllama({
    model: "llama3:70b-instruct",
    temperature: temperature,
  });

  // Retrieve the vector store
  const retriever = (await vectorStore()).asRetriever({
    k: similarity,
    filter: { caseId: parseInt(caseId) },
  });

  // const results = await (
  //   await vectorStore()
  // ).similaritySearchWithScore(
  //   "new stock high-quality substance effects hours duration online purchase Singapore numbers 65 81234567",
  //   6,
  //   {
  //     caseId: parseInt(caseId),
  //   }
  // );

  // console.log(results);

  // const retriever = ScoreThresholdRetriever.fromVectorStore(
  //   await vectorStore(),
  //   {
  //     filter: { caseId: parseInt(caseId) },
  //     minSimilarityScore: 0.2,
  //     maxK: 10,
  //     kIncrement: 1,
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
    chat_history: latestKBufferWindow,
    input: currentMessageContent,
    case_id: caseId,
  });

  return new StreamingTextResponse(stream);
}
