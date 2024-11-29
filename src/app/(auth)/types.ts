import { emailRegex, phoneNumberRegex } from "@/app/types";
import { z } from "zod";

export const verifyOtpSchema = z.object({
    otp: z.string(),
})

export type TVerifyOtpSchema = z.infer<typeof verifyOtpSchema>

export const authSchema = z.object({
    field: z.string().min(3, {
        message: "Field must be at least 3 characters.",
    })
})

export const loginSchema = z.object({
    value: z.string(),
    password: z.string().min(3, {
        message: "Password must be at least 3 characters.",
    }),
})

export type TLoginSchema = z.infer<typeof loginSchema>

export const registerSchema = z.object({
    field: z.string().min(3, {
        message: "Name must be at least 3 characters.",
    }).optional(),
    password: z.string().min(3, {
        message: "Password must be at least 3 characters.",
    }),
    confirmPassword: z.string().min(3, {
        message: "Password must be at least 3 characters.",
    })
}).superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
        ctx.addIssue({
            code: "custom",
            message: "The passwords did not match",
            path: ['confirmPassword']
        });
    }
});