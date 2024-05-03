import React from "react";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Bird, Rabbit, Turtle } from "lucide-react";
import { Slider } from "./ui/slider";
import { Input } from "./ui/input";
import { usePlaygroundSettings } from "@/lib/hooks";

export default function Settings() {
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
    <fieldset className="grid gap-6 rounded-lg border p-4">
      <legend className="-ml-1 px-1 text-sm font-medium">Settings</legend>
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
                    <span className="font-medium text-foreground">Llama3:</span>{" "}
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
                    <span className="font-medium text-foreground">Llama3:</span>{" "}
                    70b
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
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          placeholder="0.4"
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
          value={[similarity]}
          onValueChange={(e) => setSimilarity(e[0])}
          max={10}
          step={1}
          className="text-primary"
        />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="k-memory">K-Context Window</Label>
        <Slider
          max={10}
          step={1}
          value={[context]}
          onValueChange={(e) => setContext(e[0])}
        />
      </div>
    </fieldset>
  );
}
