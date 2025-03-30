import { socialStatuses } from "@/lib/constants";
import { string, z } from "zod";

export const serviceSchema = z.object({
  icon: string().min(1, "Icon is required"),
  title: string().min(1, "Title is required"),
  status: z.enum(socialStatuses),
});