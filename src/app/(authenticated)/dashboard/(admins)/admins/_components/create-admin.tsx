'use client';

import { FormFieldWrapper } from "@/components/formFieldWrapper";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import LoadingBtn from "@/components/loading-btn";
import { normalizeData } from "@/lib/funcs";
import { createUserSchema } from "@/app/(authenticated)/dashboard/types";
import { z } from "zod";
import { createAdmin } from "@/app/(authenticated)/dashboard/(admins)/admins/action";

function AddDialog({ children, open, setOpen }: { children: React.ReactNode, open: boolean, setOpen: Dispatch<SetStateAction<boolean>> }) {
    return (
        <div>
            <Button onClick={() => setOpen(true)}>Open Create Dialog</Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Admin</DialogTitle>
                        {/* Add a DialogDescription here */}
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

export default function Create() {
    const [open, setOpen] = useState<boolean>(false)
    const [tab, setTab] = useState<'account' | 'password'>('account')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const { toast } = useToast()

    const form = useForm<z.infer<typeof createUserSchema>>({
        resolver: zodResolver(createUserSchema),
    });

    const onSubmit = async (data: z.infer<typeof createUserSchema>) => {
        setIsLoading(true)
        const result = await createAdmin(data)

        if (result?.error) {
            toast({
                title: 'Error',
                description: result?.error,
                variant: 'destructive'
            })
            setIsLoading(false)
            return;
        }

        toast({
            title: 'Success',
            description: result?.message,
        })

        form.reset()
        setTab('account')
        setIsLoading(false)
        setOpen(false)
    };

    const onError = () => {
        toast({
            title: "Validation Error",
            description: `Please check all tabs for potential errors`,
            variant: "destructive",
        })
    }

    return (
        <AddDialog open={open} setOpen={setOpen}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, onError)}>
                    <Tabs value={tab} onValueChange={(value) => setTab(value as 'account' | 'password')}>
                        <TabsList>
                            <TabsTrigger value="account">Account</TabsTrigger>
                            <TabsTrigger value="password">Password</TabsTrigger>
                        </TabsList>
                        <TabsContent value="account">
                            <div className="flex flex-row gap-2">
                                <FormFieldWrapper form={form} name="name" label="Name" />
                                <FormFieldWrapper form={form} name="username" label="Username" />
                            </div>
                            <div className="flex flex-row gap-2">
                                <FormFieldWrapper form={form} name="email" label="Email" />
                                <FormFieldWrapper form={form} name="phoneNumber" label="Phone Number" />
                            </div>
                            <FormFieldWrapper form={form} name="nationalId" label="National Id" />
                        </TabsContent>
                        <TabsContent value="password">
                            <div className="flex flex-row gap-2">
                                <FormFieldWrapper form={form} name="password" label="Password" />
                                <FormFieldWrapper form={form} name="confirmPassword" label="Confirm Password" />
                            </div>
                        </TabsContent>
                    </Tabs>
                    <div className="mt-4">
                        <LoadingBtn isLoading={isLoading} label="Submit" />
                    </div>
                </form>
            </Form>
        </AddDialog>
    );
}