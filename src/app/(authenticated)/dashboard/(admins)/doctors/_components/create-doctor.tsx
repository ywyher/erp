'use client';

import { FormFieldWrapper } from "@/components/formFieldWrapper";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { createDoctorSchema } from "@/app/(authenticated)/dashboard/(admins)/doctors/types";
import { days as daysList, specialties } from "@/app/(authenticated)/dashboard/constants";
import { createDoctor } from "@/app/(authenticated)/dashboard/(admins)/doctors/actions";
import LoadingBtn from "@/components/loading-btn";
import MultipleSelector from "@/components/ui/multi-select";
import { TimePicker } from "@/components/ui/datetime-picker";
import ScheduleSelector from "@/app/(authenticated)/dashboard/_components/schedule-selector";
import { Schedules } from "@/app/(authenticated)/dashboard/types";
import { useRouter } from "next/navigation";
import { normalizeData } from "@/lib/funcs";
import { z } from "zod";
import { getErrorMessage } from "@/lib/handle-error";
import { toast } from "sonner";

function CreateDialog({ children, open, setOpen }: { children: React.ReactNode, open: boolean, setOpen: Dispatch<SetStateAction<boolean>> }) {
    return (
        <div>
            <Button onClick={() => setOpen(true)}>Create Doctor</Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Doctor</DialogTitle>
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

export default function CreateDoctor() {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [schedules, setSchedules] = useState<Schedules>({}); // Updated name
    const [selectedDays, setSelectedDays] = useState<string[]>([]); // Updated name for clarity
    const [tab, setTab] = useState<'account' | 'schedules' | 'password'>('account')
    const [open, setOpen] = useState<boolean>(false)
    const router = useRouter();

    const form = useForm<z.infer<typeof createDoctorSchema>>({
        resolver: zodResolver(createDoctorSchema),
    });

    const onSubmit = async (data: z.infer<typeof createDoctorSchema>) => {
        if (selectedDays.length == 0) {
            getErrorMessage(`Work days is required`)
            return;
        }

        const missingSchedules = selectedDays.filter((day) => !schedules[day] || schedules[day].length === 0);

        if (missingSchedules.length > 0) {
            getErrorMessage(`The following days are missing schedules: ${missingSchedules.join(", ")}`)
            return;
        }

        const normalizedData = {
            ...data,
            name: normalizeData(data.name),
            username: normalizeData(data.username),
            email: normalizeData(data.email),
            phoneNumber: normalizeData(data.phoneNumber),
            nationalId: normalizeData(data.nationalId),
        };

        setIsLoading(true)
        const result = await createDoctor({ userData: normalizedData, schedulesData: schedules })

        if (result?.error) {
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

    const onError = () => {
        getErrorMessage('Please check all tabs for potential errors')
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
                                <FormFieldWrapper form={form}
                                    name="specialty"
                                    label="Specialty"
                                    type="select"
                                    options={specialties}
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