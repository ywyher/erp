'use client'

import { getSession } from "@/lib/auth-client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import UploadPfp from "@/components/uploadPfp"
import Header from "@/components/header"
import SettingsForm from "@/app/settings/_components/settings-form"
import PasswordForm from "@/app/settings/_components/password-form"
import { getUserProvider } from "@/app/actions/index.actions"


export default function Settings() {
    const [isUploadPfp, setIsUploadPfp] = useState<boolean>(false)
    const [trigger, setTrigger] = useState<boolean>(false)

    const { data: session, isLoading } = useQuery({
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
            const { provider } = await getUserProvider(session.user.id);
            return provider;
        },
        enabled: !!session
    });

    useEffect(() => {
        if (session) {
            if (!session.user) redirect("/")
            if (!session.user.emailVerified) redirect("/verify")
        }
    }, [session])


    if (isLoading) return;

    return (
        <div>
            <Header />
            {session && session.user && (
                <div className="w-[40%] p-10 m-auto border-x border-b border-zinc-800">
                    {provider == 'credential' ? (
                        <Tabs defaultValue="settings" className="w-full flex flex-col gap-3">
                            <TabsList className="w-full">
                                <TabsTrigger className="w-full" value="settings">Settings</TabsTrigger>
                                <TabsTrigger className="w-full" value="password">Password</TabsTrigger>
                            </TabsList>
                            <TabsContent value="settings" className="flex flex-col gap-3">
                                <p className="text-2xl font-medium text-white">Update Profile Settings</p>
                                <UploadPfp setTrigger={setTrigger} setIsUploadPfp={setIsUploadPfp} trigger={trigger} />
                                <SettingsForm isUploadPfp={isUploadPfp} setTrigger={setTrigger} />
                            </TabsContent>
                            <TabsContent value="password" className="flex flex-col gap-3">
                                <p className="text-2xl font-medium text-white">Update Profile Settings</p>
                                <PasswordForm />
                            </TabsContent>
                        </Tabs>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <p className="text-2xl font-medium text-white">Update Profile Settings</p>
                            <UploadPfp setTrigger={setTrigger} setIsUploadPfp={setIsUploadPfp} trigger={trigger} />
                            <SettingsForm isUploadPfp={isUploadPfp} setTrigger={setTrigger} />
                        </div>
                    )}

                </div>
            )}
        </div>
    )
}
