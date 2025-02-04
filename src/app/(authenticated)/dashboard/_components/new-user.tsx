'use client'

import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { FormFieldWrapper } from "@/components/formFieldWrapper"
import LoadingBtn from "@/components/loading-btn"
import { z } from "zod"
import { userSchema } from "@/app/types"
import { Dispatch, SetStateAction, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { generateFakeField } from "@/lib/funcs"
import { createUserSchema } from "@/app/(authenticated)/dashboard/types"
import { User } from "@/lib/db/schema"
import { toast } from "sonner"
import { createUser } from "@/lib/db/mutations"

export default function NewUser({ setCreatedUserId, setIsCreateUser }: {
    setCreatedUserId: Dispatch<SetStateAction<User['id'] | null>>,
    setIsCreateUser: Dispatch<SetStateAction<boolean>>,
}) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [open, setOpen] = useState<boolean>(true)

    const form = useForm<z.infer<typeof userSchema>>({
        resolver: zodResolver(userSchema)
    })

    const handleCreateUser = async (data: z.infer<typeof userSchema> & { password?: string }) => {
        setIsLoading(true)
        data.password = data.nationalId
        const createdUser = await createUser({ data: data as z.infer<typeof createUserSchema>, role: 'user' })

        if (!createdUser || !createdUser?.success || createdUser?.error) {
            toast.error(createdUser?.error)
            setIsLoading(false)
            return;
        }

        setCreatedUserId(createdUser.userId)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setIsCreateUser}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleCreateUser)}>
                        <div className="flex flex-row gap-2">
                            <FormFieldWrapper form={form} name="name" label="Name" />
                            <FormFieldWrapper defaultValue={generateFakeField('username')} form={form} name="username" label="Username" />
                        </div>
                        <div className="flex flex-row gap-2">
                            <FormFieldWrapper form={form} name="email" label="Email" />
                            <FormFieldWrapper form={form} name="phoneNumber" label="Phone Number" />
                        </div>
                        <FormFieldWrapper form={form} name="nationalId" label="National Id" />
                        <div className="mt-4">
                            <LoadingBtn isLoading={isLoading}>
                                Create
                            </LoadingBtn>
                        </div>
                    </form>
                </Form >
            </DialogContent>
        </Dialog>

    )
}