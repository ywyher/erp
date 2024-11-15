'use client'

import { useForm } from "react-hook-form"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { registerSchema, TRegisterSchema } from "@/app/(unauthenticated)/(authentication)/auth.types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useVerifyStore } from "@/app/(unauthenticated)/(authentication)/store"
import LoadingBtn from "@/components/loading-btn"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { emailOtp, phoneNumber, signUp } from "@/lib/auth-client"
import { faker } from "@faker-js/faker"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

export default function Register() {
    const [isLoading, setIsLoading] = useState(false)
    const value = useVerifyStore((state) => state.value)
    const context = useVerifyStore((state) => state.context)
    const setPassword = useVerifyStore((state) => state.setPassword)
    const queryClient = useQueryClient()
    const { toast } = useToast()

    const form = useForm<TRegisterSchema>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            column: value || '',
            password: '',
            confirmPassword: ''
        }
    })

    const onRegister = async (data: TRegisterSchema) => {
        if (!value) return;
        setIsLoading(true)
        if (context == 'email') {
            const randomNumbers = Math.floor(100000 + Math.random() * 900000);
            const username = `user${randomNumbers}`;
            const name = `user${randomNumbers}`;
            const phoneNumber = `+201${Math.floor(1000000 + Math.random() * 9000000)}`;

            await signUp.email({
                email: value,
                username: username,
                name: name,
                phoneNumber: phoneNumber,
                password: data.password,
                registeredWith: 'email'
            }, {
                onSuccess: async () => {
                    await emailOtp.sendVerificationOtp({
                        email: value,
                        type: "email-verification"
                    }, {
                        onSuccess: async () => {
                            await queryClient.invalidateQueries({ queryKey: ['session'] })
                            setPassword(data.password)
                            redirect("/verify")
                        },
                        onError: (ctx) => {
                            console.error(ctx.error.message)
                        }
                    })
                },
                onError: (ctx) => {
                    toast({
                        title: "Something went wrong",
                        description: ctx.error.message,
                        variant: 'destructive'
                    })
                }
            });
        } else if (context == 'phoneNumber') {
            await phoneNumber.sendOtp({
                phoneNumber: value
            }, {
                onSuccess: async () => {
                    setPassword(data.password)
                    redirect("/verify")
                },
                onError: (ctx) => {
                    console.error(ctx.error.message)
                },
            })
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onRegister)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="column"
                        disabled={true}
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        placeholder="Email Or Phone number"
                                        className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-400 hover:border-zinc-600 focus:border-zinc-500"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        placeholder="Password"
                                        className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-400 hover:border-zinc-600 focus:border-zinc-500"
                                        {...field}
                                    />
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
                                <FormControl>
                                    <Input
                                        placeholder="Confirm Password"
                                        className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-400 hover:border-zinc-600 focus:border-zinc-500"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <LoadingBtn isLoading={isLoading} label="Authenticate" />
                </form>
            </Form>
        </div>
    )
}