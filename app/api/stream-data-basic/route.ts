import {
  LangChainStream,
  StreamingTextResponse,
  Message as VercelChatMessage,
} from "ai";
import { PromptTemplate } from "langchain/prompts";
import { ChatOllama } from "langchain/chat_models/ollama";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { Document } from "@langchain/core/documents";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";

export const dynamic = "force-dynamic";

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

const combineDocumentsFn = (docs: Document[]) => {
  const serializedDocs = docs.map((doc) => doc.pageContent);
  return serializedDocs.join("\n\n");
};

const QNA_TEMPLATE = `
You are a professional Intelligence Officer specializing in law enforcement analysis. All responses must be detailed and presented in professional law enforcement terminology.

Current conversation:
{chat_history}

User: {input}

AI: The AI tool is designed to identify, analyse, and summarise relevant unstructured data from various sources based on queries posed by you, the Intelligence Officer. This includes assessing the data’s relevance to ongoing investigations, focusing on potential leads, and aiding in the accumulation of evidence to support law enforcement activities.

Only use the following context as data source:
Context:
{context}

If context is blank:
Reply with "No relevant context found with the case id specified. Please try again."

Your answer MUST follow if there is context and be formatted in MARKDOWN in the following example format:
---
**Question:** 

**Analysis:** 

**Findings:** 

**Source Reference:** The analysis is based on a series of specific WhatsApp messages from a conversation on dd/mm/yyyy between (phone number) and (phone number), particularly messages sent at hh:mm:ss AM, hh:mm:ss PM.
---

Make sure your answer is in proper markdown format!
`;

const QNA_PROMPT = PromptTemplate.fromTemplate(QNA_TEMPLATE);

export async function POST(req: Request) {
  const { messages, caseId } = await req.json();

  const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
  const currentMessageContent = messages[messages.length - 1].content;

  // Initialise ChatOllama model with stream and handlers
  const { stream, handlers } = LangChainStream();

  const llm = new ChatOllama({
    model: "llama3:instruct",
    callbacks: [handlers],
  });

  // Initialise Pinecone, PineconeStore, and OllamaEmbeddings
  const pinecone = new Pinecone();
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);
  const embeddings = new OllamaEmbeddings({
    model: "llama3",
  });
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: "test",
  });

  // Similarity search based on text and caseId metadata
  const results = await vectorStore.similaritySearch(currentMessageContent, 2, {
    caseId: parseInt(caseId),
  });

  console.log(results);

  const chain = QNA_PROMPT.pipe(llm);

  chain.invoke({
    chat_history: formattedPreviousMessages.join("\n"),
    input: currentMessageContent,
    context: combineDocumentsFn(results),
  });

  return new StreamingTextResponse(stream);
}
