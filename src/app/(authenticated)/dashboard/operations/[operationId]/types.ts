import { z } from "zod";

export const operationDataSchema = z.object({
    data: z.record(z.any()),
});