import {
  StreamingTextResponse,
  Message,
} from 'ai';
import { ChatOllama } from "langchain/chat_models/ollama";
import { AIMessage, HumanMessage } from 'langchain/schema';
import { BytesOutputParser } from 'langchain/schema/output_parser';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const llm = new ChatOllama({
    model: "llava:13b",
    baseUrl:"http://localhost:11434",
  });

  const parser = new BytesOutputParser();

  const stream = await llm
  .pipe(parser)
  .stream(
    (messages as Message[]).map((m) =>
      m.role == "user"
        ? new HumanMessage(m.content)
        : new AIMessage(m.content)
    )
  );
  return new StreamingTextResponse(stream);
}
