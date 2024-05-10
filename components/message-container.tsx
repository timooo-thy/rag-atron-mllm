import { Message } from "ai";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { toast } from "sonner";
import { Bot, Copy } from "lucide-react";
import { Button } from "./ui/button";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MessageContainerProps = {
  messages: Message[];
};
export default function MessageContainer({ messages }: MessageContainerProps) {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col overflow-y-auto md:px-4 md:pt-8 pt-4 px-2 pb-0 h-full w-full">
      {messages.length > 0 ? (
        messages.map((m) => (
          <div key={m.id} className="prose !max-w-full px-4">
            {m.role === "user" ? (
              <div className="flex items-center gap-3 h-[24px]">
                <Image
                  src="/user.svg"
                  className="w-6 h-6 rounded-full ring-2 bg-transparent ring-black/30 dark:ring-secondary/40"
                  width={24}
                  height={24}
                  alt="User"
                />
                <p className="font-bold">You</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-lg ml-auto text-slate-400/70 transition hover:text-slate-700"
                      aria-label="Copy"
                      onClick={() => {
                        navigator.clipboard.writeText(m.content);
                        toast.success("Copied to clipboard!");
                      }}
                    >
                      <Copy className="size-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Copy</TooltipContent>
                </Tooltip>
              </div>
            ) : (
              <div className="flex items-center gap-3 h-[24px]">
                <Bot className="w-6 h-6 rounded-full p-1 ring-2 ring-black/30 dark:ring-secondary/40" />
                <p className="font-bold">NarcoNet AI</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-lg ml-auto text-slate-400/70 transition hover:text-slate-700"
                      aria-label="Copy"
                      onClick={() => {
                        navigator.clipboard.writeText(m.content);
                        toast.success("Copied to clipboard!");
                      }}
                    >
                      <Copy className="size-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Copy</TooltipContent>
                </Tooltip>
              </div>
            )}
            <Markdown
              remarkPlugins={[remarkGfm]}
              className="mb-10 [&>table]:text-center [&>table>tbody>tr>td>img]:m-auto [&>table>tbody>tr>td]:align-middle [&>table>tbody>tr>td]:m-auto rounded-medium text-medium bg-background md:px-8 px-5 py-1 mt-2 shadow-md dark:shadow-lg dark:bg-slate-800"
            >
              {m.content}
            </Markdown>
          </div>
        ))
      ) : (
        <div className="flex justify-center items-center h-full font-semibold">
          <p>Upload a conversation first!</p>
        </div>
      )}
      <div ref={endOfMessagesRef} />
    </div>
  );
}
