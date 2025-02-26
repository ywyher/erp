'use client';

import { FormFieldWrapper } from "@/components/form-field-wrapper";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createDoctorSchema } from "@/app/(authenticated)/dashboard/(admins)/doctors/types";
import { specialties } from "@/app/(authenticated)/dashboard/constants";
import { createDoctor } from "@/app/(authenticated)/dashboard/(admins)/doctors/actions";
import LoadingBtn from "@/components/loading-btn";
import ScheduleSelector from "@/app/(authenticated)/dashboard/_components/schedule-selector";
import { Schedules } from "@/app/(authenticated)/dashboard/types";
import { useRouter } from "next/navigation";
import { normalizeData } from "@/lib/funcs";
import { z } from "zod";
import { toast } from "sonner";
import DialogWrapper from "@/app/(authenticated)/dashboard/_components/dialog-wrapper";

export default function CreateDoctor() {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [schedules, setSchedules] = useState<Schedules>({ monday: [ { startTime: "02:00", endTime: "03:00" } ] }); // Updated name
    const [selectedDays, setSelectedDays] = useState<string[]>(['monday']); // Updated name for clarity
    const [open, setOpen] = useState<boolean>(false)
    const router = useRouter();

    const form = useForm<z.infer<typeof createDoctorSchema>>({
        resolver: zodResolver(createDoctorSchema),
        defaultValues: {
            name: 'doc',
            username: 'doc',
            email: 'doc@gmail.com',
            nationalId: '30801101100191',
            specialty: 'cardiology',
            password: 'doc',
            confirmPassword: 'doc'
        }
    });

    const onSubmit = async (data: z.infer<typeof createDoctorSchema>) => {
        if (!selectedDays.length) {
            toast.error("Work days are required.");
            return;
        }
        
        if (selectedDays.some(day => !schedules[day]?.length)) {
            toast.error(`The following days are missing schedules: ${selectedDays.filter(day => !schedules[day]?.length).join(", ")}`);
            return;
        }
        
        try {
            setIsLoading(true);

            const result = await createDoctor({
                userData: normalizeData(data, 'object'),
                schedulesData: schedules
            });

            if (result?.error) {
                toast.error(result.error);
                return;
            }

            toast.success(result?.message);
            setSchedules({});
            setSelectedDays([]);
            setOpen(false);
            form.reset({
                name: "",
                email: "",
                username: "",
                phoneNumber: "",
                nationalId: "",
                specialty: undefined,
                password: "",
                confirmPassword: "",
            });
            router.push('/dashboard/doctors');
        } finally {
            setIsLoading(false);
        }
    };

    const onError = () => {
        toast.error('Please check all tabs for potential errors')
    }

    return (
        <DialogWrapper open={open} setOpen={setOpen} label="doctor" operation="create">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, onError)} className="flex flex-col gap-4">
                    <Tabs defaultValue="account">
                        <TabsList>
                            <TabsTrigger value="account">Account</TabsTrigger>
                            <TabsTrigger value="schedules">Schedules</TabsTrigger>
                            <TabsTrigger value="password">Password</TabsTrigger>
                        </TabsList>
                        <TabsContent value="account" className="flex flex-col gap-2">
                            <div className="flex flex-row gap-2">
                                <FormFieldWrapper form={form} name="name" label="Name" />
                                <FormFieldWrapper form={form} name="username" label="Username" />
                            </div>
                            <div className="flex flex-row gap-2">
                                <FormFieldWrapper form={form} name="email" label="Email" />
                                <FormFieldWrapper form={form} type="number" name="phoneNumber" label="Phone Number" />
                            </div>
                            <FormFieldWrapper form={form} type="number" name="nationalId" label="National Id" />
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
                            <FormFieldWrapper form={form} type="password" name="password" label="Password" />
                            <FormFieldWrapper form={form} type="password" name="confirmPassword" label="Confirm Password" />
                        </TabsContent>
                    </Tabs>
                    <LoadingBtn isLoading={isLoading}>
                        Create
                    </LoadingBtn>
                </form>
            </Form>
        </DialogWrapper>
    );
}