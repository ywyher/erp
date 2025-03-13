"use client";

import { FormFieldWrapper } from "@/components/form-field-wrapper";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { departments } from "@/app/(authenticated)/dashboard/constants";
import LoadingBtn from "@/components/loading-btn";
import ScheduleSelector from "@/app/(authenticated)/dashboard/_components/schedule-selector";
import { Schedules } from "@/app/(authenticated)/dashboard/types";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createReceptionistSchema } from "@/app/(authenticated)/dashboard/(admin)/receptionists/types";
import { toast } from "sonner";
import { createReceptionist } from "@/app/(authenticated)/dashboard/(admin)/receptionists/actions";
import DialogWrapper from "@/app/(authenticated)/dashboard/_components/dialog-wrapper";
import { genders } from "@/lib/constants";

export default function CreateReceptionist() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [schedules, setSchedules] = useState<Schedules>({}); // Updated name
  const [selectedDays, setSelectedDays] = useState<string[]>([]); // Updated name for clarity
  const [tab, setTab] = useState<"account" | "schedules" | "password">(
    "account",
  );
  const [open, setOpen] = useState<boolean>(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof createReceptionistSchema>>({
    resolver: zodResolver(createReceptionistSchema),
  });

  const onSubmit = async (data: z.infer<typeof createReceptionistSchema>) => {
    if (!selectedDays.length) {
      toast.error("Work days are required.");
      return;
    }

    if (selectedDays.some((day) => !schedules[day]?.length)) {
      toast.error(
        `The following days are missing schedules: ${selectedDays.filter((day) => !schedules[day]?.length).join(", ")}`,
      );
      return;
    }

    try {
      setIsLoading(true);
      const result = await createReceptionist({
        userData: data,
        schedulesData: schedules,
      });

      if (result?.error) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }

      toast(result.message);
      setIsLoading(false);
      setOpen(false);
      form.reset({
        name: "",
        email: "",
        username: "",
        phoneNumber: "",
        nationalId: "",
        department: "",
        dateOfBirth: "",
        gender: "",
        password: "",
        confirmPassword: "",
      });
      router.push("/dashboard/receptionists");
    } finally {
      setIsLoading(false);
    }
  };

  const onError = () => {
    toast.error(`Please check all tabs for potential errors`);
  };

  return (
    <DialogWrapper
      open={open}
      setOpen={setOpen}
      label="receptionist"
      operation="create"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onError)}>
          <Tabs defaultValue="account">
            <TabsList>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="schedules">Schedules</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className="flex flex-col gap-2">
              <div className="flex flex-row gap-2">
                <FormFieldWrapper form={form} name="name" label="Name" />
                <FormFieldWrapper
                  form={form}
                  name="username"
                  label="Username"
                />
              </div>
              <FormFieldWrapper form={form} name="email" label="Email" />
              <div className="flex flex-row gap-2">
                <FormFieldWrapper
                  form={form}
                  name="dateOfBirth"
                  label="Date of birth"
                  type="date"
                />
                <FormFieldWrapper 
                  form={form}
                  name="gender"
                  label="gender"
                  type="select"
                  options={genders}
                />
              </div>
              <div className="flex flex-row gap-2">
                <FormFieldWrapper
                  form={form}
                  type="number"
                  name="phoneNumber"
                  label="Phone Number"
                />
                <FormFieldWrapper
                  form={form}
                  type="number"
                  name="nationalId"
                  label="National Id"
                />
              </div>
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
              <FormFieldWrapper
                form={form}
                type="password"
                name="password"
                label="Password"
              />
              <FormFieldWrapper
                form={form}
                type="password"
                name="confirmPassword"
                label="Confirm Password"
              />
            </TabsContent>
          </Tabs>
          <div className="mt-4">
            <LoadingBtn isLoading={isLoading}>Create</LoadingBtn>
          </div>
        </form>
      </Form>
    </DialogWrapper>
  );
}
