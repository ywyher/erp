import { departments } from "@/app/(authenticated)/dashboard/constants";
import { nationalIdRegex, phoneNumberRegex } from "@/app/types";
import { z } from "zod";

export const createReceptionistSchema = z
    .object({
        name: z.string().min(2, {
            message: "Name must be at least 2 characters.",
        }),
        email: z.string().optional(),
        username: z.string().min(2, {
            message: "Username must be at least 2 characters.",
        }),
        phoneNumber: z.string().optional(),
        department: z.enum(departments),
        nationalId: z.string().min(1, {
            message: "National id is required",
        }),
        password: z.string().min(3, {
            message: "Password must be at least 3 characters."
        }),
        confirmPassword: z.string().min(3, {
            message: "Confirm password must be at least 3 characters."
        })
    })
    .superRefine((data, ctx) => {
        // Reuse original schema's validation
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
        // Validate email if provided
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
        // Validate phoneNumber if provided
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
        // Password matching validation
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                code: "custom",
                message: "Passwords do not match",
                path: ["confirmPassword"]
            });
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

export const updateReceptionistSchema = z
    .object({
        name: z.string().min(2, {
            message: "Name must be at least 2 characters.",
        }),
        email: z.string().optional(),
        username: z.string().min(2, {
            message: "Username must be at least 2 characters.",
        }),
        phoneNumber: z.string().optional(),
        nationalId: z.string().min(1, {
            message: "National id is required",
        }),
        department: z.enum(departments),
    })
    .superRefine((data, ctx) => {
        // Reuse original schema's validation
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
        // Validate email if provided
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
        // Validate phoneNumber if provided
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