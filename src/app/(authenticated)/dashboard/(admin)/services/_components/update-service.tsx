"use client";

import { FormFieldWrapper } from "@/components/form-field-wrapper";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import LoadingBtn from "@/components/loading-btn";
import { z } from "zod";
import { toast } from "sonner";
import { revalidate } from "@/app/actions";
import DialogWrapper from "@/app/(authenticated)/dashboard/_components/dialog-wrapper";
import { getServiceData, updateService } from "@/app/(authenticated)/dashboard/(admin)/services/actions";
import { Service } from "@/lib/db/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { socialStatuses } from "@/lib/constants";
import { getChangedFields } from "@/lib/funcs";
import { serviceSchema } from "@/app/(authenticated)/dashboard/(admin)/services/types";

export default function UpdateService({ serviceId }: { serviceId: Service['id'] }) {
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof serviceSchema>>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: "",
      icon: "",
      status: "draft",
    }
  });

  const { data: serviceData, isLoading: isServiceDataLoading } = useQuery({
    queryKey: ['service', 'data', 'update', serviceId],
    queryFn: async () => {
      return await getServiceData(serviceId);
    }
  });

  useEffect(() => {
    if (serviceData) {
      form.reset({
        title: serviceData.title,
        icon: serviceData.icon,
        status: serviceData.status,
      });
    }
  }, [serviceData, form]);
  
  const onSubmit = async (data: z.infer<typeof serviceSchema>) => {
    if (!serviceData) return;
    
    setIsLoading(true);

    const sessionData = {
      title: serviceData.title,
      icon: serviceData.icon,
      status: serviceData.status,
    }

    const localData = {
      title: data.title,
      icon: data.icon,
      status: data.status,
    }

    const changedFields = getChangedFields(sessionData, localData);

    if (Object.keys(changedFields).length === 0) {
      toast.error("No Changes thus no fields were updated.");
      setIsLoading(false);
      return;
    }

    const result = await updateService({ 
      data,
      serviceId
    });

    if (result?.error) {
      toast.error(result?.error);
      setIsLoading(false);
      return;
    }

    toast.message(result?.message);

    await revalidate("/dashboard/services");
    queryClient.invalidateQueries({ queryKey: ['service', 'data', 'update', serviceId] })
    setIsLoading(false);
    setOpen(false);
  };

  return (
    <DialogWrapper
      open={open}
      setOpen={setOpen}
      label="service"
      operation="update"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-3">
            {isServiceDataLoading ? (
              <div>Loading...</div>
            ) : (
              <>
                <FormFieldWrapper form={form} name="icon" label="Icon" type="icon" />
                <FormFieldWrapper form={form} name="title" label="Title" />
                <FormFieldWrapper form={form} name="status" label="Status" type="select" options={socialStatuses} />
              </>
            )}
          </div>
          <LoadingBtn isLoading={isLoading}>Update</LoadingBtn>
        </form>
      </Form>
    </DialogWrapper>
  );
}