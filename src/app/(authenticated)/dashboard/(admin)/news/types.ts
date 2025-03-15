import { socialStatuses } from "@/lib/constants";
import { string, z } from "zod";

export const newsSchema = z.object({
  title: z.string(),
  content: z.array(z.any()),
  status: z.enum(socialStatuses),
  tags: z.array(z.string()),
  thumbnail: z.instanceof(File, { message: "Invalid file type" }),
});