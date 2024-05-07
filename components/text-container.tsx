import React from "react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { usePlaygroundSettings } from "@/lib/hooks";
import { Paperclip, Trash2 } from "lucide-react";
import { Button } from "./ui/button";

type TextContainerProps = {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

export default function TextContainer({
  input,
  handleInputChange,
}: TextContainerProps) {
  const { chatFiles, setChatFiles } = usePlaygroundSettings();

  return (
    <>
      {chatFiles.length > 0 && (
        <div className="flex gap-2 items-center pb-2 mx-4 pt-3 border-b-1">
          <ul className="flex gap-2">
            {chatFiles.map((file) => (
              <li
                key={file.name}
                className="flex gap-1 w-fit items-center text-xs "
              >
                <Paperclip className="size-4" />
                <span>{file.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg text-red-500 transition hover:text-red-600"
                  aria-label="Remove file"
                  onClick={() => {
                    setChatFiles((prev) =>
                      prev.filter((f) => f.name !== file.name)
                    );
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
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
