'use client'

import { UseFormReturn } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { TUpdateUserSchema } from "@/app/(unauthenticated)/(authentication)/auth.types"
import LoadingBtn from "@/components/loading-btn"
import { Textarea } from "@/components/ui/textarea"
import { useEffect } from "react"

export default function OnboardingForm({
    form,
    onSubmit,
    isLoading,
    context,
    value
}: {
    form: UseFormReturn<TUpdateUserSchema>,
    onSubmit: (data: TUpdateUserSchema) => Promise<void>,
    isLoading: boolean
    context: 'email' | 'phoneNumber'
    value: string
}) {

    useEffect(() => {
        if (context === 'email') {
            form.setValue('email', value);
        } else if (context === 'phoneNumber') {
            form.setValue('phoneNumber', value);
        }
    }, [context, value, form]);


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:gap-2">
                <div className="flex flex-col gap-4 sm:gap-2">
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
                        disabled={context == 'email'}
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Email {context == 'phoneNumber' && <span className="text-gray-500">(optional)</span>}</FormLabel>
                                <FormControl>
                                    <Input {...field} className="w-full" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex flex-col gap-4 sm:gap-2">
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
                    <FormField
                        control={form.control}
                        disabled={context == 'phoneNumber'}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Phone Number {context == 'email' && <span className="text-gray-500">(optional)</span>}</FormLabel>
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
                <LoadingBtn isLoading={isLoading} label="Save" />
            </form>
        </Form>
    )
}