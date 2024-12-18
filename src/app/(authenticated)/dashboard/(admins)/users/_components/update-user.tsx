'use client';

import { FormFieldWrapper } from "@/components/formFieldWrapper";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { isFakeEmail, normalizeData } from "@/lib/funcs";
import { getUserById } from "@/lib/db/queries";
import UpdatePassword from "@/components/update-password";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/lib/auth-client";
import LoadingBtn from "@/components/loading-btn";
import { revalidate, updateUser } from "@/app/actions";
import { z } from "zod";
import { userSchema } from "@/app/types";
import { revalidatePath } from "next/cache";

import { toast } from "sonner";

function UpdateDialog({ children, open, setOpen }: { children: React.ReactNode, open: boolean, setOpen: Dispatch<SetStateAction<boolean>> }) {
    return (
        <div>
            <Button className="w-full" variant={'outline'} onClick={() => setOpen(true)}>Update</Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update User</DialogTitle>
                        <DialogDescription>
                            Fill out the form below to create a new user. All fields are required.
                        </DialogDescription>
                    </DialogHeader>
                    {children}
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function UpdateUser(
    {
        setPopOpen,
        userId
    }: {
        setPopOpen: Dispatch<SetStateAction<boolean>>,
        userId: string
    }
) {
    const [open, setOpen] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)


    const { data: user, isLoading: isPending } = useQuery({
        queryKey: ['userById', userId],
        queryFn: async () => {
            const data = await getUserById(userId, 'user');
            return data as User;
        }
    })

    const form = useForm<z.infer<typeof userSchema>>({
        resolver: zodResolver(userSchema),
    });

    const onCheckChangedFields = async (data: z.infer<typeof userSchema>) => {
        if (!user) return;

        const normalizedSessionData = {
            name: normalizeData(user.name),
            email: isFakeEmail(user.email) ? '' : normalizeData(user.email),
            username: normalizeData(user.username),
            phoneNumber: normalizeData(user.phoneNumber),
            nationalId: normalizeData(user.nationalId)
        };

        const changedFields: Partial<z.infer<typeof userSchema>> = {};

        for (const key in normalizedSessionData) {
            let formValue = normalizeData(data[key as keyof z.infer<typeof userSchema>]);
            const sessionValue = normalizedSessionData[key as keyof typeof normalizedSessionData];

            if (formValue !== sessionValue) {
                changedFields[key as keyof typeof changedFields] = formValue;
            }
        }

        if (Object.keys(changedFields).length === 0) {
            toast.error("No changes were made thus no fields were updated.")
            return;
        }

        await onSubmit(changedFields as z.infer<typeof userSchema>);
    };

    useEffect(() => {
        if (user) {
            form.setValue('name', user.name || '')
            form.setValue('username', user.username || '')
            form.setValue('email', isFakeEmail(user.email) ? '' : user.email || '')
            form.setValue('phoneNumber', user.phoneNumber || '')
            form.setValue('nationalId', user.nationalId || '')
        }
    }, [user])

    const onSubmit = async (data: z.infer<typeof userSchema>) => {
        if (!user) return;
        setIsLoading(true)
        const result = await updateUser({ data, userId: userId })

        if (result?.error) {
            toast.error(result.error)
            setIsLoading(false)
            return;
        }

        toast(result?.message)
        await revalidate('/dashboard/users')
        form.reset()
        setIsLoading(false)
        setOpen(false)
        setPopOpen(false)
    };


    if (!user) return <div>Loading....</div>;

    return (
        <UpdateDialog open={open} setOpen={setOpen}>
            <Tabs defaultValue="account">
                <TabsList>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onCheckChangedFields)}>
                            <div className="flex flex-row gap-2">
                                <FormFieldWrapper
                                    form={form}
                                    name="name"
                                    label="Name"
                                />
                                <FormFieldWrapper
                                    form={form}
                                    name="username"
                                    label="Username"
                                />
                            </div>
                            <div className="flex flex-row gap-2">
                                <FormFieldWrapper
                                    form={form}
                                    name="email"
                                    label="Email"
                                />
                                <FormFieldWrapper
                                    form={form}
                                    name="phoneNumber"
                                    label="Phone Number"
                                />
                            </div>
                            <FormFieldWrapper
                                form={form}
                                name="nationalId"
                                label="National Id"
                            />
                            <div className="mt-4">
                                <LoadingBtn isLoading={isLoading}>
                                    Update
                                </LoadingBtn>
                            </div>
                        </form>
                    </Form>
                </TabsContent>
                <TabsContent value="password">
                    <UpdatePassword userId={userId} setOpen={setOpen} revalidatePath="/dashboard" />
                </TabsContent>
            </Tabs>
        </UpdateDialog>
    );
}