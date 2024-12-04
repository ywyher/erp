'use client';

import { FormFieldWrapper } from "@/components/formFieldWrapper";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { updateDoctorSchema } from "@/app/(authenticated)/dashboard/(admins)/doctors/types";
import { days as daysList, specialties } from "@/app/(authenticated)/dashboard/constants";
import LoadingBtn from "@/components/loading-btn";
import { Schedules } from "@/app/(authenticated)/dashboard/types";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UpdatePassword from "@/components/update-password";
import { useQuery } from "@tanstack/react-query";
import { getUserById } from "@/lib/db/queries";
import { Doctor, Schedule } from "@/app/types";
import { User } from "@/lib/auth-client";
import { isFakeEmail, normalizeData } from "@/lib/funcs";
import { updateDoctor } from "@/app/(authenticated)/dashboard/(admins)/doctors/actions";
import UpdateSchedule from "@/app/(authenticated)/dashboard/_components/update-schedule";
import { z } from "zod";
import { getErrorMessage } from "@/lib/handle-error";
import { toast } from "sonner";

function UpdateDialog({ children, open, setOpen }: { children: React.ReactNode, open: boolean, setOpen: Dispatch<SetStateAction<boolean>> }) {
    return (
        <div>
            <Button onClick={() => setOpen(true)}>Update Doctor</Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Doctor</DialogTitle>
                        {/* Add a DialogDescription here */}
                        <DialogDescription>
                            Fill out the form below to create a new doctor. All fields are required.
                        </DialogDescription>
                    </DialogHeader>
                    {children}
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function UpdateDoctor(
    {
        setPopOpen,
        userId
    }: {
        setPopOpen: Dispatch<SetStateAction<boolean>>,
        userId: string
    }
) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [open, setOpen] = useState<boolean>(false)
    const router = useRouter();

    const { data: user, isLoading: isPending } = useQuery({
        queryKey: ['userById', userId],
        queryFn: async () => {
            const data = await getUserById(userId, 'doctor');
            return data as { user: User, doctor: Doctor };
        }
    })

    const form = useForm<z.infer<typeof updateDoctorSchema>>({
        resolver: zodResolver(updateDoctorSchema),
    })

    useEffect(() => {
        if (user) {
            form.setValue('name', user.user.name || '')
            form.setValue('username', user.user.username || '')
            form.setValue('email', isFakeEmail(user.user.email) ? '' : user.user.email || '')
            form.setValue('phoneNumber', user.user.phoneNumber || '')
            form.setValue('nationalId', user.user.nationalId || '')
            form.setValue('specialty', user.doctor.specialty || '')
        }
    }, [user])

    const onCheckChangedFields = async (data: z.infer<typeof updateDoctorSchema>) => {
        if (!user) return;

        const normalizedSessionData = {
            name: normalizeData(user.user.name),
            email: isFakeEmail(user.user.email) ? '' : normalizeData(user.user.email),
            username: normalizeData(user.user.username),
            phoneNumber: normalizeData(user.user.phoneNumber),
            nationalId: normalizeData(user.user.nationalId),
            specialty: normalizeData(user.doctor.specialty),
        };

        const changedFields: Partial<{ [key in keyof z.infer<typeof updateDoctorSchema>]: string | null }> = {};

        for (const key in normalizedSessionData) {
            let formValue = normalizeData(data[key as keyof z.infer<typeof updateDoctorSchema>]);
            const sessionValue = normalizedSessionData[key as keyof typeof normalizedSessionData];

            if (formValue !== sessionValue) {
                changedFields[key as keyof typeof changedFields] = formValue;
            }
        }

        if (Object.keys(changedFields).length === 0) {
            getErrorMessage('No fields chagned thus no fields or schedules were updated.')
            return;
        }

        await onSubmit({ ...changedFields } as z.infer<typeof updateDoctorSchema>);
    };


    const onSubmit = async (data: z.infer<typeof updateDoctorSchema>) => {
        if (!user) return;

        setIsLoading(true)
        const result = await updateDoctor({ data, userId: user.user.id });

        if (result.error) {
            getErrorMessage(result.error)
            setIsLoading(false)
            return;
        }

        toast(result?.message)
        setIsLoading(false)
        form.reset()
        setOpen(false)
        router.push('/dashboard/doctors')
    };

    return (
        <UpdateDialog open={open} setOpen={setOpen}>
            <Tabs defaultValue="account">
                <TabsList>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="schedules">Schedules</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onCheckChangedFields)}>
                            <div className="flex flex-row gap-2">
                                <FormFieldWrapper form={form} name="name" label="Name" />
                                <FormFieldWrapper form={form} name="username" label="Username" />
                            </div>
                            <div className="flex flex-row gap-2">
                                <FormFieldWrapper form={form} name="email" label="Email" />
                                <FormFieldWrapper form={form} name="phoneNumber" label="Phone Number" />
                            </div>
                            <div className="flex flex-row gap-2">
                                <FormFieldWrapper form={form}
                                    name="nationalId"
                                    label="National Id"
                                />
                                <FormFieldWrapper form={form}
                                    name="specialty"
                                    label="Specialty"
                                    type="select"
                                    options={specialties}
                                />
                            </div>
                            <div className="mt-4">
                                <LoadingBtn isLoading={isLoading} label="Submit" />
                            </div>
                        </form>
                    </Form>
                </TabsContent>
                <TabsContent value="schedules">
                    <UpdateSchedule userId={userId} setOpen={setOpen} />
                </TabsContent>
                <TabsContent value="password">
                    <UpdatePassword userId={userId} setOpen={setOpen} revalidatePath="/dashboard" />
                </TabsContent>
            </Tabs>
        </UpdateDialog>
    );
}