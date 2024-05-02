"use client";

import { useChat } from "ai/react";
import {
  Bird,
  Book,
  Bot,
  BotIcon,
  Code2,
  CopyIcon,
  FileTextIcon,
  LifeBuoy,
  Mic,
  Paperclip,
  Rabbit,
  SendIcon,
  Settings,
  Settings2,
  SquareTerminal,
  SquareUser,
  Turtle,
} from "lucide-react";
import { Spinner } from "@nextui-org/react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import Image from "next/image";
import remarkGfm from "remark-gfm";
import Markdown from "react-markdown";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { formSchema } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Chat() {
  const [caseId, setCaseId] = useState("");
  const [temperature, setTemperature] = useState<number | undefined>(undefined);
  const [context, setContext] = useState(6);
  const [similarity, setSimilarity] = useState(4);
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setInput,
    isLoading,
  } = useChat({
    api: "/api/chat-rag",
    body: {
      caseId: caseId,
      temperature: temperature,
      similarity: similarity,
      context: context,
    },
  });
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        // Read the file content as text
        const reader = new FileReader();
        reader.onload = async (e) => {
          const text = e.target?.result;

          try {
            const response = await fetch("/api/ingest", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ text }),
            });
            if (response.ok) {
              toast.success("Upload successful!");
            } else {
              toast.error("Failed to upload file. Please try again.");
            }
          } catch (error) {
            toast.error("Failed to upload file. Please try again.");
          }
        };
        reader.readAsText(file);
      }
    }
  };

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <TooltipProvider>
      <div className="grid h-screen w-full pl-[53px]">
        <aside className="inset-y fixed left-0 z-20 flex h-full flex-col border-r">
          <div className="border-b p-2">
            <Button variant="outline" size="icon" aria-label="Home">
              <Image src="/htx-logo.webp" width={32} height={32} alt="HTX" />
            </Button>
          </div>
          <nav className="grid gap-1 p-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg bg-muted"
                  aria-label="NarcoNet AI"
                >
                  <SquareTerminal className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                NarcoNet AI
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg"
                  aria-label="Models"
                >
                  <Bot className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Models
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg"
                  aria-label="API"
                >
                  <Code2 className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                API
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg"
                  aria-label="Documentation"
                >
                  <Book className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Documentation
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg"
                  aria-label="Settings"
                >
                  <Settings2 className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Settings
              </TooltipContent>
            </Tooltip>
          </nav>
          <nav className="mt-auto grid gap-1 p-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-auto rounded-lg"
                  aria-label="Help"
                >
                  <LifeBuoy className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Help
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-auto rounded-lg"
                  aria-label="Account"
                >
                  <SquareUser className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Account
              </TooltipContent>
            </Tooltip>
          </nav>
        </aside>
        <div className="flex flex-col">
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
                                  The most powerful model for complex
                                  computations.
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
                      <Input id="temperature" type="number" placeholder="0.4" />
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
                          Based on the messages, where was the accused on 22nd
                          March at 10.00am?
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
                          Provide a summary of all messages that suggest accused
                          is consuming drugs.
                        </Button>
                      </DrawerClose>
                    </div>
                  </fieldset>
                </form>
              </DrawerContent>
            </Drawer>
          </header>
          <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3">
            <div
              className="relative hidden flex-col items-start gap-8 md:flex"
              x-chunk="dashboard-03-chunk-0"
            >
              <form className="grid w-full items-start gap-6">
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
                                  Llama3:
                                </span>{" "}
                                70b
                              </p>
                              <p className="text-xs" data-description>
                                The most powerful model for complex
                                computations.
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
                      onChange={(e) =>
                        setTemperature(parseFloat(e.target.value))
                      }
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
                <fieldset className="grid gap-6 rounded-lg border p-4">
                  <legend className="-ml-1 px-1 text-sm font-medium">
                    Test Prompts
                  </legend>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      setInput(
                        "Based on the messages, did the accused sell illegal substances to the buyer?"
                      );
                    }}
                    className="bg-primary hover:opacity-80 hover:bg-primary inline-block w-full h-20 text-left whitespace-normal"
                  >
                    Based on the messages, did the accused sell illegal
                    substances to the buyer?
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
                    Based on the messages, where was the accused on 22nd March
                    at 10.00am?
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
                    Provide a summary of all messages that suggest accused is
                    consuming drugs.
                  </Button>
                </fieldset>
              </form>
            </div>
            <div className="relative flex h-full min-h-[50dvh] max-h-[90dvh] flex-col rounded-xl bg-muted/50 p- lg:col-span-2 border-2 ">
              <div className="flex flex-col overflow-y-auto md:px-4 md:pt-8 pt-4 px-2 pb-0 w-full h-full">
                {messages.length > 0 ? (
                  messages.map((m) => (
                    <div key={m.id} className="prose !max-w-full px-4">
                      {m.role === "user" ? (
                        <div className="flex items-center gap-3 h-[24px]">
                          <Image
                            src="/user.svg"
                            className="w-6 h-6 rounded-full ring-2 bg-transparent ring-black/30 dark:ring-secondary/40"
                            width={24}
                            height={24}
                            alt="User"
                          />
                          <p className="font-bold">You</p>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-lg ml-auto text-slate-400/70 transition hover:text-slate-700"
                                aria-label="Copy"
                                onClick={() => {
                                  navigator.clipboard.writeText(m.content);
                                  toast.success("Copied to clipboard!");
                                }}
                              >
                                <CopyIcon className="size-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Copy</TooltipContent>
                          </Tooltip>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 h-[24px]">
                          <BotIcon className="w-6 h-6 rounded-full p-1 ring-2 ring-black/30 dark:ring-secondary/40" />
                          <p className="font-bold">NarcoNet AI</p>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-lg ml-auto text-slate-400/70 transition hover:text-slate-700"
                                aria-label="Copy"
                                onClick={() => {
                                  navigator.clipboard.writeText(m.content);
                                  toast.success("Copied to clipboard!");
                                }}
                              >
                                <CopyIcon className="size-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Copy</TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                      <Markdown
                        remarkPlugins={[remarkGfm]}
                        className="mb-10 rounded-medium text-medium bg-background md:px-8 px-5 py-1 mt-2 shadow-md dark:shadow-lg dark:bg-slate-800"
                      >
                        {m.content}
                      </Markdown>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-center items-center h-full font-semibold">
                    <p>Upload a conversation first!</p>
                  </div>
                )}
                <div ref={endOfMessagesRef} />
              </div>
              <form
                className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
                x-chunk="dashboard-03-chunk-1"
                onSubmit={(e) => {
                  e.preventDefault();

                  const result = formSchema.safeParse({
                    caseId,
                    temperature,
                    similarity,
                    context,
                  });

                  if (!result.success) {
                    toast.warning(result.error.errors[0].message);
                    return;
                  }
                  handleSubmit(e);
                }}
              >
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
                <div className="flex items-center p-3 pt-0">
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Paperclip className="size-4" />
                            <span className="sr-only">Upload file</span>
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="top">Upload File</TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Upload File(s)</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <Button
                        className="bg-transparent flex justify-between gap-x-1 text-black hover:bg-gray-100 w-full"
                        onClick={handleFileInputClick}
                      >
                        <span>Text/Image</span>

                        <FileTextIcon className="h-5 w-5" />

                        <Input
                          type="file"
                          accept="text/plain, .txt, image/*"
                          name="fileInput"
                          onChange={handleFileChange}
                          className="hidden"
                          ref={fileInputRef}
                        />
                      </Button>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" disabled>
                        <Mic className="size-4" />
                        <span className="sr-only">Use Microphone</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Use Microphone</TooltipContent>
                  </Tooltip>

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
                      <Spinner size="sm" />
                    ) : (
                      <>
                        <p>Send Message</p>
                        <SendIcon className="size-3.5" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
