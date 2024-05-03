"use client";

import { useChat } from "ai/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import { formSchema } from "@/lib/utils";
import { toast } from "sonner";
import SideNav from "@/components/side-nav";
import MobileDrawer from "@/components/mobile-drawer";
import Settings from "@/components/settings";
import TestPrompts from "@/components/test-prompts";
import MessageContainer from "@/components/message-container";
import EmbedFilesButton from "@/components/embed-files-button";
import UploadFilesButton from "@/components/upload-files-button";
import MicrophoneButton from "@/components/microphone-button";
import SendMessageButton from "@/components/send-message-button";
import TextContainer from "@/components/text-container";
import { Model } from "@/lib/type";
import { usePlaygroundSettings } from "@/lib/hooks";

export default function Chat() {
  const {
    caseId,
    setCaseId,
    similarity,
    setSimilarity,
    context,
    setContext,
    temperature,
    setTemperature,
  } = usePlaygroundSettings();
  const [modelName, setModelName] = useState<Model | null>(null);
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setInput,
    isLoading,
  } = useChat({
    api: "/api/chat-rag",
    body: {
      caseId: caseId,
      temperature: temperature,
      similarity: similarity,
      context: context,
      modelName: modelName,
    },
  });

  const handleMessageSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = formSchema.safeParse({
      caseId,
      temperature,
      similarity,
      context,
    });

    if (!result.success) {
      toast.warning(result.error.errors[0].message);
      return;
    }
    handleSubmit(e);
  };

  return (
    <div className="grid h-screen w-full pl-[53px]">
      <TooltipProvider>
        <SideNav />
        <div className="flex flex-col">
          <MobileDrawer setInput={setInput} />
          <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="relative hidden flex-col items-start gap-8 md:flex">
              <form className="grid w-full items-start gap-6">
                <Settings />
                <TestPrompts setInput={setInput} />
                <EmbedFilesButton />
              </form>
            </div>
            <div className="relative flex h-full min-h-[50dvh] max-h-[90dvh] flex-col rounded-xl bg-muted/50 p- lg:col-span-2 border-2 ">
              <MessageContainer messages={messages} />
              <form
                className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
                onSubmit={handleMessageSubmit}
              >
                <TextContainer
                  input={input}
                  handleInputChange={handleInputChange}
                />
                <div className="flex items-center p-3 pt-0">
                  <UploadFilesButton />
                  <MicrophoneButton />
                  <SendMessageButton input={input} isLoading={isLoading} />
                </div>
              </form>
            </div>
          </main>
        </div>
      </TooltipProvider>
    </div>
  );
}
