import { z } from "zod";

export const presetSchema = z.object({
    title: z.string().min(1),
    data: z.record(z.any()),
});