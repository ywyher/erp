import { specialties } from "@/app/(authenticated)/dashboard/constants";
import { Session } from "better-auth";
import { z } from "zod";

export type Roles = 'admin' | 'user' | 'doctor' | 'receptionist'

export type Doctor = {
    id: string;
    specialty: typeof specialties[number];
    userId: string;
}

export type Schedule = {
    id: string,
    day: string,
    startTime: Date,
    endTime: Date,
    userId: string,
    createdAt: Date,
    updatedAt: Date,
}

export const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
export const phoneNumberRegex = /^(0\d{2}[\s-]?\d{7}|\d{11})$/;
export const nationalIdRegex = /^([1-9]{1})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})[0-9]{3}([0-9]{1})[0-9]{1}$/;
export const usernameRegex = /^[a-zA-Z][a-zA-Z0-9._]{2,19}$/;

export const passwordSchema = z.object({
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

export type TPasswordSchema = z.infer<typeof passwordSchema>;

export const userSchema = z
    .object({
        name: z
            .string()
            .toLowerCase()
            .min(2, {
                message: "Name must be at least 2 characters.",
            }),
        email: z
            .string()
            .email()
            .toLowerCase()
            .optional(),
        username: z
            .string()
            .toLowerCase()
            .trim()
            .min(2, { message: "Username must be at least 2 characters." }), // Then validate
        phoneNumber: z
            .string()
            .optional(),
        nationalId: z
            .string()
            .min(1, {
                message: "National id is required",
            }),
    })
    .superRefine((data, ctx) => {
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
            const phoneValidation = z.string().refine((value) => phoneNumberRegex.test(value), {
                message: "Please enter a valid phone number."
            }).safeParse(data.phoneNumber);
            if (!phoneValidation.success) {
                ctx.addIssue({
                    code: "custom",
                    message: phoneValidation.error.errors[0]?.message,
                    path: ["phoneNumber"],
                });
            }
        }

        if (data.nationalId) {
            const nationalIdValidation = z.string().refine((value) => nationalIdRegex.test(value), {
                message: "Please enter a valid Egyptian national id."
            }).safeParse(data.nationalId);
            if (!nationalIdValidation.success) {
                ctx.addIssue({
                    code: "custom",
                    message: nationalIdValidation.error.errors[0]?.message,
                    path: ["nationalId"],
                });
            }
        }
    });
