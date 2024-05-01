"use client";

import { EnterIcon } from "@radix-ui/react-icons";
import { useChat } from "ai/react";
import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { z } from "zod";

const caseIdSchema = z.coerce.number().int();

export default function Chat() {
  const [caseId, setCaseId] = useState("");

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat-rag",
    body: { caseId: caseId },
  });

  return (
    <div className="mx-auto w-full max-w-md py-24 flex flex-col stretch">
      {messages.length > 0
        ? messages.map((m) => (
            <div key={m.id} className="prose">
              <Markdown remarkPlugins={[remarkGfm]}>
                {m.role === "user" ? "User: " : "AI: "}
              </Markdown>
              <Markdown remarkPlugins={[remarkGfm]}>{m.content}</Markdown>
            </div>
          ))
        : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const parsedCaseId = caseIdSchema.safeParse(caseId);
          if (!parsedCaseId.success) {
            alert("Case ID must be a 5 digit number");
            setCaseId("");
            return;
          }
          handleSubmit(e);
        }}
      >
        <div className="fixed flex bottom-0 space-x-4 mb-8 ">
          <div className="relative">
            <input
              className="w-full h-min max-w-md border pr-7 border-gray-300 rounded shadow-xl p-2"
              value={input}
              placeholder="Say something..."
              onChange={handleInputChange}
              required
            />
            <button type="submit" className="absolute right-2 top-[0.8rem] ">
              <EnterIcon />
            </button>
          </div>
          <input
            className="w-[100px] border border-gray-300 rounded shadow-xl p-2"
            value={caseId}
            placeholder="Case ID"
            onChange={(e) => setCaseId(e.target.value)}
            required
          />
        </div>
      </form>
    </div>
  );
}
