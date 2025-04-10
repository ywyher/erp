import { nationalIdRegex, phoneNumberRegex } from "@/app/types";
import { genders } from "@/lib/constants";
import { z } from "zod";

export const verifyOtpSchema = z.object({
  otp: z.string(),
});

export type TVerifyOtpSchema = z.infer<typeof verifyOtpSchema>;

export const authSchema = z.object({
  field: z.string().min(3, {
    message: "Field must be at least 3 characters.",
  }),
});

export const loginSchema = z.object({
  field: z.string().min(3, "Field must at least be 3 characters."),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

export type TLoginSchema = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().toLowerCase().min(3, {
      message: "Name must be at least 3 characters.",
    }),
    email: z.string().email().toLowerCase(),
    username: z.string().toLowerCase().trim().min(3, {
      message: "Username must be at least 3 characters.",
    }),
    gender: z.enum(genders),
    dateOfBirth: z.date(),
    phoneNumber: z.string().optional(),
    nationalId: z.string().min(1, {
      message: "National id is required",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
  })
  .superRefine(({ confirmPassword, password, phoneNumber, nationalId }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirmPassword"],
      });
    }
    if (phoneNumber) {
      if(!phoneNumber.match(phoneNumberRegex)) {
        ctx.addIssue({
          code: "custom",
          message: "Incorrect password format",
          path: ["phoneNumber"],
        });
      }
    }
    if (nationalId) {
      if(!nationalId.match(nationalIdRegex)) {
        ctx.addIssue({
          code: "custom",
          message: "Incorrect nationalId format",
          path: ["nationalId"],
        });
      }
    }
  });
