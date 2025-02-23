"use client"

import { changePassword } from "@/app/actions/db.actions";
import { passwordSchema, TPasswordSchema } from "@/app/types";
import { FormFieldWrapper } from "@/components/formFieldWrapper";
import LoadingBtn from "@/components/loading-btn";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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

    const form = useForm<TPasswordSchema>({
        resolver: zodResolver(passwordSchema)
    })

    const onUpdatePassword = async (data: TPasswordSchema) => {
        setIsLoading(true)
        const result = await changePassword({ ...data, userId, revalidatePath: revalidatePath ?? "" })

        if (result?.success) {
            if (setOpen) setOpen(false);
            toast(result.message)
            setIsLoading(false)
        }
    }

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onUpdatePassword)} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <FormFieldWrapper form={form} type="password" name="password" label="password" />
                        <FormFieldWrapper form={form} type="password" name="confirmPassword" label="Confirm password" />
                    </div>
                    <LoadingBtn isLoading={isLoading}>Update</LoadingBtn>
                </form>
            </Form>
        </div>
    )
}