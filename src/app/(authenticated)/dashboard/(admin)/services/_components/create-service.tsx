"use client";

import { FormFieldWrapper } from "@/components/form-field-wrapper";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import LoadingBtn from "@/components/loading-btn";
import { z } from "zod";
import { toast } from "sonner";
import { revalidate } from "@/app/actions";
import DialogWrapper from "@/app/(authenticated)/dashboard/_components/dialog-wrapper";
import { serviceSchema } from "@/app/(authenticated)/dashboard/(admin)/services/types";
import { createService } from "@/app/(authenticated)/dashboard/(admin)/services/actions";
import { socialStatuses } from "@/lib/constants";
import { IconName } from "@/components/icons-selector";

export default function CreateService() {
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedIcon, setSelectedIcon] = useState<IconName | null>(null)
  
  const form = useForm<z.infer<typeof serviceSchema>>({
    resolver: zodResolver(serviceSchema),
  });
  
  const onSubmit = async (data: z.infer<typeof serviceSchema>) => {
    setIsLoading(true);

    const result = await createService({ data });
    
    toast.message(result?.message);
    await revalidate("/dashboard/services");
    form.reset({
      title: "",
      status: "draft",
      icon: ""
    });
    setIsLoading(false);
    setOpen(false);
  };
  
  return (
    <DialogWrapper
      open={open}
      setOpen={setOpen}
      label="service"
      operation="create"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-3">
            <FormFieldWrapper form={form} name="icon" label="Icon" type="icon" />
            <FormFieldWrapper form={form} name="title" label="Title" />
            <FormFieldWrapper form={form} name="status" label="Status" type="select" options={socialStatuses} />
          </div>
          <LoadingBtn isLoading={isLoading}>Create</LoadingBtn>
        </form>
      </Form>
    </DialogWrapper>
  );
}