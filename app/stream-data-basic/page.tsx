"use client";

import { useChat } from "ai/react";
import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Chat() {
  const [caseId, setCaseId] = useState("");

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/stream-data-basic",
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

      <form onSubmit={handleSubmit}>
        <input
          className="fixed w-full max-w-md bottom-0 border border-gray-300 rounded mb-8 shadow-xl p-2"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
        <input
          className="fixed bottom-0 left-5 min-w-5 border border-gray-300 rounded mb-8 shadow-xl p-2"
          value={caseId}
          placeholder="Case ID"
          id="caseId"
          onChange={(e) => setCaseId(e.target.value)}
          required
        />
        <button
          className="fixed bottom-0 right-5 border border-gray-300 rounded mb-8 shadow-xl p-2"
          type="submit"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
