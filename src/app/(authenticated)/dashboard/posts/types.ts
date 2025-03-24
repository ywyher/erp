import { socialStatuses } from "@/lib/constants";
import { z } from "zod";


export const postCategoryStatuses = [
  'news',
  'article'
] as const;

export const postSchema = z.object({
  title: z.string().min(1, "Title connot be empty"),
  content: z.array(z.any()),
  status: z.enum(socialStatuses),
  tags: z.array(z.string()),
  category: z.enum(postCategoryStatuses),
  thumbnail: z.instanceof(File, { message: "Invalid file type" }),
});