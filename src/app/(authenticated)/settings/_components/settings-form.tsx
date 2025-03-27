"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import LoadingBtn from "@/components/loading-btn";
import { getChangedFields, isFakeEmail, normalizeData } from "@/lib/funcs";
import { z } from "zod";
import { updateUserSchema } from "@/app/types";
import { FormFieldWrapper } from "@/components/form-field-wrapper";
import { getUserRegistrationType } from "@/lib/db/queries";
import { toast } from "sonner";
import { updateUser } from "@/lib/db/mutations";
import { genders } from "@/lib/constants";

export default function SettingsForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [registeredWith, setRegisteredWith] = useState<
    "both" | "email" | "phoneNumber" | "none" | null
  >(null);

  const queryClient = useQueryClient();

  const { data: user, isLoading: isPending } = useQuery({
    queryKey: ["session", "settingsForm"],
    queryFn: async () => {
      const { data } = await getSession();
      return data?.user || null;
    },
  });

  const form = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema),
  });

  useEffect(() => {
    async () => {
      if (user && !isPending) {
        const context = await getUserRegistrationType(user.id);
        setRegisteredWith(context);
      }
    };
    if (user && !isPending) {
      form.reset({
        name: user.name || "",
        username: user.username || "",
        email: isFakeEmail(user.email) ? "" : user.email || "",
        phoneNumber: user.phoneNumber || "",
        nationalId: user.nationalId || "",
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : "",
      });
    }
  }, [user]);

  const onCheckChangedFields = async (
    data: z.infer<typeof updateUserSchema>,
  ) => {
    if (!user || isPending) return;

    const sessionData = {
      name: user.name,
      email: isFakeEmail(user.email) ? "" : user.email,
      username: user.username || "",
      phoneNumber: user.phoneNumber || "",
      nationalId: user.nationalId || "",
      gender: user.gender || "",
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : "",
    };

    const changedFields = getChangedFields(sessionData, data);

    if (Object.keys(changedFields).length === 0) {
      toast.error("No Changes thus no fields were updated.");
      return;
    }

    await onSubmit(changedFields as z.infer<typeof updateUserSchema>);
  };

  const onSubmit = async (data: z.infer<typeof updateUserSchema>) => {
    if (!user || !user.id) return;
    // setIsLoading(true);
    
    const normalizedData = normalizeData(data, "object");
    
    const result = await updateUser({
      data: normalizedData,
      userId: user.id,
      role: "user",
    });

    if (result && result.error) {
      toast.error(result.error);
      setIsLoading(false);
      return;
    }

    toast("Settings were successfully updated.");
    queryClient.invalidateQueries({ queryKey: ["session"] });
    setIsLoading(false);
  };

  if (!user || isPending) return;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onCheckChangedFields)}
        className="flex flex-col gap-3"
      >
        <div className="flex flex-row gap-2">
          <FormFieldWrapper form={form} name="name" label="Display Name" />
          <FormFieldWrapper form={form} name="username" label="Username" />
        </div>
        <FormFieldWrapper
          form={form}
          name="email"
          label={`
            Email
            ${user.email && user.emailVerified ? "(verified)" : "(Unverified)"}
          `}
          optional={
            registeredWith != "email" && isFakeEmail(user.email) ? true : false
          }
          disabled={user.emailVerified}
        />
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
            name="phoneNumber"
            label={`
                PhoneNumber
                ${user.phoneNumber && user.phoneNumberVerified ? `(verified)` : "(Unverified)"}
            `}
            optional={
              registeredWith != "phoneNumber" && isFakeEmail(user.phoneNumber)
                ? true
                : false
            }
            disabled={user.phoneNumberVerified ? true : false}
          />
          <FormFieldWrapper form={form} name="nationalId" label="National Id" />
        </div>
        <LoadingBtn className="mt-2" isLoading={isLoading}>
          Update
        </LoadingBtn>
      </form>
    </Form>
  );
}