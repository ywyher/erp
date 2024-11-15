'use client'

import Check from "@/app/(unauthenticated)/(authentication)/auth/_components/check"
import AuthLayout from "@/app/(unauthenticated)/(authentication)/auth/_components/auth-layout"
import { useEffect, useState } from "react"
import Register from "@/app/(unauthenticated)/(authentication)/auth/_components/register"
import Login from "@/app/(unauthenticated)/(authentication)/auth/_components/login"
import { useVerifyStore } from "@/app/(unauthenticated)/(authentication)/store"

export default function Auth() {
    const [port, setPort] = useState<'check' | 'register' | 'login'>('check')
    const { value } = useVerifyStore()

    useEffect(() => {
        console.log(`page.tsx`, value)
    }, [value])

    return (
        <AuthLayout>
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight text-white">Authenicate</h1>
                <p className="text-sm text-zinc-400">Welcome!</p>
            </div>
            {port === 'check' && <Check setPort={setPort} />}
            {port === 'register' && <Register />}
            {port === 'login' && <Login />}
        </AuthLayout>
    )
}