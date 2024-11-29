'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { redirect } from "next/navigation";
import AuthLayout from "@/app/(auth)/auth/_components/auth-layout";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { resetPassword } from "@/lib/auth-client";
import { passwordSchema, TPasswordSchema } from "@/app/types";
import { toast, useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/auth";

export default function ResetPassword() {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const form = useForm<TPasswordSchema>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    })

    const onResetPassword = async (formData: TPasswordSchema) => {
        setIsLoading(true)
        const { error } = await resetPassword({
            newPassword: formData.password,
        });

        if (error) {
            console.error(error.message)
        } else {
            toast({
                title: "Success",
                description: "Password reset successfully",
            })
            setIsLoading(false)
            redirect("/auth")
        }
    }

    return (
        <AuthLayout>
            <div className="w-full mb-6 flex flex-col space-y-6 sm:mb-8">
                <h3 className="text-2xl font-semibold text-zinc-100">Reset Your Password </h3>
                <Form {...form}>
                    <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onResetPassword)}>
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Confirm Password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            className="w-full bg-[#E4E4E7] text-black hover:bg-white"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                    ></path>
                                </svg>
                            ) : (
                                "Reset"
                            )}
                        </Button>
                    </form>
                </Form>
                <p className="text-sm text-gray-400">Emails may take up to 5 minutes to arrive. If you did not receive an email or your code did not work, please try again. If you encounter any issues, please visit our <span className="text-blue-500 hover:cursor-pointer hover:text-blue-400">support</span> page.</p>
            </div>
        </AuthLayout>
    )
}