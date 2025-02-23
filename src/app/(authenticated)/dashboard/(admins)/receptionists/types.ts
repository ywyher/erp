import { departments } from "@/app/(authenticated)/dashboard/constants";
import { applySharedRefinements, basePasswordSchema, baseUserSchema } from "@/app/types";
import { z } from "zod";

export const createReceptionistSchema = applySharedRefinements(
    baseUserSchema.extend({
        department: z.enum(departments),
    }).merge(basePasswordSchema)
)

export const updateReceptionistSchema = applySharedRefinements(baseUserSchema)