'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { redirect } from "next/navigation";
import { verifyOtpSchema, TVerifyOtpSchema } from "@/app/(authentication)/auth.types";
import { verifyOtp } from "@/app/(authentication)/auth.actions";
import AuthLayout from "@/app/(authentication)/auth/_components/auth-layout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { emailOtp, getSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import LoadingBtn from "@/components/loading-btn";

export default function Verify() {
    const [isLoading, setIsLoading] = useState(false)
    const queryClient = useQueryClient()
    const { toast } = useToast()

    const { data: session, isLoading: isPending } = useQuery({
        queryKey: ['session'],
        queryFn: async () => {
            const { data } = await getSession()
            return data
        }
    })

    useEffect(() => {
        if (isPending) return;
        if (!session || !session.user) redirect("/")
        else if (session.user.emailVerified && session.user.onBoarding) redirect("/onboarding")
        else if (session.user.emailVerified) redirect("/")
    }, [session, isPending])


    const form = useForm<TVerifyOtpSchema>({
        resolver: zodResolver(verifyOtpSchema),
    })

    const onVerify = async (data: TVerifyOtpSchema) => {
        setIsLoading(true)
        if (!session || !session.user) return;
        const result = await verifyOtp({ ...data, email: session.user.email });

        if (result.error) {
            toast({
                title: result.error.message,
                variant: 'destructive'
            })
            setIsLoading(false)
        } else {
            setIsLoading(false)
            await queryClient.invalidateQueries({ queryKey: ['session'] });
            redirect("/onboarding")
        }
    }

    const onSendOtp = async () => {
        if (!session || !session.user) return;
        setIsLoading(true)
        const result = await emailOtp.sendVerificationOtp({
            email: session.user.email,
            type: "email-verification",
        })
        if (result.error) {
            toast({
                title: result.error.message,
                variant: 'destructive'
            })
            setIsLoading(false)
            return;
        } else {
            toast({
                title: "OTP Sent",
                description: "Check your email and verify your account",
            })
            setIsLoading(false)
        }
    }

    if (isPending) return;

    return (
        <AuthLayout>
            <div className="w-full mb-6 flex flex-col space-y-6 sm:mb-8">
                <h3 className="text-2xl font-semibold text-zinc-100">Check your email </h3>
                <p className="text-teal-500">{session?.user.email}</p>
                <p className="text-gray-400">If this account exists, you will receive an email with a One Time Password (OTP). Type your OTP here to log in:</p>
                <Form {...form}>
                    <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onVerify)}>
                        <FormField
                            control={form.control}
                            name="otp"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <InputOTP className="flex w-full space-x-3" maxLength={6} {...field}>
                                            <InputOTPGroup className="flex flex-row gap-2 w-full">
                                                <InputOTPSlot className="w-full h-[2.3em] rounded-md border border-zinc-700 bg-zinc-900  text-center text-2xl leading-none text-zinc-200 transition placeholder:text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-300 focus:border-zinc-300 focus:outline-0" index={0} />
                                                <InputOTPSlot className="w-full h-[2.3em] rounded-md border border-zinc-700 bg-zinc-900  text-center text-2xl leading-none text-zinc-200 transition placeholder:text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-300 focus:border-zinc-300 focus:outline-0" index={1} />
                                                <InputOTPSlot className="w-full h-[2.3em] rounded-md border border-zinc-700 bg-zinc-900  text-center text-2xl leading-none text-zinc-200 transition placeholder:text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-300 focus:border-zinc-300 focus:outline-0" index={2} />
                                            </InputOTPGroup>
                                            <InputOTPSeparator />
                                            <InputOTPGroup className="flex flex-row gap-2 w-full">
                                                <InputOTPSlot className="w-full h-[2.3em] rounded-md border border-zinc-700 bg-zinc-900  text-center text-2xl leading-none text-zinc-200 transition placeholder:text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-300 focus:border-zinc-300 focus:outline-0" index={3} />
                                                <InputOTPSlot className="w-full h-[2.3em] rounded-md border border-zinc-700 bg-zinc-900  text-center text-2xl leading-none text-zinc-200 transition placeholder:text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-300 focus:border-zinc-300 focus:outline-0" index={4} />
                                                <InputOTPSlot className="w-full h-[2.3em] rounded-md border border-zinc-700 bg-zinc-900  text-center text-2xl leading-none text-zinc-200 transition placeholder:text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-300 focus:border-zinc-300 focus:outline-0" index={5} />
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <LoadingBtn isLoading={isLoading} label="Verify" />
                    </form>
                </Form>
                <Button variant="link" onClick={(() => onSendOtp())}>Didnt receive an email? Click here to resend</Button>
                <p className="text-sm text-gray-400">Emails may take up to 5 minutes to arrive. If you did not receive an email or your code did not work, please try again. If you encounter any issues, please visit our <span className="text-blue-500 hover:cursor-pointer hover:text-blue-400">support</span> page.</p>
            </div>
        </AuthLayout >
    )
}