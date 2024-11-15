'use client'

import { getSession } from "@/lib/auth-client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import UploadPfp from "@/components/uploadPfp"
import Header from "@/components/header"
import SettingsForm from "@/app/(authenticated)/settings/_components/settings-form"
import PasswordForm from "@/app/(authenticated)/settings/_components/password-form"
import { getUserProvider } from "@/app/actions/index.actions"


export default function Settings() {
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

    if (isLoading) return;

    return (
        <div>
            <Header />
            {session && session.user && (
                <div className="flex flex-col gap-5 w-full p-6 mx-auto border-x border-b border-zinc-800 sm:p-8 md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
                    {provider == 'credential' ? (
                        <Tabs defaultValue="settings" className="w-full flex flex-col gap-3">
                            <TabsList className="w-full">
                                <TabsTrigger className="w-full" value="settings">Settings</TabsTrigger>
                                <TabsTrigger className="w-full" value="password">Password</TabsTrigger>
                            </TabsList>
                            <TabsContent value="settings" className="flex flex-col gap-3">
                                <p className="text-2xl font-medium text-white">Update Profile Settings</p>
                                <UploadPfp />
                                <SettingsForm />
                            </TabsContent>
                            <TabsContent value="password" className="flex flex-col gap-3">
                                <p className="text-2xl font-medium text-white">Update Profile Settings</p>
                                <PasswordForm />
                            </TabsContent>
                        </Tabs>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <p className="text-2xl font-medium text-white">Update Profile Settings</p>
                            <UploadPfp />
                            <SettingsForm />
                        </div>
                    )}

                </div>
            )}
        </div>
    )
}
