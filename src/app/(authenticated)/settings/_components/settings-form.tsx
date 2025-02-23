'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getSession } from "@/lib/auth-client"
import { useEffect, useState } from "react"
import { useImageStore } from "@/app/store"
import LoadingBtn from "@/components/loading-btn"
import { isFakeEmail, normalizeData } from "@/lib/funcs"
import { z } from "zod"
import { userSchema } from "@/app/types"
import { FormFieldWrapper } from "@/components/formFieldWrapper"
import { getUserRegistrationType } from "@/lib/db/queries"
import { toast } from "sonner"
import { updateUser } from "@/lib/db/mutations"

type UpdateField = {
    value: string | null;
    nullable: boolean;
};

export default function SettingsForm() {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [registeredWith, setRegisteredWith] = useState<'both' | 'email' | 'phoneNumber' | 'none' | null>(null)

    const queryClient = useQueryClient()

    const { data: user, isLoading: isPending } = useQuery({
        queryKey: ['session', 'settingsForm'],
        queryFn: async () => {
            const { data } = await getSession()
            return data?.user || null
        }
    })

    const form = useForm<z.infer<typeof userSchema>>({
        resolver: zodResolver(userSchema),
    })

    useEffect(() => {
        (async () => {
            if (user) {
                const context = await getUserRegistrationType(user.id)
                setRegisteredWith(context)
            }
        })
        if (user) {
            form.setValue('name', user.name || '')
            form.setValue('username', user.username || '')
            form.setValue('email', isFakeEmail(user.email) ? '' : user.email || '')
            form.setValue('phoneNumber', user.phoneNumber || '')
            form.setValue('nationalId', user.nationalId || '')
        }
    }, [user])

    const onCheckChangedFields = async (data: z.infer<typeof userSchema>) => {
        if (!user) return;

        const normalizedSessionData = {
            name: normalizeData(user.name),
            email: isFakeEmail(user.email) ? '' : normalizeData(user.email),
            username: normalizeData(user.username || ""),
            phoneNumber: normalizeData(user.phoneNumber || ""),
            nationalId: normalizeData(user.nationalId || "")
        };

        const changedFields: Partial<z.infer<typeof userSchema>> = {};

        for (const key in normalizedSessionData) {
            let formValue = normalizeData(data[key as keyof z.infer<typeof userSchema>] as string);
            const sessionValue = normalizedSessionData[key as keyof typeof normalizedSessionData];

            if (formValue !== sessionValue) {
                changedFields[key as keyof typeof changedFields] = formValue;
            }
        }

        if (Object.keys(changedFields).length === 0) {
            toast.error("No Changes thus no fields were updated.");
            return;
        }

        await onSubmit(changedFields as z.infer<typeof userSchema>);
    };


    const onSubmit = async (data: z.infer<typeof userSchema>) => {
        if (!user || !user.id) return;
        setIsLoading(true)
        const result = await updateUser({ data, userId: user.id });

        if (result && result.error) {
            toast.error(result.error)
            setIsLoading(false)
            return;
        }

        toast("Settings were successfully updated.");
        queryClient.invalidateQueries({ queryKey: ['session'] });
        setIsLoading(false)
    };

    if (!user || isPending) return;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onCheckChangedFields)} className="flex flex-col gap-2">
                <FormFieldWrapper
                    form={form}
                    name='name'
                    label="Display Name"
                />
                <FormFieldWrapper
                    form={form}
                    name='username'
                    label="Username"
                />
                <FormFieldWrapper
                    form={form}
                    name='email'
                    label={`
                            Email
                            ${user.email && user.emailVerified ? '(verified)' : '(Unverified)'}
                        `}
                    optional={registeredWith != 'email' && isFakeEmail(user.email) ? true : false}
                    disabled={user.emailVerified}
                />
                <FormFieldWrapper
                    form={form}
                    name='phoneNumber'
                    label={`
                            PhoneNumber
                            ${user.phoneNumber && user.phoneNumberVerified ? `(verified)` : '(Unverified)'}
                        `}
                    optional={registeredWith != 'phoneNumber' && isFakeEmail(user.phoneNumber) ? true : false}
                    disabled={user.phoneNumberVerified ? true : false}
                />
                <FormFieldWrapper
                    form={form}
                    name='nationalId'
                    label="National Id"
                />
                <LoadingBtn className="mt-2" isLoading={isLoading}>
                    Update
                </LoadingBtn>
            </form>
        </Form>
    )
}