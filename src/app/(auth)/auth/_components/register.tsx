'use client'

import { useForm } from "react-hook-form"
import {
    Form,
} from "@/components/ui/form"
import { registerSchema } from "@/app/(auth)/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useVerifyStore } from "@/app/(auth)/store"
import LoadingBtn from "@/components/loading-btn"
import { useState } from "react"
import { redirect } from "next/navigation"
import { emailOtp, phoneNumber, signUp } from "@/lib/auth-client"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { generateFakeField } from "@/lib/funcs"
import { z } from "zod"
import { FormFieldWrapper } from "@/components/formFieldWrapper"
import { toast } from "sonner"

export default function Register() {
    const [isLoading, setIsLoading] = useState(false)
    const value = useVerifyStore((state) => state.value)
    const context = useVerifyStore((state) => state.context)
    const setOperation = useVerifyStore((state) => state.setOperation)
    const setPassword = useVerifyStore((state) => state.setPassword)
    const queryClient = useQueryClient()

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            field: value || '',
            password: '',
            confirmPassword: ''
        }
    })

    const handleRegister = async (data: z.infer<typeof registerSchema>) => {
        if (!value) return;
        setIsLoading(true)
        if (context == 'email') {
            const username = generateFakeField("username");
            const name = generateFakeField("name") || '';

            await signUp.email({
                email: value,
                username: username,
                name: name,
                password: data.password,
                role: 'user'
            }, {
                onSuccess: async () => {
                    await emailOtp.sendVerificationOtp({
                        email: value,
                        type: "email-verification"
                    }, {
                        onSuccess: async () => {
                            await queryClient.invalidateQueries({ queryKey: ['session'] })
                            setOperation('register')
                            setPassword(data.password)
                            redirect("/verify")
                        },
                        onError: (ctx) => {
                            console.error(ctx.error.message)
                        }
                    })
                },
                onError: (ctx) => {
                    toast.error(ctx.error.message)
                }
            });
        } else if (context == 'phoneNumber') {
            await phoneNumber.sendOtp({
                phoneNumber: value
            }, {
                onSuccess: async () => {
                    setOperation('register')
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
                <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4">
                    <FormFieldWrapper disabled={true} form={form} name='field' label={context || ""} placeholder="Email Or Phone number" />
                    <FormFieldWrapper form={form} name='password' label='Password' />
                    <FormFieldWrapper form={form} name='confirmPassword' label='Confirm Password' />
                    <div className="mt-2">
                        <LoadingBtn isLoading={isLoading}>
                            Register
                        </LoadingBtn>
                    </div>
                </form>
            </Form>
        </div>
    )
}