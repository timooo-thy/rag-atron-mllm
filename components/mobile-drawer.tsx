import { Bird, Rabbit, SettingsIcon, Turtle } from "lucide-react";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";
import React from "react";
import { usePlaygroundSettings } from "@/lib/hooks";
import { Model } from "@/lib/type";
import Settings from "./settings";
import EmbedFiles from "./embed-files";

type MobileDrawerProps = {
  setInput: React.Dispatch<React.SetStateAction<string>>;
};

export default function MobileDrawer({ setInput }: MobileDrawerProps) {
  const {
    caseId,
    setCaseId,
    similarity,
    setSimilarity,
    context,
    setContext,
    temperature,
    setTemperature,
    setModelName,
  } = usePlaygroundSettings();

  return (
    <header className="sticky top-0 z-10 flex h-[53px] items-center gap-1 border-b px-4  backdrop-blur-sm">
      <h1 className="text-xl font-semibold">NarcoNet AI</h1>
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <SettingsIcon className="size-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader>
            <DrawerTitle>Configuration</DrawerTitle>
            <DrawerDescription>
              Configure the settings for the model and messages.
            </DrawerDescription>
          </DrawerHeader>
          <form className="grid w-full items-start gap-6 overflow-auto p-4 pt-0">
            <Settings />
            <fieldset className="grid gap-6 rounded-lg border p-4">
              <legend className="-ml-1 px-1 text-sm font-medium">
                Test Prompt
              </legend>
              <div className="grid gap-3">
                <DrawerClose asChild>
                  <Button
                    onClick={() => {
                      setInput(
                        "Based on the messages, did the accused sell illegal substances to the buyer?"
                      );
                    }}
                    className="bg-primary hover:opacity-80 hover:bg-primary inline-block w-full h-16 text-left whitespace-normal"
                  >
                    Based on the messages, did the accused sell illegal
                    substances to the buyer?
                  </Button>
                </DrawerClose>
                <DrawerClose asChild>
                  <Button
                    onClick={() => {
                      setInput(
                        "Based on the messages, where was the accused on 22nd March at 10.00am?"
                      );
                    }}
                    className="bg-primary hover:opacity-80 hover:bg-primary inline-block w-full h-16 text-left whitespace-normal"
                  >
                    Based on the messages, where was the accused on 22nd March
                    at 10.00am?
                  </Button>
                </DrawerClose>
                <DrawerClose asChild>
                  <Button
                    onClick={() => {
                      setInput(
                        "Provide a summary of all messages that suggest accused is consuming drugs."
                      );
                    }}
                    className="bg-primary hover:opacity-80 hover:bg-primary inline-block w-auto h-16 text-left whitespace-normal"
                  >
                    Provide a summary of all messages that suggest accused is
                    consuming drugs.
                  </Button>
                </DrawerClose>
              </div>
            </fieldset>
            <EmbedFiles />
          </form>
        </DrawerContent>
      </Drawer>
    </header>
  );
}
