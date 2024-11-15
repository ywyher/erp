import { emailRegex, phoneNumberRegex } from "@/app/index.types";
import { z } from "zod";

export const verifyOtpSchema = z.object({
    otp: z.string(),
})

export type TVerifyOtpSchema = z.infer<typeof verifyOtpSchema>

export const authSchema = z.object({
    column: z.string().min(3, {
        message: "Name must be at least 3 characters.",
    })
})

export type TAuthSchema = z.infer<typeof authSchema>

export const loginSchema = z.object({
    value: z.string(),
    password: z.string().min(3, {
        message: "Password must be at least 3 characters.",
    }),
})

export type TLoginSchema = z.infer<typeof loginSchema>

export const updateUserSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    email: z.string().optional(),
    phoneNumber: z.string().optional(),
    // .refine((value) => phoneNumberRegex.test(value), {
    //     message: "Please enter a valid phone number."
    // })
    username: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
    bio: z.string().optional().refine((value) => {
        if (value && value.length > 160) {
            return false;
        }
        return true;
    }, {
        message: "Bio must be less than 160 characters."
    })
})

export type TUpdateUserSchema = z.infer<typeof updateUserSchema>

export const registerSchema = z.object({
    column: z.string().min(3, {
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

export type TRegisterSchema = z.infer<typeof registerSchema>