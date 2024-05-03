import { Bird, Rabbit, Settings, Turtle } from "lucide-react";
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
  } = usePlaygroundSettings();

  return (
    <header className="sticky top-0 z-10 flex h-[53px] items-center gap-1 border-b px-4">
      <h1 className="text-xl font-semibold">NarcoNet AI</h1>
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Settings className="size-4" />
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
            <fieldset className="grid gap-6 rounded-lg border p-4">
              <legend className="-ml-1 px-1 text-sm font-medium">
                Settings
              </legend>
              <div className="grid gap-3">
                <Label htmlFor="model">Model</Label>
                <Select>
                  <SelectTrigger
                    id="model"
                    className="items-start [&_[data-description]]:hidden"
                  >
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="genesis">
                      <div className="flex items-start gap-3 text-muted-foreground">
                        <Rabbit className="size-5" />
                        <div className="grid gap-0.5">
                          <p>
                            <span className="font-medium text-foreground">
                              Llama3:
                            </span>{" "}
                            8b-Instruct
                          </p>
                          <p className="text-xs" data-description>
                            Our fastest model for general use cases.
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="explorer">
                      <div className="flex items-start gap-3 text-muted-foreground">
                        <Bird className="size-5" />
                        <div className="grid gap-0.5">
                          <p>
                            <span className="font-medium text-foreground">
                              LLama3:
                            </span>{" "}
                            70b-Instruct
                          </p>
                          <p className="text-xs" data-description>
                            The most powerful model for complex computations.
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="quantum">
                      <div className="flex items-start gap-3 text-muted-foreground">
                        <Turtle className="size-5" />
                        <div className="grid gap-0.5">
                          <p>
                            <span className="font-medium text-foreground">
                              Mixtral:
                            </span>{" "}
                            8x22b-Instruct
                          </p>
                          <p className="text-xs" data-description>
                            A balanced between both speed and performance.
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  type="number"
                  placeholder="0.4"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="caseid">Case ID</Label>
                <Input
                  value={caseId}
                  id="caseid"
                  placeholder="10932"
                  onChange={(e) => setCaseId(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="k-retrieval">K-Similarity</Label>
                <Slider
                  defaultValue={[4]}
                  max={10}
                  value={[similarity]}
                  onValueChange={(e) => setSimilarity(e[0])}
                  className="text-primary"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="k-memory">K-Context Window</Label>
                <Slider
                  value={[context]}
                  onValueChange={(e) => setContext(e[0])}
                  max={10}
                  step={1}
                />
              </div>
            </fieldset>
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
          </form>
        </DrawerContent>
      </Drawer>
    </header>
  );
}
