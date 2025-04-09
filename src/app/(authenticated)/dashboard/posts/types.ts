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

export type PostContentItem = 
  | { 
      id: string;
      type: "h1" | "p" | "blockquote" | "img" | "video" | "file" | "audio"; // Various content types
      children: { text: string }[]; // Each content element can have children with text
      indent?: number;
      listStyleType?: "todo" | "ordered" | "unordered";
      listStart?: number;
      checked?: boolean;
      url?: string; // Used for img, file, video, audio
      name?: string; // Name for img, file, video, audio
      isUpload?: boolean;
      placeholderId?: string;
  };