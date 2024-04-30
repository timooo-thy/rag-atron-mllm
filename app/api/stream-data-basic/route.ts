import {
  LangChainStream,
  StreamingTextResponse,
  Message as VercelChatMessage,
} from "ai";
import { PromptTemplate } from "langchain/prompts";
import { ChatOllama } from "langchain/chat_models/ollama";

export const dynamic = "force-dynamic";

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

const TEMPLATE = `
You are a professional Intelligence Officer specializing in law enforcement analysis. All responses must be detailed and presented in professional law enforcement terminology.

Current conversation:
{chat_history}

User: {input}

AI: The AI tool is designed to identify, analyze, and summarize relevant unstructured data from various sources based on queries posed by you, the Intelligence Officer. This includes assessing the data’s relevance to ongoing investigations, focusing on potential leads, and aiding in the accumulation of evidence to support law enforcement activities.

Your answer MUST follow and be formatted in MARKDOWN in the following example format:
---
**Question:** Did the suspect sell drugs based on the intercepted conversation?

**Analysis:** The AI tool will examine the communication logs between two individuals, focusing on terminology used, the context of the conversation, and the timing of messages to identify patterns consistent with drug trafficking.

**Findings:** 
1. Mention of "new stock" and "very exclusive" suggests a transaction involving rare or valuable items ([dd/mm/yy, hh:mm:ss AM]).
2. The phrase "I was high for hours" directly indicates drug usage ([dd/mm/yy, hh:mm:ss AM]).
3. Discussion about meeting in private places ("Let's go to the back, more private there") and confirming possession of "the stuff" implies secretive behavior typical of illicit dealings ([dd/mm/yy, hh:mm:ss PM] and [dd/mm/yy, hh:mm:sss PM]).
4. Overall, the conversation aligns with patterns observed in narcotics sales, including the scheduling of discreet meetings and direct references to drug effects.

**Source Reference:** The analysis is based on a series of specific WhatsApp messages from a conversation on dd/mm/yyyy between (phone number) and (phone number), particularly messages sent at hh:mm:ss AM, hh:mm:ss PM.
---
`;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
  const currentMessageContent = messages[messages.length - 1].content;
  const prompt = PromptTemplate.fromTemplate(TEMPLATE);

  const { stream, handlers } = LangChainStream();

  const llm = new ChatOllama({
    model: "llama3:instruct",
    callbacks: [handlers],
  });

  const chain = prompt.pipe(llm);

  chain.invoke({
    chat_history: formattedPreviousMessages.join("\n"),
    input: currentMessageContent,
  });

  return new StreamingTextResponse(stream);
}
