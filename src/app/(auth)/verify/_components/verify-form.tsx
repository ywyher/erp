'use client'

import AuthLayout from "@/app/(auth)/auth/_components/auth-layout";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { UseFormReturn } from "react-hook-form";
import LoadingBtn from "@/components/loading-btn";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { verifyOtpSchema } from "@/app/(auth)/types";

interface VerifyFormProps {
    form: UseFormReturn<z.infer<typeof verifyOtpSchema>>;
    onVerify: (data: z.infer<typeof verifyOtpSchema>) => Promise<void>;
    isLoading: boolean;
}

export default function VerifyForm({
    form,
    onVerify,
    isLoading,
}: VerifyFormProps) {
    return (
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
                <LoadingBtn isLoading={isLoading}>
                    Verify
                </LoadingBtn>
            </form>
        </Form>
    )
}