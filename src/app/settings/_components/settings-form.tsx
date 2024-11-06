'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getSession } from "@/lib/auth-client"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { settingsSchema, TSettingsSchema } from "@/app/settings/settings.types"
import { updateSettings } from "@/app/settings/settings.actions"

export default function SettingsForm(
    {
        isUploadPfp,
        setTrigger
    }:
        {
            isUploadPfp: boolean,
            setTrigger: React.Dispatch<React.SetStateAction<boolean>>
        }) {
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const queryClient = useQueryClient()
    const { toast } = useToast()

    const { data: session, isLoading: isPending } = useQuery({
        queryKey: ['session'],
        queryFn: async () => {
            const { data } = await getSession()
            return data
        }
    })

    const form = useForm<TSettingsSchema>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            name: session?.user.name || '',
            email: session?.user.email || '',
            username: session?.user.username || '',
            bio: session?.user.bio || '',
        }
    })

    const onCheckChangedFields = async (data: TSettingsSchema) => {
        if (!session) return;

        // Identify fields that have changed compared to session.user, excluding email
        const changedFields = Object.keys(data).reduce((acc, key) => {
            if (key !== 'email' && data[key as keyof TSettingsSchema] !== session.user[key as keyof TSettingsSchema]) {
                acc[key as keyof TSettingsSchema] = data[key as keyof TSettingsSchema]
            }
            return acc
        }, {} as Partial<TSettingsSchema>)

        // If isUploadPfp is true, we treat it as a changed field
        if (isUploadPfp) {
            // If there are no other changed fields, only trigger the upload and exit
            if (Object.keys(changedFields).length === 0) {
                setTrigger(true)
                return
            }
            // Otherwise, pass all changed fields to onSubmit
            const result = await onSubmit({ ...changedFields } as TSettingsSchema)
            if (result?.success) {
                setTrigger(true)
            }
        } else if (Object.keys(changedFields).length > 0) {
            // If fields other than email changed, submit only the changed fields
            await onSubmit({ ...changedFields } as TSettingsSchema)
        } else {
            // No changes detected
            toast({
                title: 'No changes detected',
                description: 'No updates have been made to your profile.',
                variant: 'destructive'
            })
        }
    }


    const onSubmit = async (data: TSettingsSchema) => {
        if (!session) return;
        setIsLoading(true)

        const result = await updateSettings({
            ...data,
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
            queryClient.invalidateQueries({ queryKey: ['session'] })
            setIsLoading(false)
            toast({
                title: 'Profile Updated',
                description: 'Your profile was successfully updated.',
            })
            return {
                success: true
            }
        }
    }

    if (isPending) return;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onCheckChangedFields)} className="flex flex-col gap-2">
                <div className="flex flex-col gap-2">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Display Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="ywyh" {...field} className="w-full" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        disabled
                        defaultValue={session?.user.email}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input {...field} className="w-full" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input placeholder="ywyher" {...field} className="w-full" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Bio <span className="text-gray-500">(optional)</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="Something..." {...field} className="w-full" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button
                    type="submit"
                    className="w-full bg-[#E4E4E7] text-black hover:bg-white"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            ></path>
                        </svg>
                    ) : (
                        "Save"
                    )}
                </Button>
            </form>
        </Form>
    )
}