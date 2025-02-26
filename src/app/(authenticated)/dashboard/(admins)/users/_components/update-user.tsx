'use client';

import { FormFieldWrapper } from "@/components/form-field-wrapper";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { getChangedFields, isFakeEmail, normalizeData } from "@/lib/funcs";
import { getUserById } from "@/lib/db/queries";
import UpdatePassword from "@/components/update-password";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/lib/auth-client";
import LoadingBtn from "@/components/loading-btn";
import { revalidate } from "@/app/actions";
import { z } from "zod";
import { updateUserSchema } from "@/app/types";
import { toast } from "sonner";
import { updateUser } from "@/lib/db/mutations";
import DialogWrapper from "@/app/(authenticated)/dashboard/_components/dialog-wrapper";

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

    const form = useForm<z.infer<typeof updateUserSchema>>({
        resolver: zodResolver(updateUserSchema),
    });

    const onCheckChangedFields = async (data: z.infer<typeof updateUserSchema>) => {
        if (!user) return;

        const sessionData = {
            name: user.name,
            email: isFakeEmail(user.email) ? '' : user.email,
            username: user.username || "",
            phoneNumber: user.phoneNumber || "",
            nationalId: user.nationalId || "",
        };
    
        const changedFields = getChangedFields(sessionData, data);
        
        if (Object.keys(changedFields).length === 0) {
            toast.error("No changes made");
            return;
        }

        await onSubmit(changedFields as z.infer<typeof updateUserSchema>);
    };

    useEffect(() => {
        if (user) {
            form.reset({
                name: user.name || '',
                username: user.username || '',
                email: isFakeEmail(user.email) ? '' : user.email || '',
                phoneNumber: user.phoneNumber || '',
                nationalId: user.nationalId || '',
            });
        }
    }, [user, form.reset]);

    const onSubmit = async (data: z.infer<typeof updateUserSchema>) => {
        if (!user) return;
        setIsLoading(true)

        const normalizedData = normalizeData(data, 'object') as z.infer<typeof updateUserSchema>

        const result = await updateUser({ data: normalizedData, userId: userId, role: 'user' })

        if (result?.error) {
            toast.error(result.error)
            setIsLoading(false)
            return;
        }

        toast(result?.message)
        await revalidate('/dashboard/users')
        
        form.reset({
            name: "",
            email: "",
            username: "",
            phoneNumber: "",
            nationalId: "",
        });

        setIsLoading(false)
        setOpen(false)
        setPopOpen(false)
    };


    if (!user) return <div>Loading....</div>;

    return (
        <DialogWrapper open={open} setOpen={setOpen} label='user' operation="update">
            <Tabs defaultValue="account">
                <TabsList>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onCheckChangedFields)} className="flex flex-col gap-3">
                            <div className="flex flex-col gap-2">
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
                                        type="number"
                                        name="phoneNumber"
                                        label="Phone Number"
                                    />
                                </div>
                                <FormFieldWrapper
                                    form={form}
                                    type="number"
                                    name="nationalId"
                                    label="National Id"
                                />
                            </div>
                            <LoadingBtn isLoading={isLoading}>
                                Update
                            </LoadingBtn>
                        </form>
                    </Form>
                </TabsContent>
                <TabsContent value="password">
                    <UpdatePassword userId={userId} setOpen={setOpen} revalidatePath="/dashboard" />
                </TabsContent>
            </Tabs>
        </DialogWrapper>
    );
}