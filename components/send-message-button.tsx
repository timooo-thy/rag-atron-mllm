import React from "react";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import { Spinner } from "@nextui-org/spinner";

type SendMessageButtonProps = {
  input: string;
  isLoading: boolean;
  submitButtonRef: React.RefObject<HTMLButtonElement>;
};

export default function SendMessageButton({
  input,
  isLoading,
  submitButtonRef,
}: SendMessageButtonProps) {
  return (
    <Button
      type="submit"
      size="sm"
      ref={submitButtonRef}
      className={`ml-auto gap-1.5 w-[130px] bg-primary hover:opacity-80 hover:bg-primary ${
        input === "" || isLoading
          ? "bg-primary/40 transition hover:bg-primary/40 hover:opacity-100"
          : ""
      }`}
      disabled={isLoading || input === ""}
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
