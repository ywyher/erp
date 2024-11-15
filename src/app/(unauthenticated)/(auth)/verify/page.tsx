'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";
import { redirect } from "next/navigation";
import { verifyOtpSchema, TVerifyOtpSchema } from "@/app/(unauthenticated)/(authentication)/auth.types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { emailOtp, getSession, phoneNumber, signUp } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import VerifyForm from "@/app/(unauthenticated)/(authentication)/verify/_components/form";
import { useVerifyStore } from "@/app/(unauthenticated)/(authentication)/store";
import UpdatePhoneNumberVerified from "@/app/(unauthenticated)/(authentication)/auth.actions";

export default function Verify() {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const value = useVerifyStore((state) => state.value)
    const context = useVerifyStore((state) => state.context)
    const password = useVerifyStore((state) => state.password)

    useEffect(() => {
        if (!value || !context || !password) redirect('/auth')
    }, [value, context])

    const form = useForm<TVerifyOtpSchema>({
        resolver: zodResolver(verifyOtpSchema),
    })

    const onVerify = async (data: TVerifyOtpSchema) => {
        setIsLoading(true)
        if (!value || !password) return;
        if (context == 'email') {
            await emailOtp.verifyEmail({
                email: value,
                otp: data.otp
            }, {
                onSuccess: async () => {
                    setIsLoading(false)
                    redirect("/onboarding");
                },
                onError: (ctx) => {
                    toast({
                        title: ctx.error.message,
                        variant: 'destructive'
                    })
                    setIsLoading(false)
                },
            });
        } else if (context == 'phoneNumber') {
            await phoneNumber.verify({
                phoneNumber: value,
                code: data.otp
            }, {
                onSuccess: async () => {
                    const randomNumbers = Math.floor(100000 + Math.random() * 900000);
                    const username = `user${randomNumbers}`;
                    const name = `user${randomNumbers}`;
                    const email = `${value}@${process.env.APP_NAME}.com`

                    const { data, error } = await signUp.email({
                        phoneNumber: value,
                        email: email,
                        username: username,
                        name: name,
                        password: password,
                        registeredWith: 'phoneNumber'
                    });

                    if (error) console.error(error.message);

                    const updatePhoneNumberVerified = UpdatePhoneNumberVerified(data?.user.id || '')

                    if (!updatePhoneNumberVerified) console.error('Phone number verified field no updated')

                    setIsLoading(false)
                    redirect("/onboarding");
                },
                onError: (ctx) => {
                    toast({
                        title: ctx.error.message,
                        variant: 'destructive'
                    })
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
                    toast({
                        title: "OTP Sent",
                        description: "Check your email and verify your account",
                    })
                    setIsLoading(false)
                },
                onError: (ctx) => {
                    toast({
                        title: ctx.error.message,
                        variant: 'destructive'
                    })
                    setIsLoading(false)
                    return;
                }
            })
        } else if (context == 'phoneNumber') {
            await phoneNumber.sendOtp({
                phoneNumber: value,
            }, {
                onSuccess: () => {
                    toast({
                        title: "OTP Sent",
                        description: "Check your email and verify your account",
                    })
                    setIsLoading(false)
                },
                onError: (ctx) => {
                    toast({
                        title: ctx.error.message,
                        variant: 'destructive'
                    })
                    setIsLoading(false)
                    return;
                }
            })
        }
    }

    if (!value || !context) redirect('/auth')

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