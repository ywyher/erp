'use client'

import { useState } from "react"
import { getSession } from "@/lib/auth-client"
import Login from "@/app/(authentication)/auth/_components/login"
import Check from "@/app/(authentication)/auth/_components/check"
import AuthLayout from "@/app/(authentication)/auth/_components/auth-layout"
import { useQuery } from "@tanstack/react-query"
import { getUserProvider } from "@/app/actions/index.actions"

export default function Auth() {
    const [port, setPort] = useState<"check" | "login">('check')
    const [email, setEmail] = useState<string | null>(null)

    const { data: session } = useQuery({
        queryKey: ['session'],
        queryFn: async () => {
            const { data } = await getSession();
            return data;
        }
    });

    const { data: provider } = useQuery({
        queryKey: ['provider', session?.user?.id],
        queryFn: async () => {
            if (!session) return;
            const { provider }: any = await getUserProvider(session.user.id);
            return provider;
        },
        enabled: !!session
    });

    return (
        <AuthLayout>
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight text-white">Authenicate</h1>
                <p className="text-sm text-zinc-400">Welcome!</p>
            </div>
            {port === 'check' && <Check provider={provider} setEmail={setEmail} setPort={setPort} />}
            {port === 'login' && <Login email={email ?? ''} />}
        </AuthLayout>
    )
}