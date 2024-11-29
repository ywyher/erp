'use client'

import { changePassword, getSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import UploadPfp from "@/components/uploadPfp"
import OnboardingForm from "@/app/(auth)/onboarding/_components/onboarding-form"
import Header from "@/components/header"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useImageStore } from "@/app/store"
import { z } from "zod"
import { userSchema } from "@/app/types"
import { getUserRegistrationType } from "@/lib/db/queries"
import { updateUser } from "@/app/actions"
import { excludeField } from "@/lib/funcs"
import { updateOnboarding } from "@/app/(auth)/actions"

export default function Onboarding() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [context, setContext] = useState<'email' | 'phoneNumber' | null>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const setTrigger = useImageStore((state) => state.setTrigger)

    const { data: user, isLoading: isPending } = useQuery({
        queryKey: ['session', 'onboarding'],
        queryFn: async () => {
            const { data } = await getSession();
            return data?.user || null
        }
    })

    useEffect(() => {
        if (!user) return;

        const handleRules = async () => {
            try {
                if (!user.onBoarding) {
                    router.replace("/")
                    return
                }
                const registeredWith = await getUserRegistrationType(user.id)
                if (registeredWith === 'phoneNumber' && !user.phoneNumberVerified) {
                    router.replace('/')
                    return
                }
                if (registeredWith === 'email' && !user.emailVerified) {
                    router.replace('/')
                    return
                }
            } catch (error) {
                console.error("Error in handleRules:", error)
                // Handle error appropriately
            }
        }

        handleRules()
        setContext(user.emailVerified ? 'email' : 'phoneNumber');
    }, [user, router]);

    const form = useForm<z.infer<typeof userSchema>>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            email: '',
            phoneNumber: '',
            name: '',
            username: '',
            nationalId: ''
        },
    });

    const handleSubmit = async (data: z.infer<typeof userSchema>) => {
        setIsLoading(true)
        if (!user || !context) return;

        const fieldToRemove = context; // Could be "email" or "phoneNumber"
        const dataWithoutField = excludeField(data, fieldToRemove);

        const updatedUser = await updateUser({
            data: dataWithoutField,
            userId: user.id
        })

        if (updatedUser && updatedUser.error) {
            setIsLoading(false)
            toast({
                title: updatedUser.error,
                variant: 'destructive'
            })
            return;
        }

        const updatedOnboarding = await updateOnboarding(updatedUser?.userId || '', false)

        if (updatedUser && updatedUser.success && updatedOnboarding && updatedOnboarding.success) {
            setIsLoading(false)
            setTrigger(true)
            await queryClient.invalidateQueries({ queryKey: ['session'] })
            toast({
                title: 'Account updated successfully'
            })
            router.replace("/");
        }
    }

    if (!context || !user || isPending) return;

    return (
        <div>
            <Header />
            {user && (
                <div className="flex flex-col gap-5 w-full p-6 mx-auto border-x border-b border-zinc-800 sm:p-8 md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
                    <p className="text-lg font-medium text-white sm:text-2xl">Set Profile Settings</p>
                    <UploadPfp />
                    <OnboardingForm
                        form={form}
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                        context={context}
                        value={context == 'email' ? user.email || '' : user.phoneNumber || ''}
                    />
                </div>
            )}
        </div>
    )
}