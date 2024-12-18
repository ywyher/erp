'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";
import { redirect } from "next/navigation";
import { verifyOtpSchema } from "@/app/(auth)/types";
import { emailOtp, phoneNumber, signUp } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import VerifyForm from "@/app/(auth)/verify/_components/verify-form";
import { useVerifyStore } from "@/app/(auth)/store";
import { updatePhoneNumberVerified } from "@/app/(auth)/actions";
import { useQueryClient } from "@tanstack/react-query";
import { generateFakeField } from "@/lib/funcs";
import { z } from "zod";

import { toast } from "sonner";

export default function Verify() {
    const [isLoading, setIsLoading] = useState(false)
    const value = useVerifyStore((state) => state.value)
    const context = useVerifyStore((state) => state.context)
    const operation = useVerifyStore((state) => state.operation)
    const password = useVerifyStore((state) => state.password)
    const redirectTo = useVerifyStore((state) => state.redirectTo)
    const queryClient = useQueryClient()

    useEffect(() => {
        if (!value || !context) redirect('/auth')
        if (operation == 'register' && !password) redirect('/auth')
    }, [value, context])

    const form = useForm<z.infer<typeof verifyOtpSchema>>({
        resolver: zodResolver(verifyOtpSchema),
    })

    const onVerify = async (data: z.infer<typeof verifyOtpSchema>) => {
        setIsLoading(true)
        if (!value) return;
        if (operation == 'register' && !password) redirect('/auth')
        if (context == 'email') {
            await emailOtp.verifyEmail({
                email: value,
                otp: data.otp
            }, {
                onSuccess: async () => {
                    if (operation == 'register') {
                        await queryClient.invalidateQueries({ queryKey: ['session'] })
                        setIsLoading(false)
                        redirect("/onboarding");
                    } else {
                        await queryClient.invalidateQueries({ queryKey: ['session'] })
                        setIsLoading(false)
                        if (redirectTo) {
                            redirect(redirectTo)
                        } else {
                            redirect('/')
                        }
                    }
                },
                onRequest: () => {
                    console.log('loading')
                },
                onError: (ctx) => {
                    toast.error(ctx.error.message)
                    setIsLoading(false)
                },
            });
        } else if (context == 'phoneNumber') {
            await phoneNumber.verify({
                phoneNumber: value,
                code: data.otp
            }, {
                onSuccess: async () => {
                    if (operation == 'register') {
                        if (!password) return
                        console.log('register')
                        const username = generateFakeField("username");
                        const name = generateFakeField("name");
                        const email = generateFakeField('email', value) // value: password

                        if (!username || !email || !name) throw new Error("errorrrrr")

                        const { data, error } = await signUp.email({
                            phoneNumber: value,
                            email: email,
                            username: username,
                            name: name,
                            password: password,
                        });

                        if (error) console.error(error.message);

                        const phoneNumberVerifiedUpdated = await updatePhoneNumberVerified(data?.user.id || '')

                        if (!phoneNumberVerifiedUpdated) console.error('Phone number verified field no updated')

                        await queryClient.invalidateQueries({ queryKey: ['session'] })
                        setIsLoading(false)
                        redirect("/onboarding")
                    } else {
                        console.log('verify')
                        await queryClient.invalidateQueries({ queryKey: ['session'] })
                        setIsLoading(false)
                        if (redirectTo) {
                            redirect(redirectTo)
                        } else {
                            redirect('/')
                        }
                    }
                },
                onError: (ctx) => {
                    toast.error(ctx.error.message)
                    setIsLoading(false)
                }
            })
        }

    }

    const onSendOtp = async () => {
        if (!value) return
        setIsLoading(true)
        if (context == 'email') {
            await emailOtp.sendVerificationOtp({
                email: value,
                type: "email-verification",
            }, {
                onSuccess: () => {
                    toast("OTP Sent", {
                        description: "Check your email and verify your account",
                    })
                    setIsLoading(false)
                },
                onError: (ctx) => {
                    toast.error(ctx.error.message)
                    setIsLoading(false)
                    return;
                }
            })
        } else if (context == 'phoneNumber') {
            await phoneNumber.sendOtp({
                phoneNumber: value,
            }, {
                onSuccess: () => {
                    toast("OTP Sent", {
                        description: "Check your email and verify your account",
                    })
                    setIsLoading(false)
                },
                onError: (ctx) => {
                    toast.error(ctx.error.message)
                    setIsLoading(false)
                    return;
                }
            })
        }
    }

    if (!value || !context) return;

    return (
        <VerifyForm
            form={form}
            onVerify={onVerify}
            onSendOtp={onSendOtp}
            value={value}
            context={context}
            isLoading={isLoading}
        />
    )
}