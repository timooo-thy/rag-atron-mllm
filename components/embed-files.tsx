"use client";

import { useRef, useState } from "react";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { usePlaygroundSettings } from "@/lib/hooks";
import { Button } from "./ui/button";
import { Spinner } from "@nextui-org/spinner";
import { Label } from "./ui/label";
import { embedSchema } from "@/lib/utils";
import { Paperclip, Trash2, X } from "lucide-react";

export default function EmbedFiles() {
  const { modelName, caseEmbedId, setCaseEmbedId, file, setFile } =
    usePlaygroundSettings();

  const [isLoading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFileClick = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileUpload = async () => {
    const result = embedSchema.safeParse({ caseEmbedId, modelName });

    if (!result.success) {
      toast.warning(result.error.errors[0].message);
      return;
    }

    if (file) {
      setLoading(true);
      if (
        file.type === "text/plain" ||
        file.type === "text/rtf" ||
        file.name.endsWith(".txt")
      ) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const text = e.target?.result;

          try {
            const response = await fetch("/api/ingest", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ text, modelName, caseEmbedId }),
            });
            if (response.ok) {
              toast.success("Upload successful!");
              setFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            } else {
              toast.error("Failed to upload file. Please try again.");
            }
          } catch (error) {
            toast.error("Failed to upload file. Please try again.");
          } finally {
            setLoading(false);
          }
        };
        reader.readAsText(file);
      }
    }
  };

  return (
    <fieldset className="grid gap-6 rounded-lg border p-4">
      <legend className="-ml-1 px-1 text-sm font-medium">Embed Files</legend>
      <div className="grid gap-3">
        <Label htmlFor="caseId">Case ID (For embedding purposes)</Label>
        <Input
          id="caseId"
          placeholder="31415"
          value={caseEmbedId}
          onChange={(e) => setCaseEmbedId(e.target.value)}
        />
      </div>
      <div className="flex gap-5">
        <Button
          className="bg-transparent flex justify-between gap-x-1 text-black hover:bg-gray-100 w-full"
          onClick={handleFileInputClick}
          type="button"
        >
          <Paperclip className="size-4" />
          <Input
            type="file"
            accept="text/plain, .txt, text/rtf, image/*"
            name="fileInput"
            ref={fileInputRef}
            onChange={(e) => setFile(e.target.files && e.target.files[0])}
            className="hidden"
          />
          {file?.name}
        </Button>
        <Button
          type="button"
          className="bg-red-600 hover:bg-red-500/90 px-3"
          onClick={handleRemoveFileClick}
          disabled={!file}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      <Button
        className="bg-primary hover:opacity-80 hover:bg-primary w-full"
        onClick={async (e) => {
          e.preventDefault();
          await handleFileUpload();
        }}
        disabled={!file || isLoading}
      >
        {isLoading ? <Spinner color="white" size="sm" /> : "Embed"}
      </Button>
    </fieldset>
  );
}
