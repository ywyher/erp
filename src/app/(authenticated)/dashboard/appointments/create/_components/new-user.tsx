'use client'

import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Form } from "@/components/ui/form"
import { FormFieldWrapper } from "@/components/formFieldWrapper"
import LoadingBtn from "@/components/loading-btn"
import { z } from "zod"
import { userSchema } from "@/app/types"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { generateFakeField } from "@/lib/funcs"
import { createUser } from "@/app/(authenticated)/dashboard/actions"
import { createAppointment } from "@/app/(authenticated)/dashboard/appointments/actions"
import { createUserSchema } from "@/app/(authenticated)/dashboard/types"

export default function NewUser({ doctorId }: { doctorId: string }) {
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const router = useRouter()
    const { toast } = useToast()

    const form = useForm<z.infer<typeof userSchema>>({
        resolver: zodResolver(userSchema)
    })

    const handleCreateUser = async (data: z.infer<typeof userSchema> & { password?: string }) => {
        setIsLoading(true)
        data.password = data.nationalId
        const createdUser = await createUser({ data: data as z.infer<typeof createUserSchema>, role: 'user' })

        if (!createdUser || !createdUser?.success || createdUser?.error) {
            toast({
                title: "Error while creating the appointment.",
                description: createdUser?.error,
                variant: 'destructive'
            })
            return;
        }

        const createdAppointment = await createAppointment({
            doctorId: doctorId,
            patientId: createdUser.userId
        })

        if (!createdAppointment || !createdAppointment?.success) {
            toast({
                title: "Error while creating the appointment.",
                variant: 'destructive'
            })
            return;
        }

        if (createdUser.success && createdAppointment?.success) {
            toast({
                title: "Appointment created successfully redirecting...",
                description: createdAppointment.message,
            })
            router.push(`/dashboard/appointments/${createdAppointment.appointmentId}`)
        }

    }

    return (
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
    )
}