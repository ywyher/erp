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
import { departments } from "@/app/(authenticated)/dashboard/constants";
import LoadingBtn from "@/components/loading-btn";
import ScheduleSelector from "@/app/(authenticated)/dashboard/_components/schedule-selector";
import { Schedules } from "@/app/(authenticated)/dashboard/types";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createReceptionistSchema } from "@/app/(authenticated)/dashboard/(admins)/receptionists/types";
import { createReceptionist } from "@/app/(authenticated)/dashboard/(admins)/receptionists/actions";

function CreateDialog({ children, open, setOpen }: { children: React.ReactNode, open: boolean, setOpen: Dispatch<SetStateAction<boolean>> }) {
    return (
        <div>
            <Button onClick={() => setOpen(true)}>Create Receptionist</Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Receptionist</DialogTitle>
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

export default function CreateReceptionist() {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [schedules, setSchedules] = useState<Schedules>({}); // Updated name
    const [selectedDays, setSelectedDays] = useState<string[]>([]); // Updated name for clarity
    const [tab, setTab] = useState<'account' | 'schedules' | 'password'>('account')
    const [open, setOpen] = useState<boolean>(false)
    const router = useRouter();

    const { toast } = useToast()

    const form = useForm<z.infer<typeof createReceptionistSchema>>({
        resolver: zodResolver(createReceptionistSchema),
    });

    const onSubmit = async (data: z.infer<typeof createReceptionistSchema>) => {
        if (selectedDays.length == 0) {
            toast({
                title: "Validation Error",
                description: `Work days is required`,
                variant: "destructive",
            })
            return;
        }

        const missingSchedules = selectedDays.filter((day) => !schedules[day] || schedules[day].length === 0);

        if (missingSchedules.length > 0) {
            toast({
                title: "Validation Error",
                description: `The following days are missing schedules: ${missingSchedules.join(", ")}`,
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true)
        const result = await createReceptionist({ userData: data, schedulesData: schedules })

        if (result?.error) {
            toast({
                title: "Error",
                description: result.error,
                variant: "destructive",
            })
            setIsLoading(false)
            return;
        }

        toast({
            title: 'Success',
            description: result?.message
        })
        setIsLoading(false)
        form.reset()
        setOpen(false)
        router.push('/dashboard/receptionists')
    };

    const onError = () => {
        toast({
            title: "Validation Error",
            description: `Please check all tabs for potential errors`,
            variant: "destructive",
        })
    }

    return (
        <CreateDialog open={open} setOpen={setOpen}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, onError)}>
                    <Tabs defaultValue="account">
                        <TabsList>
                            <TabsTrigger value="account">Account</TabsTrigger>
                            <TabsTrigger value="schedules">Schedules</TabsTrigger>
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
                            <div className="flex flex-row gap-2">
                                <FormFieldWrapper
                                    form={form}
                                    name="department"
                                    label="Department"
                                    type="select"
                                    options={departments}
                                />
                            </div>
                        </TabsContent>
                        <TabsContent value="schedules">
                            <ScheduleSelector
                                schedules={schedules}
                                setSchedules={setSchedules}
                                selectedDays={selectedDays}
                                setSelectedDays={setSelectedDays}
                            />
                        </TabsContent>
                        <TabsContent value="password">
                            <FormFieldWrapper form={form} name="password" label="Password" />
                            <FormFieldWrapper form={form} name="confirmPassword" label="Confirm Password" />
                        </TabsContent>
                    </Tabs>
                    <div className="mt-4">
                        <LoadingBtn isLoading={isLoading} label="Submit" />
                    </div>
                </form>
            </Form>
        </CreateDialog>
    );
}