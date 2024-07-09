import { Button } from "./ui/button";

type TestPromptsProps = {
  setInput: React.Dispatch<React.SetStateAction<string>>;
};

export default function TestPrompts({ setInput }: TestPromptsProps) {
  return (
    <fieldset className="grid gap-6 rounded-lg border p-4">
      <legend className="-ml-1 px-1 text-sm font-medium">Test Prompts</legend>
      <TestPromptButton
        text="Based on the messages, did the accused sell illegal substances to the buyer?"
        setInput={setInput}
      />
      <TestPromptButton
        text="Based on the messages, where was the accused on 30th April at 12.00pm?"
        setInput={setInput}
      />
      <TestPromptButton
        text="Provide a summary of messages that suggest accused is consuming drugs."
        setInput={setInput}
      />
    </fieldset>
  );
}

type TestPromptButtonProps = {
  text: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
};

export function TestPromptButton({ text, setInput }: TestPromptButtonProps) {
  return (
    <Button
      onClick={(e) => {
        e.preventDefault();
        setInput(text);
      }}
      className="bg-primary hover:opacity-80 hover:bg-primar inline-block w-full h-16 text-left whitespace-normal text-xs"
    >
      {text}
    </Button>
  );
}
