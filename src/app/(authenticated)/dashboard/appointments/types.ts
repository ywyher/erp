import { string, z } from "zod";

export const consultationSchema = z.object({
  diagnosis: string().min(1, "Diagnosis is required"),
  history: string().min(1, "History is required"),
  laboratories: z.array(z.string()),
  radiologies: z.array(z.string()),
  medicines: z.array(z.string()),
})