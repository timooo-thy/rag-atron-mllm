import { Button } from "./ui/button";

type TestPromptsProps = {
  setInput: React.Dispatch<React.SetStateAction<string>>;
};

export default function TestPrompts({ setInput }: TestPromptsProps) {
  return (
    <fieldset className="grid gap-6 rounded-lg border p-4">
      <legend className="-ml-1 px-1 text-sm font-medium">Test Prompts</legend>
      <Button
        onClick={(e) => {
          e.preventDefault();
          setInput(
            "Based on the messages, did the accused sell illegal substances to the buyer?"
          );
        }}
        className="bg-primary hover:opacity-80 hover:bg-primar inline-block w-full h-20 text-left whitespace-normal"
      >
        Based on the messages, did the accused sell illegal substances to the
        buyer?
      </Button>
      <Button
        onClick={(e) => {
          e.preventDefault();
          setInput(
            "Based on the messages, where was the accused on 22nd March at 10.00am?"
          );
        }}
        className="bg-primary hover:opacity-80 hover:bg-primary inline-block w-full h-20 text-left whitespace-normal"
      >
        Based on the messages, where was the accused on 22nd March at 10.00am?
      </Button>
      <Button
        onClick={(e) => {
          e.preventDefault();
          setInput(
            "Provide a summary of all messages that suggest accused is consuming drugs."
          );
        }}
        className="bg-primary hover:opacity-80 hover:bg-primary inline-block w-full h-20 text-left whitespace-normal"
      >
        Provide a summary of all messages that suggest accused is consuming
        drugs.
      </Button>
    </fieldset>
  );
}
