'use client'

import { getSession } from "@/lib/auth-client"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import UploadPfp from "@/components/uploadPfp"
import OnboardingForm from "@/app/(authentication)/onboarding/_components/onboarding-form"
import Header from "@/components/header"


export default function Onboarding() {
    const [trigger, setTrigger] = useState<boolean>(false)

    const { data: session, isLoading: isPending } = useQuery({
        queryKey: ['session'],
        queryFn: async () => {
            const { data } = await getSession()
            return data
        }
    })

    useEffect(() => {
        if (!session || isPending) return;
        if (!session.user.emailVerified) redirect("/verify")
        else if (!session.user.onBoarding) redirect("/")
    }, [session, isPending])

    if (isPending) return;

    return (
        <div>
            <Header />
            {session && session.user && (
                <div className="flex flex-col gap-5 w-[40%] p-10 m-auto border-x border-b border-zinc-800">
                    <p className="text-2xl font-medium text-white">Set Profile Settings</p>
                    <UploadPfp setTrigger={setTrigger} trigger={trigger} />
                    <OnboardingForm setTrigger={setTrigger} />
                </div>
            )}
        </div>
    )
}
