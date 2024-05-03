import React from "react";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import { Spinner } from "@nextui-org/spinner";

type SendMessageButtonProps = {
  input: string;
  isLoading: boolean;
};

export default function SendMessageButton({
  input,
  isLoading,
}: SendMessageButtonProps) {
  return (
    <Button
      type="submit"
      size="sm"
      className={`ml-auto gap-1.5 w-[130px] bg-primary hover:opacity-80 hover:bg-primary ${
        input === "" || isLoading
          ? "cursor-not-allowed bg-primary/40 transition hover:bg-primary/40 hover:opacity-100"
          : ""
      }`}
    >
      {isLoading ? (
        <Spinner size="sm" color="white" />
      ) : (
        <>
          <p>Send Message</p>
          <Send className="size-3.5" />
        </>
      )}
    </Button>
  );
}
