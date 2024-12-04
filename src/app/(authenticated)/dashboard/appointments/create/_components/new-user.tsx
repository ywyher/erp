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
import { createUser } from "@/app/(authenticated)/dashboard/actions"
import { createAppointment } from "@/app/(authenticated)/dashboard/appointments/actions"
import { createUserSchema } from "@/app/(authenticated)/dashboard/types"
import { User } from "@/lib/db/schema"
import { getErrorMessage } from "@/lib/handle-error"
import { toast } from "sonner"

export default function NewUser({ userId, role, setPatientId }: {
    userId: string,
    role: 'receptionist' | 'doctor',
    setPatientId: Dispatch<SetStateAction<User['id'] | null>>
}) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [open, setOpen] = useState<boolean>(true)

    const router = useRouter()

    const form = useForm<z.infer<typeof userSchema>>({
        resolver: zodResolver(userSchema)
    })

    const handleCreateUser = async (data: z.infer<typeof userSchema> & { password?: string }) => {
        setIsLoading(true)
        data.password = data.nationalId
        const createdUser = await createUser({ data: data as z.infer<typeof createUserSchema>, role: 'user' })

        if (!createdUser || !createdUser?.success || createdUser?.error) {
            getErrorMessage(createdUser?.error)
            setIsLoading(false)
            return;
        }

        if (role == 'doctor') {
            handleCreateAppointment(createdUser.userId, userId)
        } else if (role == 'receptionist') {
            setPatientId(createdUser.userId)
            setOpen(false)
        }

    }

    const handleCreateAppointment = async (patientId: string, doctorId: string) => {
        const createdAppointment = await createAppointment({
            doctorId: doctorId,
            patientId: patientId,
            createdBy: role
        })

        if (!createdAppointment || !createdAppointment?.success) {
            getErrorMessage("Error while creating the appointment.")
            return;
        }

        if (createdAppointment?.success) {
            toast(createdAppointment.message)
            setOpen(false)
            router.push(`/dashboard/appointments/${createdAppointment.appointmentId}`)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
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
                            <LoadingBtn isLoading={isLoading} label="Submit" />
                        </div>
                    </form>
                </Form >
            </DialogContent>
        </Dialog>

    )
}