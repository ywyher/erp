import { specialties } from "@/app/(authenticated)/dashboard/constants";
import {
  applySharedRefinements,
  basePasswordSchema,
  baseUserSchema,
} from "@/app/types";
import { z } from "zod";

export const createDoctorSchema = applySharedRefinements(
  baseUserSchema
    .extend({
      specialty: z.enum(specialties),
    })
    .merge(basePasswordSchema),
);

export const updateDoctorSchema = applySharedRefinements(
  baseUserSchema.extend({
    specialty: z.enum(specialties),
  }),
);
