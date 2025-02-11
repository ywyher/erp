import { z } from "zod";

export const settingSchema = z.object({
    key: z.string().nonempty(),
    value: z.string().nonempty(),
    description: z.string().optional(),
})