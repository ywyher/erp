'use client'

import { emailOtp, getSession, phoneNumber } from "@/lib/auth-client"
import { useQuery } from "@tanstack/react-query"
import { redirect, useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Mail, Phone, Router } from 'lucide-react'
import { useAuthStore } from "@/app/(auth)/store"
import { isFakeEmail } from "@/lib/funcs"
import LoadingBtn from "@/components/loading-btn"
import { useState } from "react"

export default function VerifyAlert() {
    const router = useRouter();
    const setValue = useAuthStore((state) => state.setValue)
    const setContext = useAuthStore((state) => state.setContext)
    const setOperation = useAuthStore((state) => state.setOperation)
    const setRedirectTo = useAuthStore((state) => state.setRedirectTo)

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { data: user, isPending } = useQuery({
        queryKey: ['session', 'verifyAlert'],
        queryFn: async () => {
            const { data } = await getSession()
            return data?.user || null
        }
    })

    if (!user || isPending) return <div className="flex justify-center items-center h-24">Loading...</div>

    const onSendOtp = async (context: 'email' | 'phoneNumber') => {
        if(context == 'email') {
            if(!user.email) return;
            setValue(user.email)
        }else if (context == 'phoneNumber') {
            if(!user.phoneNumber) return;
            setValue(user.phoneNumber)
        }
        setContext(context);
        setOperation("verify");
        router.replace("/verify");
        return;
    }

    return (
        <>
            {!user.emailVerified && !isFakeEmail(user.email) && (
               <div className="space-y-4 w-full max-w-4xl mx-auto py-2 px-4">
                    <Alert variant="destructive" className="py-2">
                        <Mail className="h-4 w-4" />
                        <AlertTitle>Verify your email</AlertTitle>
                        <AlertDescription>
                            Please verify your email address to ensure account security.
                            <LoadingBtn
                                isLoading={isLoading}
                                variant="outline"
                                size="sm"
                                className="ml-2 h-7 text-xs"
                                onClick={() => onSendOtp('email')}
                            >
                                Send Verification Email
                            </LoadingBtn>
                        </AlertDescription>
                    </Alert>
                </div>
            )}
            {!user.phoneNumberVerified && user.phoneNumber && (
                <div className="space-y-4 md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] mx-auto py-2">
                    <Alert variant="destructive" className="py-2">
                        <Phone className="h-4 w-4" />
                        <AlertTitle>Verify your phone number</AlertTitle>
                        <div className="grid grid-cols-3 items-center">
                            <AlertDescription className="col-span-2">
                                Adding a verified phone number helps secure your account.
                            </AlertDescription>
                            <LoadingBtn
                                isLoading={isLoading}
                                variant="outline"
                                size="sm"
                                className="ml-2 h-7 text-xs col-span-1"
                                onClick={() => onSendOtp('phoneNumber')}
                            >
                                Send Verification SMS
                            </LoadingBtn>
                        </div>
                    </Alert>
                </div>
            )}
        </>
    )
}