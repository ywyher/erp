"use client";

import { FormFieldWrapper } from "@/components/form-field-wrapper";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { departments } from "@/app/(authenticated)/dashboard/constants";
import LoadingBtn from "@/components/loading-btn";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UpdatePassword from "@/components/update-password";
import { useQuery } from "@tanstack/react-query";
import { getUserById } from "@/lib/db/queries";
import { User } from "@/lib/auth-client";
import { getChangedFields, isFakeEmail } from "@/lib/funcs";
import UpdateSchedule from "@/app/(authenticated)/dashboard/_components/update-schedule";
import { z } from "zod";
import { updateReceptionist } from "@/app/(authenticated)/dashboard/(admin)/receptionists/actions";
import { Receptionist } from "@/lib/db/schema";
import { toast } from "sonner";
import DialogWrapper from "@/app/(authenticated)/dashboard/_components/dialog-wrapper";
import { updateReceptionistSchema } from "@/app/(authenticated)/dashboard/(admin)/receptionists/types";
import { genders } from "@/lib/constants";

export default function UpdateReceptionist({
  setPopOpen,
  userId,
}: {
  setPopOpen: Dispatch<SetStateAction<boolean>>;
  userId: string;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const { data: user } = useQuery({
    queryKey: ["userById", userId],
    queryFn: async () => {
      const data = await getUserById(userId, "receptionist");
      return data as { user: User; receptionist: Receptionist };
    },
  });

  const form = useForm<z.infer<typeof updateReceptionistSchema>>({
    resolver: zodResolver(updateReceptionistSchema),
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.user.name || "",
        username: user.user.username || "",
        email: isFakeEmail(user.user.email) ? "" : user.user.email || "",
        phoneNumber: user.user.phoneNumber || "",
        nationalId: user.user.nationalId || "",
        department: user.receptionist.department || "",
        gender: user.user.gender || "",
        dateOfBirth: new Date(user.user.dateOfBirth || "") || "",
      });
    }
  }, [user, form]);

  const onCheckChangedFields = async (
    data: z.infer<typeof updateReceptionistSchema>,
  ) => {
    if (!user) return;

    const sessionData = {
      name: user.user.name,
      email: isFakeEmail(user.user.email) ? "" : user.user.email,
      username: user.user.username || "",
      phoneNumber: user.user.phoneNumber || "",
      nationalId: user.user.nationalId || "",
      department: user.receptionist.department,
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

    await onSubmit(changedFields as z.infer<typeof updateReceptionistSchema>);
  };

  const onSubmit = async (data: z.infer<typeof updateReceptionistSchema>) => {
    if (!user) return;

    try {
      setIsLoading(true);
      const result = await updateReceptionist({ data, userId: user.user.id });

      if (result.error) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }

      toast(result.message);
      setIsLoading(false);
      setOpen(false);
      setPopOpen(false)
    } finally {
      setIsLoading(false);
      setPopOpen(false)
    }
  };

  return (
    <DialogWrapper
      open={open}
      setOpen={setOpen}
      label="receptionist"
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
                <div className="flex flex-row gap-2">
                  <FormFieldWrapper
                    form={form}
                    name="department"
                    label="Department"
                    type="select"
                    options={departments}
                  />
                </div>
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
