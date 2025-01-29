'use client';

import { FormFieldWrapper } from "@/components/formFieldWrapper";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { departments } from "@/app/(authenticated)/dashboard/constants";
import LoadingBtn from "@/components/loading-btn";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UpdatePassword from "@/components/update-password";
import { useQuery } from "@tanstack/react-query";
import { getUserById } from "@/lib/db/queries";
import { User } from "@/lib/auth-client";
import { isFakeEmail, normalizeData } from "@/lib/funcs";
import UpdateSchedule from "@/app/(authenticated)/dashboard/_components/update-schedule";
import { z } from "zod";
import { updateReceptionist } from "@/app/(authenticated)/dashboard/(admins)/receptionists/actions";
import { updateReceptionistSchema } from "@/app/(authenticated)/dashboard/(admins)/receptionists/types";
import { Receptionist } from "@/lib/db/schema";

import { toast } from "sonner";

function UpdateDialog({ children, open, setOpen }: { children: React.ReactNode, open: boolean, setOpen: Dispatch<SetStateAction<boolean>> }) {
    return (
        <div>
            <Button onClick={() => setOpen(true)}>Update Receptionist</Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Receptionist</DialogTitle>
                        {/* Add a DialogDescription here */}
                        <DialogDescription>
                            Fill out the form below to create a new receptionist. All fields are required.
                        </DialogDescription>
                    </DialogHeader>
                    {children}
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function UpdateReceptionist(
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
            const data = await getUserById(userId, 'receptionist');
            return data as { user: User, receptionist: Receptionist };
        }
    })

    const form = useForm<z.infer<typeof updateReceptionistSchema>>({
        resolver: zodResolver(updateReceptionistSchema),
    })

    useEffect(() => {
        if (user) {
            form.setValue('name', user.user.name || '')
            form.setValue('username', user.user.username || '')
            form.setValue('email', isFakeEmail(user.user.email) ? '' : user.user.email || '')
            form.setValue('phoneNumber', user.user.phoneNumber || '')
            form.setValue('nationalId', user.user.nationalId || '')
            form.setValue('department', user.receptionist.department || '')
        }
    }, [user])

    const onCheckChangedFields = async (data: z.infer<typeof updateReceptionistSchema>) => {
        if (!user) return;

        const normalizedSessionData = {
            name: normalizeData(user.user.name),
            email: isFakeEmail(user.user.email) ? '' : normalizeData(user.user.email),
            username: normalizeData(user.user.username || ""),
            phoneNumber: normalizeData(user.user.phoneNumber || ""),
            nationalId: normalizeData(user.user.nationalId || ""),
            department: normalizeData(user.receptionist.department),
        };

        const changedFields: Partial<{ [key in keyof z.infer<typeof updateReceptionistSchema>]: string | null }> = {};

        for (const key in normalizedSessionData) {
            let formValue = normalizeData(data[key as keyof z.infer<typeof updateReceptionistSchema>] as string);
            const sessionValue = normalizedSessionData[key as keyof typeof normalizedSessionData];

            if (formValue !== sessionValue) {
                changedFields[key as keyof typeof changedFields] = formValue;
            }
        }

        if (Object.keys(changedFields).length === 0) {
            toast.error('No changes were mde thus no fields or schedules were updated.')
            return;
        }

        await onSubmit({ ...changedFields } as z.infer<typeof updateReceptionistSchema>);
    };


    const onSubmit = async (data: z.infer<typeof updateReceptionistSchema>) => {
        if (!user) return;

        setIsLoading(true)
        const result = await updateReceptionist({ data, userId: user.user.id });

        if (result.error) {
            toast.error(result.error)
            setIsLoading(false)
            return;
        }

        toast(result.message)
        setIsLoading(false)
        form.reset()
        setOpen(false)
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
                            <FormFieldWrapper form={form}
                                name="nationalId"
                                label="National Id"
                            />
                            <div className="flex flex-row gap-2">
                                <FormFieldWrapper form={form}
                                    name="department"
                                    label="Department"
                                    type="select"
                                    options={departments}
                                />
                            </div>
                            <div className="mt-4">
                                <LoadingBtn isLoading={isLoading}>
                                    Update
                                </LoadingBtn>
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