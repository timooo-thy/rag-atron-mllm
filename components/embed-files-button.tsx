import { ChangeEvent } from "react";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { usePlaygroundSettings } from "@/lib/hooks";

export default function EmbedFilesButton() {
  const { modelName } = usePlaygroundSettings();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
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
        accept="text/plain, .txt, image/*"
        name="fileInput"
        onChange={handleFileChange}
      />
    </fieldset>
  );
}
