"use client";

import { Message, useChat } from "ai/react";
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
import { useRef, useState } from "react";
import { encode } from "base64-arraybuffer";
import { uuid } from "short-uuid";

export default function Chat() {
  const {
    caseId,
    similarity,
    context,
    temperature,
    modelName,
    chatFiles,
    setChatFiles,
    setChatHistory,
    chatHistory,
  } = usePlaygroundSettings();
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
    setInput,
    isLoading,
  } = useChat({
    api: "/api/chat-rag",
    onFinish(message) {
      addMessages(message);
    },
    generateId() {
      return uuid();
    },
    initialMessages: chatHistory,
    onResponse() {
      setIsInitialLoading(false);
    },
  });

  const addMessages = (message: Message) => {
    setChatHistory((prev) => [...prev, message]);
  };

  const handleMessageSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const readFiles = (files: File[]): Promise<string[]> => {
      return Promise.all(
        files.map((file) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
              if (e.target && e.target.result) {
                // Convert the ArrayBuffer from readAsArrayBuffer to a Base64 string
                if (
                  file.type.match("audio/mpeg") &&
                  e.target.result instanceof ArrayBuffer
                ) {
                  const base64String = encode(e.target.result);
                  resolve(base64String);
                } else {
                  resolve(e.target.result as string);
                }
              } else {
                reject(new Error("Failed to read file"));
              }
            };

            reader.onerror = (error) =>
              reject(new Error("Error reading file: " + error));

            if (file.type.match("audio/mpeg")) {
              reader.readAsArrayBuffer(file);
            } else if (
              file.type.match("image/*") ||
              file.type.match("video/*")
            ) {
              reader.readAsDataURL(file);
            } else {
              reject(new Error("Unsupported file type"));
            }
          });
        })
      );
    };

    const base64Files = await readFiles(chatFiles);

    const allFilesAreAudioOrImage = (files: File[]) => {
      if (files.length === 0) {
        return true;
      }
      // Determine if the first file is image or audio
      const isImage = files[0].type.startsWith("image/");
      const isAudio = files[0].type.startsWith("audio/");
      const isVideo = files[0].type.startsWith("video/");

      return files.every((file) => {
        return (
          (isImage && file.type.startsWith("image/")) ||
          (isAudio && file.type.startsWith("audio/")) ||
          (isVideo && file.type.startsWith("video/"))
        );
      });
    };

    if (!allFilesAreAudioOrImage(chatFiles)) {
      return toast.warning("Mix of audio/video/image files are not supported");
    }

    const checkFileType = (files: File[]) => {
      if (files.length === 0) {
        return null;
      }

      if (files[0].type.startsWith("video/")) {
        return "video";
      } else if (files[0].type.startsWith("audio/")) {
        return "audio";
      } else if (files[0].type.startsWith("image/")) {
        return "image";
      }
    };

    const fileType = checkFileType(chatFiles);

    const result = formSchema.safeParse({
      caseId,
      temperature,
      similarity,
      context,
      modelName,
      base64Files,
      fileType,
    });

    if (!result.success) {
      toast.warning(result.error.errors[0].message);
      return;
    }

    const currentMessage: Message = {
      id: uuid(),
      role: "user",
      content: input,
    };

    addMessages(currentMessage);

    setIsInitialLoading(true);

    handleSubmit(e, {
      options: {
        body: {
          caseId: caseId,
          temperature: temperature,
          similarity: similarity,
          context: context,
          modelName: modelName,
          chatFilesBase64: base64Files,
          fileType: fileType,
        },
      },
    });
    setChatFiles([]);
  };

  return (
    <div className="grid h-dvh w-full pl-[53px]">
      <TooltipProvider>
        <SideNav setMessages={setMessages} />
        <div className="flex flex-col m-auto lg:w-[80%] w-full h-dvh">
          <MobileDrawer setInput={setInput} />
          <main className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3 flex-1 overflow-hidden">
            <div className="relative hidden flex-col items-start gap-8 md:flex">
              <form className="grid w-full items-start gap-6">
                <Settings />
                <TestPrompts setInput={setInput} />
                <EmbedFiles />
              </form>
            </div>
            <div className="relative flex flex-col rounded-xl bg-muted/50 border-2 col-span-2 h-full overflow-hidden">
              <div className="flex-1 overflow-auto">
                <MessageContainer
                  messages={messages}
                  isInitialLoading={isInitialLoading}
                  isLoading={isLoading}
                />
              </div>
              <div className="p-1">
                <form
                  className="pb-2 relative overflow-hidden rounded-xl border focus-within:ring-1 focus-within:ring-ring"
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
            </div>
          </main>
        </div>
      </TooltipProvider>
    </div>
  );
}
