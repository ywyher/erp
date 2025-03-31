import { socialStatuses } from "@/lib/constants";
import { string, z } from "zod";

export const faqSchema = z.object({
  question: string().min(1, "Question is required"),
  answer: string().min(1, "Answer is required"),
  status: z.enum(socialStatuses),
});