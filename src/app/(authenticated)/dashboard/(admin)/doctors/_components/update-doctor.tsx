"use client";

import { FormFieldWrapper } from "@/components/form-field-wrapper";
import {
  Form,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { updateDoctorSchema } from "@/app/(authenticated)/dashboard/(admin)/doctors/types";
import {
  specialties,
} from "@/app/(authenticated)/dashboard/constants";
import LoadingBtn from "@/components/loading-btn";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UpdatePassword from "@/components/update-password";
import { useQuery } from "@tanstack/react-query";
import { getUserById } from "@/lib/db/queries";
import { Doctor } from "@/app/types";
import { User } from "@/lib/auth-client";
import { getChangedFields, isFakeEmail, normalizeData } from "@/lib/funcs";
import { updateDoctor } from "@/app/(authenticated)/dashboard/(admin)/doctors/actions";
import UpdateSchedule from "@/app/(authenticated)/dashboard/_components/update-schedule";
import { z } from "zod";
import { toast } from "sonner";
import DialogWrapper from "@/app/(authenticated)/dashboard/_components/dialog-wrapper";
import { genders } from "@/lib/constants";

export default function UpdateDoctor({
  setPopOpen,
  userId,
}: {
  setPopOpen: Dispatch<SetStateAction<boolean>>;
  userId: string;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const router = useRouter();

  const { data: user } = useQuery({
    queryKey: ["userById", userId],
    queryFn: async () => {
      const data = await getUserById(userId, "doctor");
      return data as { user: User; doctor: Doctor };
    },
  });

  const form = useForm<z.infer<typeof updateDoctorSchema>>({
    resolver: zodResolver(updateDoctorSchema),
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.user.name || "",
        username: user.user.username || "",
        email: isFakeEmail(user.user.email) ? "" : user.user.email || "",
        phoneNumber: user.user.phoneNumber || "",
        nationalId: user.user.nationalId || "",
        specialty: user.doctor.specialty || "",
        gender: user.user.gender || "",
        dateOfBirth: new Date(user.user.dateOfBirth || "") || "",
      });
    }
  }, [user, form]);

  const onCheckChangedFields = async (
    data: z.infer<typeof updateDoctorSchema>,
  ) => {
    if (!user) return;

    const sessionData = {
      name: user.user.name,
      email: isFakeEmail(user.user.email) ? "" : user.user.email,
      username: user.user.username || "",
      phoneNumber: user.user.phoneNumber || "",
      nationalId: user.user.nationalId || "",
      specialty: user.doctor.specialty || "",
      gender: user.user.gender || "",
      dateOfBirth: new Date(user.user.dateOfBirth || "") || "",
    };

    const changedFields = getChangedFields(sessionData, data);

    if (Object.keys(changedFields).length === 0) {
      toast.error(
        "No fields chagned thus no fields or schedules were updated.",
      );
      return;
    }

    await onSubmit(changedFields as z.infer<typeof updateDoctorSchema>);
  };

  const onSubmit = async (data: z.infer<typeof updateDoctorSchema>) => {
    if (!user) return;

    try {
      setIsLoading(true);

      const result = await updateDoctor({
        data: normalizeData(data, "object"),
        userId: user.user.id,
      });

      if (result.error) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }

      toast(result?.message);
      setOpen(false);
      setPopOpen(false);
      router.push("/dashboard/doctors");
    } finally {
      setIsLoading(false);
      setPopOpen(false);
    }
  };

  return (
    <DialogWrapper
      open={open}
      setOpen={setOpen}
      label="doctor"
      operation="update"
    >
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onCheckChangedFields)}
              className="flex flex-col gap-3"
            >
              <div className="flex flex-col gap-2">
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
                <FormFieldWrapper
                  form={form}
                  name="specialty"
                  label="Specialty"
                  type="select"
                  options={specialties}
                />
              </div>
              <LoadingBtn isLoading={isLoading}>Update</LoadingBtn>
            </form>
          </Form>
        </TabsContent>
        <TabsContent value="schedules">
          <UpdateSchedule userId={userId} setOpen={setOpen} />
        </TabsContent>
        <TabsContent value="password">
          <UpdatePassword
            userId={userId}
            setOpen={setOpen}
            revalidatePath="/dashboard"
          />
        </TabsContent>
      </Tabs>
    </DialogWrapper>
  );
}
