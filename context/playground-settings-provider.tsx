"use client";

import { createContext, useState } from "react";

type PlaygroundSettingsContextType = {
  caseId: string;
  setCaseId: React.Dispatch<React.SetStateAction<string>>;
  temperature: number | undefined;
  setTemperature: React.Dispatch<React.SetStateAction<number | undefined>>;
  context: number;
  setContext: React.Dispatch<React.SetStateAction<number>>;
  similarity: number;
  setSimilarity: React.Dispatch<React.SetStateAction<number>>;
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
      }}
    >
      {children}
    </PlaygroundSettingsContext.Provider>
  );
}
