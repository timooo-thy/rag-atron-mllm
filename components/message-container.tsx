import { Message } from "ai";
import Image from "next/image";
import React, { useEffect, useMemo, useRef } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { toast } from "sonner";
import { Bot, Copy } from "lucide-react";
import { Button } from "./ui/button";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { usePlaygroundSettings } from "@/lib/hooks";
import BouncingDotsLoader from "./bouncing-dots-loader";

type MessageContainerProps = {
  messages: Message[];
  isInitialLoading: boolean;
  isLoading: boolean;
};

export default function MessageContainer({
  messages,
  isInitialLoading,
}: MessageContainerProps) {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const { chatHistory } = usePlaygroundSettings();
  const newMessages = useMemo(() => {
    return messages.filter((m) => !chatHistory.some((c) => c.id === m.id));
  }, [messages, chatHistory]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "instant" });
  }, [chatHistory, messages]);

  if (messages.length === 0 && chatHistory.length === 0) {
    return (
      <div className="flex justify-center flex-col items-center h-full font-semibold">
        <p>How can I assist you?</p>
        <p>Send a message to get started!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-y-auto md:px-4 md:pt-8 pt-4 pb-0 px-2 h-full w-full">
      {chatHistory.length > 0 &&
        chatHistory.map((m) => (
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
                <p className="font-bold">RAG-aTron AI</p>
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
              className="mb-10 [&>h3]:my-3 [&>h2]:my-3 [&>h1]:my-3 [&>table]:text-center [&>table>tbody>tr>td>img]:m-auto [&>table>tbody>tr>td]:align-middle [&>table>tbody>tr>td]:m-auto rounded-medium text-medium bg-background md:px-8 px-5 py-1 mt-2 shadow-md dark:shadow-lg dark:bg-slate-800"
            >
              {m.content}
            </Markdown>
          </div>
        ))}
      {newMessages.length > 0 &&
        newMessages.slice(-1).map((m) => (
          <div key={m.id} className="prose !max-w-full px-4">
            {m.role === "assistant" && (
              <>
                <div className="flex items-center gap-3 h-[24px]">
                  <Bot className="w-6 h-6 rounded-full p-1 ring-2 ring-black/30 dark:ring-secondary/40" />
                  <p className="font-bold">RAG-aTron AI</p>
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

                <Markdown
                  remarkPlugins={[remarkGfm]}
                  className="mb-10 [&>h3]:my-3 [&>h2]:my-3 [&>h1]:my-3 [&>table]:text-center [&>table>tbody>tr>td>img]:m-auto [&>table>tbody>tr>td]:align-middle [&>table>tbody>tr>td]:m-auto rounded-medium text-medium bg-background md:px-8 px-5 py-1 mt-2 shadow-md dark:shadow-lg dark:bg-slate-800"
                >
                  {m.content}
                </Markdown>
              </>
            )}
          </div>
        ))}
      {isInitialLoading && (
        <div
          className="flex justify-start pl-5 pb-2 items-center"
          ref={loaderRef}
        >
          <BouncingDotsLoader />
        </div>
      )}
      <div ref={endOfMessagesRef} />
    </div>
  );
}
