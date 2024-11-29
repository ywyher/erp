'use client'

import { emailOtp, getSession, phoneNumber } from "@/lib/auth-client"
import { useQuery } from "@tanstack/react-query"
import { redirect } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Mail, Phone } from 'lucide-react'
import { useVerifyStore } from "@/app/(auth)/store"
import { isFakeEmail } from "@/lib/funcs"

export default function VerifyAlert() {
    const setValue = useVerifyStore((state) => state.setValue)
    const setContext = useVerifyStore((state) => state.setContext)
    const setOperation = useVerifyStore((state) => state.setOperation)
    const setRedirectTo = useVerifyStore((state) => state.setRedirectTo)

    const { data: user, isLoading } = useQuery({
        queryKey: ['session', 'verifyAlert'],
        queryFn: async () => {
            const { data } = await getSession()
            return data?.user || null
        }
    })

    if (!user || isLoading) return <div className="flex justify-center items-center h-24">Loading...</div>

    const onSendOtp = async (context: 'email' | 'phoneNumber') => {
        if (context === 'email') {
            if (!user.email) return;
            await emailOtp.sendVerificationOtp({
                email: user.email,
                type: "email-verification"
            }, {
                onSuccess: async () => {
                    setValue(user.email)
                    setContext('email')
                    setOperation('verify')
                    redirect('/verify')
                },
                onError: (ctx) => {
                    console.error(ctx.error.message)
                }
            })
        } else if (context === 'phoneNumber') {
            if (!user.phoneNumber) return;
            await phoneNumber.sendOtp({
                phoneNumber: user.phoneNumber
            }, {
                onSuccess: async () => {
                    setValue(user.phoneNumber || '')
                    setContext('phoneNumber')
                    setOperation('verify')
                    redirect('/verify')
                },
                onError: (ctx) => {
                    console.error(ctx.error.message)
                },
            })
        }
    }

    return (
        <div className="space-y-4 w-full max-w-4xl mx-auto py-2 px-4">
            {!user.emailVerified && !isFakeEmail(user.email) && (
                <Alert variant="destructive" className="py-2">
                    <Mail className="h-4 w-4" />
                    <AlertTitle>Verify your email</AlertTitle>
                    <AlertDescription>
                        Please verify your email address to ensure account security.
                        <Button
                            variant="outline"
                            size="sm"
                            className="ml-2 h-7 text-xs"
                            onClick={() => onSendOtp('email')}
                        >
                            Send Verification Email
                        </Button>
                    </AlertDescription>
                </Alert>
            )}
            {!user.phoneNumberVerified && user.phoneNumber && (
                <Alert variant="destructive" className="py-2">
                    <Phone className="h-4 w-4" />
                    <AlertTitle>Verify your phone number</AlertTitle>
                    <AlertDescription>
                        Adding a verified phone number helps secure your account.
                        <Button
                            variant="outline"
                            size="sm"
                            className="ml-2 h-7 text-xs"
                            onClick={() => onSendOtp('phoneNumber')}
                        >
                            Send Verification SMS
                        </Button>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    )
}