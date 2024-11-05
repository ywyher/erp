import { z } from "zod";

export const verifyOtpSchema = z.object({
    otp: z.string(),
})

export type TVerifyOtpSchema = z.infer<typeof verifyOtpSchema>

export const authSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email.",
    }),
})

export type TAuthSchema = z.infer<typeof authSchema>

export const loginSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email.",
    }),
    password: z.string().min(3, {
        message: "Password must be at least 3 characters.",
    }),
})

export type TLoginSchema = z.infer<typeof loginSchema>

export const onBoardingSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email.",
    }).optional(),
    username: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
    bio: z.string().optional(),
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

export type TOnBoardingSchema = z.infer<typeof onBoardingSchema>