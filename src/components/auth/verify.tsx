"use client"

import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { FieldErrors, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { toast } from "sonner";
import React, { Dispatch, SetStateAction, useState } from "react";
import { AuthIdentifier, AuthPort } from "@/components/auth/auth";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { useIsMobile } from "@/hooks/use-mobile";
import { emailOtp, signIn } from "@/lib/auth-client";
import LoadingBtn from "@/components/loading-btn";
import { useQueryClient } from "@tanstack/react-query";
import { getEmailByPhoneNumber, getEmailByUsername } from "@/lib/db/queries";
import { Button } from "@/components/ui/button";

export const verifySchema = z.object({
    otp: z.string().min(6, "OTP is required."),
});

type FormValues = z.infer<typeof verifySchema>;

type VerifyProps = { 
    setPort: Dispatch<SetStateAction<AuthPort>>,
    setOpen: Dispatch<SetStateAction<boolean>>,
    identifierValue: string
    password: string
    identifier: AuthIdentifier
}

export default function Verify({ 
    setPort,
    setOpen,
    identifierValue,
    password,
    identifier
}: VerifyProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const isMobile = useIsMobile()
    const queryClient = useQueryClient()

    const form = useForm<FormValues>({
        resolver: zodResolver(verifySchema),
        defaultValues: {
            otp: ""
        }
    })

    const onSubmit = async (formData: FormValues) => {
        if(!identifierValue || !password) return;
        setIsLoading(true)

        let email: string | null = identifierValue
        if(identifier == 'username') {
            email = await getEmailByUsername({ username: identifierValue }) || null
        }else if(identifier == 'phoneNumber') {
            email = await getEmailByPhoneNumber({ phoneNumber: identifierValue }) || null
        }
        
        if(!email) {
            toast.error("Failed to get email")
            return
        }

        const { error: verifyEmailError } = await emailOtp.verifyEmail({
            email: email,
            otp: formData.otp
        })

        if(verifyEmailError) {
            toast.error(verifyEmailError.message)
            form.setError('otp', { message: "Invalid OTP" })
            setIsLoading(false)
            return;
        } 

        const { error: signInError } = await signIn.email({
            email: email,
            password: password,
        });

        if(signInError) {
            setIsLoading(false);
            toast.error(signInError.message);
        }

        queryClient.invalidateQueries({ queryKey: ["session"] })
        setOpen(false)
        setPort('check')
    }

    const handleResendOtp = async () => {
        let email: string | null = identifierValue
        if(identifier == 'username') {
            email = await getEmailByUsername({ username: identifierValue }) || null
        }else if(identifier == 'phoneNumber') {
            email = await getEmailByPhoneNumber({ phoneNumber: identifierValue }) || null
        }

        if(!email) {
            toast.error("Failed to get email")
            return
        }

        const { error } = await emailOtp.sendVerificationOtp({
            email: email,
            type: "email-verification"
        })

        if(error) {
            toast.error(error.message)
            return;
        }

        toast.message("OTP Sent...", {
            description: "May take 1-5 mintues"
        })
    }

    const onError = (errors: FieldErrors<FormValues>) => {
        const position = isMobile ? "top-center" : "bottom-right"
        if (errors.otp) {
            toast.error(errors.otp.message, { position });
        }
    }

    return (
        <>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit, onError)}
                    className="flex flex-col gap-4 justify-center items-center w-full max-w-sm mx-auto"
                >
                    <FormField
                        control={form.control}
                        name="otp"
                        render={({ field }) => (
                            <FormItem className="w-full">
                            <FormLabel className="text-center block text-lg mb-2 font-semibold">
                                One-Time Password
                            </FormLabel>
                            <FormControl>
                                <InputOTP
                                    maxLength={6}
                                    {...field}
                                >
                                <InputOTPGroup className="flex flex-row gap-3">
                                    {[...Array(6)].map((_, index) =>
                                        index === 2 ? (
                                            <React.Fragment key={index}>
                                                <InputOTPSlot
                                                    index={index}
                                                    className="w-11 h-12 text-xl text-center border rounded-md focus:ring-2 focus:ring-primary transition-all"
                                                />
                                                <InputOTPSeparator className="mx-2 text-lg" />
                                            </React.Fragment>
                                        ) : (
                                            <InputOTPSlot
                                            key={index}
                                            index={index}
                                            className="w-11 h-12 text-xl text-center border rounded-md focus:ring-2 focus:ring-primary transition-all"
                                            />
                                        )
                                    )}
                                </InputOTPGroup>
                                </InputOTP>
                            </FormControl>
                            </FormItem>
                        )}
                    />
                    <LoadingBtn isLoading={isLoading} className="w-full">Verify</LoadingBtn>
                </form>
            </Form>
            <div 
                className="w-full max-w-sm mx-auto mt-2"
            >
                <Button 
                    variant="link" 
                    onClick={() => handleResendOtp()}
                    className="w-fit text-start m-0 p-0"
                >
                    Didnt recieve an email ?
                </Button>
            </div>
        </>
    )
}