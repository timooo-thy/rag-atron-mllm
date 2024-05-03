"use client";

import { useRef, useState } from "react";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { usePlaygroundSettings } from "@/lib/hooks";
import { Button } from "./ui/button";
import { Spinner } from "@nextui-org/spinner";

export default function EmbedFilesButton() {
  const { modelName } = usePlaygroundSettings();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async () => {
    if (!modelName) {
      toast.warning("Please select a model first.");
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
              body: JSON.stringify({ text, modelName }),
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
      <Input
        type="file"
        accept="text/plain, .txt, text/rtf, image/*"
        name="fileInput"
        ref={fileInputRef}
        onChange={(e) => setFile(e.target.files && e.target.files[0])}
      />
      <Button
        className="bg-primary hover:opacity-80 hover:bg-primary w-full"
        onClick={async (e) => {
          e.preventDefault();
          await handleFileUpload();
        }}
        disabled={!file}
      >
        {isLoading ? <Spinner color="white" size="sm" /> : "Embed"}
      </Button>
    </fieldset>
  );
}
