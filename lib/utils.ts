import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formSchema = z.object({
  caseId: z.coerce
    .number()
    .positive("Case ID is empty")
    .int("Case ID is invalid"),
  temperature: z
    .number({ message: "Temperature must be a number from 0 to 1" })
    .min(0, "Temperature must be a number from 0 to 1")
    .max(1, "Temperature must be a number from 0 to 1"),
  similarity: z.number().int().min(1).max(10),
  context: z.number().int().min(0).max(10),
  modelName: z.enum(["llama3:instruct", "llama3:70b-instruct", "llava:13b"], {
    message: "Please select a model.",
  }),
});

export const embedSchema = z.object({
  caseEmbedId: z.coerce
    .number()
    .positive("Case ID is empty")
    .int("Case ID is invalid"),
  modelName: z.enum(["llama3:instruct", "llama3:70b-instruct", "llava:13b"], {
    message: "Please select a model.",
  }),
});
