import { socialStatuses } from "@/lib/constants";
import { string, z } from "zod";

export const newsSchema = z.object({
  title: string().min(1, "Title is required"),
  content: string().min(1, "Content is required"),
  status: z.enum(socialStatuses),
  thumbnail: z.instanceof(File, { message: "Invalid file type" }),
});

export type NewsStatus = "draft" |"published" | "inactive" | "archived";