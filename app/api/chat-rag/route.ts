import {
  LangChainStream,
  StreamingTextResponse,
  Message as VercelChatMessage,
} from "ai";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import {
  REPHRASE_PROMPT,
  QNA_PROMPT,
  RETRIEVER_PROMPT,
  IMAGE_PROMPT,
} from "@/utils/prompt-templates";
import { PromptTemplate } from "@langchain/core/prompts";
import { ScoreThresholdRetriever } from "langchain/retrievers/score_threshold";
import initialiseVectorStore from "@/utils/db";
import { formSchema } from "@/lib/utils";

export const dynamic = "force-dynamic";

const formatMessage = (message: VercelChatMessage) => {
  return message.role === "user"
    ? new HumanMessage(
        "<|start_header_id|>user<|end_header_id|>" +
          message.content +
          "<|eot_id|>"
      )
    : new AIMessage(
        "<|start_header_id|>assistant<|end_header_id|>" +
          message.content +
          "<|eot_id|>"
      );
};

type Content = {
  type: string;
  text?: string;
  image_url?: string;
};

export async function POST(req: Request) {
  const body = await req.json();
  const result = formSchema.parse(body);
  const {
    messages,
    caseId,
    temperature,
    similarity,
    context,
    modelName,
    chatFilesBase64,
  } = result;
  const typedMessages = messages as VercelChatMessage[];

  const formattedPreviousMessages = typedMessages
    .slice(0, -1)
    .map(formatMessage);
  // Get the latest k buffer window (memory)
  const latestKBufferWindow =
    context === 0 ? [] : formattedPreviousMessages.slice(-context);
  const currentMessageContent =
    "<|start_header_id|>user<|end_header_id|>" +
    typedMessages[typedMessages.length - 1].content +
    "<|eot_id|>";

  // Initialise ChatOllama model with stream and handlers
  const { stream, handlers } = LangChainStream();

  const llm = new ChatOllama({
    model:
      chatFilesBase64 && chatFilesBase64.length > 0 ? "llava:13b" : modelName,
    callbacks: [handlers],
    temperature: temperature,
  });

  const rephrasingLLM = new ChatOllama({
    model: modelName,
    temperature: temperature,
  });

  if (chatFilesBase64 && chatFilesBase64.length > 0) {
    console.log("Describe Image with LLaVa");

    let content: Content[] = [
      {
        type: "text",
        text: `For each image, describe the image with details to be used as exhibit captioning. 
        Use markdown table format with exhibition names and descriptions. 
        Each row in the table tallies to one image with its own description.
        User Query: ${currentMessageContent}`,
      },
    ];

    chatFilesBase64.map((url) => {
      content.push({
        type: "image_url",
        image_url: url,
      });
    });

    llm.invoke([
      new HumanMessage({
        content: content,
      }),
    ]);
  } else {
    const { vectorStore, combineDocsChains } = await getRetriever(
      currentMessageContent,
      llm
    );

    const retriever = vectorStore.asRetriever({
      k: similarity,
      filter: { caseId: caseId },
    });

    // const retriever = ScoreThresholdRetriever.fromVectorStore(vectorStore, {
    //   filter: { caseId: caseId },
    //   minSimilarityScore: 0.4,
    //   maxK: 20,
    //   kIncrement: 1,
    // });

    // Create history aware retriever chain
    const historyAwareRetrieverChain = await createHistoryAwareRetriever({
      llm: rephrasingLLM,
      retriever: retriever,
      rephrasePrompt: REPHRASE_PROMPT,
    });

    // RAG pipeline
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
  }

  return new StreamingTextResponse(stream);
}

async function getRetriever(query: string, llm: ChatOllama) {
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
  }
  // else if (response.content === "Describe Image") {
  //   return { vectorStore: null, combineDocsChains: null };
  // }
  else {
    vectorStore = await Chroma.fromExistingCollection(embeddings, {
      collectionName: "text",
      url: process.env.CHROMA_DB_URL!,
    });
    combineDocsChains = await createStuffDocumentsChain({
      llm: llm,
      prompt: QNA_PROMPT,
      documentSeparator: "\n-----------\n",
    });
  }
  return { vectorStore, combineDocsChains };
}
