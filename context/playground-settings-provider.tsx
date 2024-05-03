"use client";

import { Model } from "@/lib/type";
import { createContext, useRef, useState } from "react";

type PlaygroundSettingsContextType = {
  caseId: string;
  setCaseId: React.Dispatch<React.SetStateAction<string>>;
  temperature: number | undefined;
  setTemperature: React.Dispatch<React.SetStateAction<number | undefined>>;
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
  const [temperature, setTemperature] = useState<number | undefined>(undefined);
  const [context, setContext] = useState(6);
  const [similarity, setSimilarity] = useState(4);
  const [modelName, setModelName] = useState<Model | null>(null);
  const [caseEmbedId, setCaseEmbedId] = useState("");

  const [file, setFile] = useState<File | null>(null);

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
      }}
    >
      {children}
    </PlaygroundSettingsContext.Provider>
  );
}
