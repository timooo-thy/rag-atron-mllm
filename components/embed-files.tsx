"use client";

import { useRef, useState } from "react";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { usePlaygroundSettings } from "@/lib/hooks";
import { Button } from "./ui/button";
import { Spinner } from "@nextui-org/spinner";
import { Label } from "./ui/label";
import { embedImageSchema, embedTextSchema } from "@/lib/utils";
import { Paperclip, Trash2 } from "lucide-react";

export default function EmbedFiles() {
  const { caseEmbedId, setCaseEmbedId, file, setFile } =
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
          const result = embedTextSchema.safeParse({
            caseEmbedId,
            text,
          });

          if (!result.success) {
            toast.warning(result.error.errors[0].message);
            return;
          }

          try {
            const response = await fetch("/api/ingest/text", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(result.data),
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
      } else {
        try {
          const result = embedImageSchema.safeParse({
            caseEmbedId,
            file,
          });

          if (!result.success) {
            toast.warning(result.error.errors[0].message);
            return;
          }

          const formData = new FormData();
          formData.append("file", file);
          formData.append("caseId", caseEmbedId);

          const response = await fetch("/api/ingest/image", {
            method: "POST",
            body: formData,
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
      }
    }
  };

  return (
    <fieldset className="grid gap-6 rounded-lg border p-4">
      <legend className="-ml-1 px-1 text-sm font-medium">Embed Files</legend>
      <div className="grid gap-3">
        <Label htmlFor="caseId">Case ID (Embedding purposes)</Label>
        <Input
          id="caseId"
          placeholder="12345"
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
            accept="text/plain, .txt, text/rtf, image/png, image/jpeg, audio/mpeg"
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
