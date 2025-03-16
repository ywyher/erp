import { specialties } from "@/app/(authenticated)/dashboard/constants";
import { genders } from "@/lib/constants";
import {
  account,
  appointment,
  doctor,
  post,
  operation,
  receptionist,
  schedule,
  session,
  user,
} from "@/lib/db/schema";
import { service } from "@/lib/db/schema/service";
import { z } from "zod";

export type Roles = "admin" | "user" | "doctor" | "receptionist";

export type Doctor = {
  id: string;
  specialty: (typeof specialties)[number];
  userId: string;
};

export type Schedule = {
  id: string;
  day: string;
  startTime: Date;
  endTime: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
export const phoneNumberRegex = /^(0\d{2}[\s-]?\d{7}|\d{11})$/;
export const nationalIdRegex =
  /^([1-9]{1})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})[0-9]{3}([0-9]{1})[0-9]{1}$/;
export const usernameRegex = /^[a-zA-Z][a-zA-Z0-9._]{2,19}$/;

// Password Schema (without superRefine)
export const basePasswordSchema = z.object({
  password: z.string().min(3, {
    message: "Password must be at least 3 characters.",
  }),
  confirmPassword: z.string().min(3, {
    message: "Password must be at least 3 characters.",
  }),
});

export const passwordSchema = basePasswordSchema.superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: "custom",
      message: "The passwords did not match",
      path: ["confirmPassword"],
    });
  }
});

// Base User Schema (Shared fields)
export const baseUserSchema = z.object({
  name: z.string().toLowerCase().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email().toLowerCase().optional(),
  username: z.string().toLowerCase().trim().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  gender: z.enum(genders),
  dateOfBirth: z.date(),
  phoneNumber: z.string().optional(),
  nationalId: z.string().min(1, {
    message: "National id is required",
  }),
});

// Shared refinement function for validations
export const applySharedRefinements = <T extends z.ZodTypeAny>(schema: T) =>
  schema.superRefine((data, ctx) => {
    if (!data.email && !data.phoneNumber) {
      ctx.addIssue({
        code: "custom",
        message: "At least one of email or phone number is required.",
        path: ["email"],
      });
      ctx.addIssue({
        code: "custom",
        message: "At least one of email or phone number is required.",
        path: ["phoneNumber"],
      });
    }

    if (data.email) {
      const emailValidation = z.string().email().safeParse(data.email);
      if (!emailValidation.success) {
        ctx.addIssue({
          code: "custom",
          message: "Invalid email format.",
          path: ["email"],
        });
      }
    }

    if (data.phoneNumber) {
      const phoneValidation = z
        .string()
        .refine((value) => phoneNumberRegex.test(value), {
          message: "Please enter a valid phone number.",
        })
        .safeParse(data.phoneNumber);
      if (!phoneValidation.success) {
        ctx.addIssue({
          code: "custom",
          message: phoneValidation.error.errors[0]?.message,
          path: ["phoneNumber"],
        });
      }
    }

    if (data.nationalId) {
      const nationalIdValidation = z
        .string()
        .refine((value) => nationalIdRegex.test(value), {
          message: "Please enter a valid Egyptian national id.",
        })
        .safeParse(data.nationalId);
      if (!nationalIdValidation.success) {
        ctx.addIssue({
          code: "custom",
          message: nationalIdValidation.error.errors[0]?.message,
          path: ["nationalId"],
        });
      }
    }

    // Password validation (only if password fields exist)
    if ("password" in data && "confirmPassword" in data) {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          message: "The passwords did not match",
          path: ["confirmPassword"],
        });
      }
    }
  });

// User Schema (Base User without password fields)
export const updateUserSchema = applySharedRefinements(baseUserSchema);

// User Schema (Base User + Password fields)
export const createUserSchema = applySharedRefinements(
  baseUserSchema.merge(basePasswordSchema),
);

// 1️⃣ Explicitly define Tables type
export type Tables = keyof typeof tableMap;

// 2️⃣ Ensure tableMap is correctly typed
export const tableMap: Record<string, any> = {
  user,
  receptionist,
  doctor,
  schedule,
  session,
  account,
  appointment,
  operation,
  service,
  post
};
