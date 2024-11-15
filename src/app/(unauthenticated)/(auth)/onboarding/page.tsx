'use client'

import { changePassword, getSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import UploadPfp from "@/components/uploadPfp"
import OnboardingForm from "@/app/(unauthenticated)/(authentication)/onboarding/_components/onboarding-form"
import Header from "@/components/header"
import { useToast } from "@/hooks/use-toast"
import { updateUserSchema, TUpdateUserSchema } from "@/app/(unauthenticated)/(authentication)/auth.types"
import { useForm } from "react-hook-form"
import { updateUser } from "@/app/(unauthenticated)/(authentication)/auth.actions"
import { zodResolver } from "@hookform/resolvers/zod"
import { useImageStore } from "@/app/store"

export default function Onboarding() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [context, setContext] = useState<'email' | 'phoneNumber' | null>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const setTrigger = useImageStore((state) => state.setTrigger)

    const { data: session, isLoading: isPending } = useQuery({
        queryKey: ['session'],
        queryFn: async () => {
            const { data } = await getSession();
            return data;
        }
    })

    useEffect(() => {
        if (isPending) return;

        if (!session || !session.user) {
            router.replace('/')
            return;
        }

        if (session.user.registeredWith == 'phoneNumber' && !session.user.phoneNumberVerified) {
            router.replace("/verify");
            return;
        }

        if (session.user.registeredWith == 'email' && !session.user.emailVerified) {
            router.replace("/verify");
            return;
        }

        if (!session.user.onBoarding) {
            router.replace("/");
            return;
        }
        setContext(session.user.emailVerified ? 'email' : 'phoneNumber');
    }, [session, isPending, router]);

    useEffect(() => {
        console.log(context)
    }, [context])

    const form = useForm<TUpdateUserSchema>({
        resolver: zodResolver(updateUserSchema),
        defaultValues: {
            email: '',
            phoneNumber: '',
            name: '',
            username: '',
            bio: '',
        },
    });

    const onSubmit = async (data: TUpdateUserSchema) => {
        setIsLoading(true)
        if (!session || !context) return;

        const result = await updateUser({
            ...data,
            context: context,
            value: context == 'email' ? session.user.email || '' : session.user.phoneNumber || '',
            userId: session.user.id,
        })

        if (result && result.error) {
            setIsLoading(false)
            toast({
                title: result.error,
                variant: 'destructive'
            })
            return;
        }

        if (result && result.success) {
            setIsLoading(false)
            setTrigger(true)
            await queryClient.invalidateQueries({ queryKey: ['session'] })
            toast({
                title: 'Account updated successfully'
            })
            router.replace("/");
        }
    }

    if (!context || !session?.user || isPending) return;

    return (
        <div>
            <Header />
            {session && session.user && (
                <div className="flex flex-col gap-5 w-full p-6 mx-auto border-x border-b border-zinc-800 sm:p-8 md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
                    <p className="text-lg font-medium text-white sm:text-2xl">Set Profile Settings</p>
                    <UploadPfp />
                    <OnboardingForm
                        form={form}
                        onSubmit={onSubmit}
                        isLoading={isLoading}
                        context={context}
                        value={context == 'email' ? session.user.email || '' : session.user.phoneNumber || ''}
                    />
                </div>
            )}
        </div>
    )
}