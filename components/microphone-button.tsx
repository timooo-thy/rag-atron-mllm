import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Button } from "./ui/button";
import { Mic } from "lucide-react";

export default function MicrophoneButton() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" disabled>
          <Mic className="size-4" />
          <span className="sr-only">Use Microphone</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">Use Microphone</TooltipContent>
    </Tooltip>
  );
}
