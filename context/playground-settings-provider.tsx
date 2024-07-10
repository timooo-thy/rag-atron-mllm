"use client";

import { Model } from "@/lib/type";
import { Message } from "ai/react/dist";
import { createContext, use, useEffect, useState } from "react";

type PlaygroundSettingsContextType = {
  caseId: string;
  setCaseId: React.Dispatch<React.SetStateAction<string>>;
  temperature: number | undefined;
  setTemperature: React.Dispatch<React.SetStateAction<number>>;
  context: number;
  setContext: React.Dispatch<React.SetStateAction<number>>;
  similarity: number;
  setSimilarity: React.Dispatch<React.SetStateAction<number>>;
  modelName: Model | null;
  setModelName: React.Dispatch<React.SetStateAction<Model | null>>;
  caseEmbedId: string;
  setCaseEmbedId: React.Dispatch<React.SetStateAction<string>>;
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  chatFiles: File[] | [];
  setChatFiles: React.Dispatch<React.SetStateAction<File[]>>;
  chatHistory: Message[];
  setChatHistory: React.Dispatch<React.SetStateAction<Message[]>>;
};

export const PlaygroundSettingsContext =
  createContext<PlaygroundSettingsContextType | null>(null);

type PlaygroundSettingsProviderProps = {
  children: React.ReactNode;
};
export default function PlaygroundSettingsProvider({
  children,
}: PlaygroundSettingsProviderProps) {
  const [caseId, setCaseId] = useState("");
  const [temperature, setTemperature] = useState<number>(0.4);
  const [context, setContext] = useState(6);
  const [similarity, setSimilarity] = useState(4);
  const [modelName, setModelName] = useState<Model | null>(null);
  const [caseEmbedId, setCaseEmbedId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [chatFiles, setChatFiles] = useState<File[]>([]);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setChatHistory(
        JSON.parse(window.localStorage.getItem("chatHistory") || "[]")
      );
    }
  }, []);

  useEffect(() => {
    if (chatHistory.length > 0) {
      window.localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  return (
    <PlaygroundSettingsContext.Provider
      value={{
        caseId,
        setCaseId,
        temperature,
        setTemperature,
        context,
        setContext,
        similarity,
        setSimilarity,
        modelName,
        setModelName,
        caseEmbedId,
        setCaseEmbedId,
        file,
        setFile,
        chatFiles,
        setChatFiles,
        chatHistory,
        setChatHistory,
      }}
    >
      {children}
    </PlaygroundSettingsContext.Provider>
  );
}
