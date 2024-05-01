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
  temperature: z.coerce
    .number()
    .positive("Temperature value is empty")
    .min(0)
    .max(1, "Temperature must be a number from 0 to 1"),
});
