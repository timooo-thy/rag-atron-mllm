"use client";

import { useChat } from "ai/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { formSchema } from "@/lib/utils";
import { toast } from "sonner";
import SideNav from "@/components/side-nav";
import MobileDrawer from "@/components/mobile-drawer";
import Settings from "@/components/settings";
import TestPrompts from "@/components/test-prompts";
import MessageContainer from "@/components/message-container";
import UploadFilesButton from "@/components/upload-files-button";
import MicrophoneButton from "@/components/microphone-button";
import SendMessageButton from "@/components/send-message-button";
import TextContainer from "@/components/text-container";
import { usePlaygroundSettings } from "@/lib/hooks";
import EmbedFiles from "@/components/embed-files";
import { useRef } from "react";

export default function Chat() {
  const {
    caseId,
    similarity,
    context,
    temperature,
    modelName,
    chatFiles,
    setChatFiles,
  } = usePlaygroundSettings();
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setInput,
    isLoading,
  } = useChat({
    api: "/api/chat-rag",
  });

  const handleMessageSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const readFiles = (files: File[]) => {
      return Promise.all(
        files.map((file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              if (
                e.target &&
                e.target.result &&
                typeof e.target.result === "string"
              ) {
                resolve(e.target.result);
              } else {
                reject(new Error("Failed to read file"));
              }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );
    };

    const base64Files = await readFiles(chatFiles);
    const result = formSchema.safeParse({
      caseId,
      temperature,
      similarity,
      context,
      modelName,
      base64Files,
    });

    if (!result.success) {
      toast.warning(result.error.errors[0].message);
      return;
    }
    handleSubmit(e, {
      options: {
        body: {
          caseId: caseId,
          temperature: temperature,
          similarity: similarity,
          context: context,
          modelName: modelName,
          chatFilesBase64: base64Files,
        },
      },
    });
    setChatFiles([]);
  };

  return (
    <div className="grid h-dvh w-full pl-[53px]">
      <TooltipProvider>
        <SideNav />
        <MobileDrawer setInput={setInput} />
        <div className="flex flex-col m-auto lg:w-[80%] w-full">
          <main className="grid grid-cols-1 gap-4 overflow-auto p-4 md:grid-cols-3">
            <div className="relative hidden flex-col items-start gap-8 md:flex">
              <form className="grid w-full items-start gap-6">
                <Settings />
                <TestPrompts setInput={setInput} />
                <EmbedFiles />
              </form>
            </div>
            <div className="relative flex flex-col rounded-xl bg-muted/50 border-2 col-span-2 h-[calc(100dvh-100px)]">
              <MessageContainer messages={messages} />
              <form
                className="pb-5 relative overflow-hidden rounded-lg border focus-within:ring-1 focus-within:ring-ring"
                onSubmit={handleMessageSubmit}
              >
                <TextContainer
                  input={input}
                  handleInputChange={handleInputChange}
                  submitButtonRef={submitButtonRef}
                />
                <div className="flex items-center px-3 sticky -bottom-2">
                  <UploadFilesButton />
                  <MicrophoneButton />
                  <SendMessageButton
                    input={input}
                    isLoading={isLoading}
                    submitButtonRef={submitButtonRef}
                  />
                </div>
              </form>
            </div>
          </main>
        </div>
      </TooltipProvider>
    </div>
  );
}
