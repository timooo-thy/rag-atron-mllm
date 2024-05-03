"use client";

import { useState, useTransition } from "react";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { usePlaygroundSettings } from "@/lib/hooks";
import { Button } from "./ui/button";
import { Spinner } from "@nextui-org/spinner";

export default function EmbedFilesButton() {
  const { modelName } = usePlaygroundSettings();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, startTransition] = useTransition();

  const handleFileUpload = async () => {
    if (file) {
      console.log(file.type);
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
              body: JSON.stringify({ text, modelName }),
            });
            if (response.ok) {
              toast.success("Upload successful!");
              setFile(null);
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

  return (
    <fieldset className="grid gap-6 rounded-lg border p-4">
      <legend className="-ml-1 px-1 text-sm font-medium">Embed Files</legend>
      <Input
        type="file"
        accept="text/plain, .txt, text/rtf, image/*"
        name="fileInput"
        onChange={(e) => setFile(e.target.files && e.target.files[0])}
      />
      <Button
        className="bg-primary hover:opacity-80 hover:bg-primary w-full"
        onClick={(e) => {
          e.preventDefault();
          if (!modelName) {
            toast.warning("Please select a model first.");
            return;
          }
          startTransition(async () => handleFileUpload());
        }}
        disabled={!file}
      >
        {isLoading ? <Spinner color="white" size="sm" /> : "Embed"}
      </Button>
    </fieldset>
  );
}
