'use client';

import { FormFieldWrapper } from "@/components/formFieldWrapper";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LoadingBtn from "@/components/loading-btn";
import { createUserSchema } from "@/app/(authenticated)/dashboard/types";
import { z } from "zod";
import { createAdmin } from "@/app/(authenticated)/dashboard/(admins)/admins/action";
import { toast } from "sonner";
import DialogWrapper from "@/app/(authenticated)/dashboard/_components/dialog-wrapper";
import { normalizeData } from "@/lib/funcs";


export default function Create() {
    const [open, setOpen] = useState<boolean>(false)
    const [tab, setTab] = useState<'account' | 'password'>('account')
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const form = useForm<z.infer<typeof createUserSchema>>({
        resolver: zodResolver(createUserSchema),
    });

    const onSubmit = async (data: z.infer<typeof createUserSchema>) => {
        setIsLoading(true);
    
        const normalizedData = normalizeData(data, "object") as z.infer<typeof createUserSchema>;
    
        const result = await createAdmin(normalizedData);
    
        if (result?.error) {
            toast.error(result.error);
            setIsLoading(false);
            return;
        }
    
        toast("Done.", {
            description: result?.message,
        });
    
        form.reset({
            name: "",
            email: "",
            username: "",
            phoneNumber: "",
            nationalId: "",
            password: "",
            confirmPassword: "",
        });
        setTab("account");
        setIsLoading(false);
        setOpen(false);
    };
    

    const onError = () => {
        toast.error(`Please check all tabs for potential errors`)
    }

    return (
        <DialogWrapper open={open} setOpen={setOpen} label="admin" operation="create">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, onError)}>
                    <Tabs value={tab} onValueChange={(value) => setTab(value as 'account' | 'password')}>
                        <TabsList>
                            <TabsTrigger value="account">Account</TabsTrigger>
                            <TabsTrigger value="password">Password</TabsTrigger>
                        </TabsList>
                        <TabsContent value="account">
                            <div className="flex flex-row gap-3">
                                <FormFieldWrapper form={form} name="name" label="Name" />
                                <FormFieldWrapper form={form} name="username" label="Username" />
                            </div>
                            <div className="flex flex-row gap-3">
                                <FormFieldWrapper form={form} name="email" label="Email" />
                                <FormFieldWrapper form={form} type="number" name="phoneNumber" label="Phone Number" />
                            </div>
                            <FormFieldWrapper form={form} type="number" name="nationalId" label="National Id" />
                        </TabsContent>
                        <TabsContent value="password">
                            <div className="flex flex-row gap-3">
                                <FormFieldWrapper form={form} type="password" name="password" label="Password" />
                                <FormFieldWrapper form={form} type="password" name="confirmPassword" label="Confirm Password" />
                            </div>
                        </TabsContent>
                    </Tabs>
                    <div className="mt-4">
                        <LoadingBtn isLoading={isLoading}>
                            Create
                        </LoadingBtn>
                    </div>
                </form>
            </Form>
        </DialogWrapper>
    );
}