'use client'

import { changePassword } from "@/app/actions/db.actions";
import { passwordSchema, TPasswordSchema } from "@/app/types";
import { FormFieldWrapper } from "@/components/formFieldWrapper";
import LoadingBtn from "@/components/loading-btn";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";

export default function UpdatePassword(
    {
        userId,
        setOpen,
        revalidatePath,
    }:
        {
            userId: string,
            setOpen?: Dispatch<SetStateAction<boolean>>
            revalidatePath?: string
        }
) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const { toast } = useToast()

    const form = useForm<TPasswordSchema>({
        resolver: zodResolver(passwordSchema)
    })

    const onUpdatePassword = async (data: TPasswordSchema) => {
        setIsLoading(true)
        const result = await changePassword({ ...data, userId, revalidatePath: revalidatePath ?? "" })

        if (result?.success) {
            if (setOpen) setOpen(false);
            toast({
                title: 'Success',
                description: result.message
            })
            setIsLoading(false)
        }
    }

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onUpdatePassword)}>
                    <FormFieldWrapper form={form} name='password' label="password" />
                    <FormFieldWrapper form={form} name='confirmPassword' label="Confirm password" />
                    <LoadingBtn isLoading={isLoading} label="Submit" />
                </form>
            </Form>
        </div>
    )
}