import { PlaygroundSettingsContext } from "@/context/playground-settings-provider";
import { useContext } from "react";

export function usePlaygroundSettings() {
  const context = useContext(PlaygroundSettingsContext);
  if (!context) {
    throw new Error(
      "usePlaygroundSettings must be used within a PlaygroundSettingsProvider"
    );
  }
  return context;
}
