import { nationalIdRegex, phoneNumberRegex } from "@/app/types";
import { LucideIcon } from 'lucide-react'; // Assuming you're using Lucide for the icons
import { z } from "zod";

type MenuItemActions = {
    hasActions: boolean;
    items?: {
        label: string;
        onClick: () => void;
        icon?: LucideIcon;
    }[];
};

export type MenuItem = {
    title: string;
    url: string;
    icon: React.ComponentType;
    actions: MenuItemActions;
};


export type Schedule = {
    startTime: string;
    endTime: string;
};

export type Schedules = Record<string, Schedule[]>;

export const createUserSchema = z
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
        password: z.string().min(3, {
            message: 'Min is 3'
        }),
        confirmPassword: z.string().min(3, {
            message: 'Min is 3'
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
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                code: "custom",
                message: "Passwords do not match",
                path: ["confirmPassword"]
            });
        }
    });