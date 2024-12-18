'use client'

import { UseFormReturn } from "react-hook-form"
import { Form } from "@/components/ui/form"
import LoadingBtn from "@/components/loading-btn"
import { useEffect } from "react"
import { FormFieldWrapper } from "@/components/formFieldWrapper"
import { z } from "zod"
import { userSchema } from "@/app/types"

export default function OnboardingForm({
    form,
    onSubmit,
    isLoading,
    context,
    value
}: {
    form: UseFormReturn<z.infer<typeof userSchema>>,
    onSubmit: (data: z.infer<typeof userSchema>) => Promise<void>,
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
                <FormFieldWrapper
                    form={form}
                    name="name"
                    label="Full Name"
                />
                <FormFieldWrapper
                    form={form}
                    name="email"
                    disabled={context == 'email'}
                    optional={context == 'phoneNumber'}
                    label="Email"
                />
                <FormFieldWrapper
                    form={form}
                    name="username"
                    label="username"
                />
                <FormFieldWrapper
                    form={form}
                    name="phoneNumber"
                    disabled={context == 'phoneNumber'}
                    optional={context == 'email'}
                    label="PhoneNumber"
                />
                <FormFieldWrapper
                    form={form}
                    name="nationalId"
                    label="National Id"
                />
                <LoadingBtn isLoading={isLoading}>
                    Save
                </LoadingBtn>
            </form>
        </Form>
    )
}