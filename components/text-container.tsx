import React from "react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

type TextContainerProps = {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

export default function TextContainer({
  input,
  handleInputChange,
}: TextContainerProps) {
  return (
    <>
      <Label htmlFor="message" className="sr-only">
        Message
      </Label>
      <Textarea
        id="message"
        value={input}
        onChange={handleInputChange}
        placeholder="Type your message here..."
        className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
      />
    </>
  );
}
