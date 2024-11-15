import { z } from "zod";

export const settingsSchema = z.object({
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
    }),
    emailFake: z.string().optional(),
    phoneNumberFake: z.string().optional(),
})

export type TSettingsSchema = z.infer<typeof settingsSchema>;

export const updatePasswordSchema = z.object({
    currentPassword: z.string().min(3, {
        message: "Password must be at least 3 characters.",
    }),
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
})

export type TUpdatePasswordSchema = z.infer<typeof updatePasswordSchema>;