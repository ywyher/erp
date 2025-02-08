import { z } from "zod";

export const operationDataSchema = z.object({
  one: z.string().nonempty(),
  two: z.string().nonempty(),
  three: z.string().nonempty(),
})