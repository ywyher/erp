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
import { settingsSchema, TSettingsSchema } from "@/app/(authenticated)/settings/settings.types"
import { updateSettings } from "@/app/(authenticated)/settings/settings.actions"
import { useImageStore } from "@/app/store"
import LoadingBtn from "@/components/loading-btn"
import { Textarea } from "@/components/ui/textarea"

export default function SettingsForm() {
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const queryClient = useQueryClient()
    const { toast } = useToast()

    const setTrigger = useImageStore((store) => store.setTrigger)

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
            email: session?.user.registeredWith == 'email' && session?.user.email || '',
            phoneNumber: session?.user.registeredWith == 'phoneNumber' && session?.user.phoneNumber || '',
            username: session?.user.username || '',
            bio: session?.user.bio || '',
            emailFake: session?.user.registeredWith != 'email' && session?.user.email || '',
            phoneNumberFake: session?.user.registeredWith != 'phoneNumber' && session?.user.phoneNumber || '',
        }
    })

    const onCheckChangedFields = async (data: TSettingsSchema) => {
        if (!session) return;

        // Extract user data from session
        const { name, email, username, bio, phoneNumber } = session.user;

        console.log(
            `name:` + name + '\n',
            `email:` + email + '\n',
            `username:` + username + '\n',
            `bio:` + bio + '\n',
            `phoneNumber:` + phoneNumber + '\n',
        )
        console.log(`#####################`)
        console.log(
            `name:` + data.name + '\n',
            `email:` + data.email + '\n',
            `username:` + data.username + '\n',
            `bio:` + data.bio + '\n',
            `phoneNumber:` + data.phoneNumber + '\n',
        )

        // Check if the submitted data matches the session data
        const isUnchanged =
            data.name === name &&
            data.email === email &&
            data.username === username &&
            data.bio === bio &&
            data.phoneNumber === phoneNumber;

        console.log(isUnchanged)

        // If no changes, show a toast and return early
        if (isUnchanged) {
            toast({
                title: "No Changes",
                description: "No fields were updated.",
                variant: "destructive",
            });
            return;
        }
    }


    if (!session || isPending) return;

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
                                    <Input {...field} className="w-full" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Email {session.user.registeredWith != 'email' && <span className="text-gray-500">(Optional)</span>}</FormLabel>
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
                                    <Input {...field} className="w-full" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {session.user.registeredWith != 'email'} {
                        <FormField
                            control={form.control}
                            name="emailFake"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>EmailFake</FormLabel>
                                    <FormControl>
                                        <Input {...field} className="w-full" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    }
                    {session.user.registeredWith != 'phoneNumber'} {
                        <FormField
                            control={form.control}
                            name="phoneNumberFake"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>PhoneNumberFake</FormLabel>
                                    <FormControl>
                                        <Input {...field} className="w-full" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    }
                    <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>PhoneNumber {session.user.registeredWith != 'phoneNumber' && <span className="text-gray-500">(Optional)</span>}</FormLabel>
                                <FormControl>
                                    <Input {...field} className="w-full" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bio <span className="text-gray-500">(optional)</span></FormLabel>
                            <FormControl>
                                <Textarea
                                    className="resize-none"
                                    maxLength={160}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <LoadingBtn label="Update" isLoading={isLoading} />
            </form>
        </Form >
    )
}