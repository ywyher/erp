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
import { faqSchema } from "@/app/(authenticated)/dashboard/(admin)/faqs/types";
import { createFaq } from "@/app/(authenticated)/dashboard/(admin)/faqs/actions";
import { socialStatuses } from "@/lib/constants";

export default function CreateFaq() {
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const form = useForm<z.infer<typeof faqSchema>>({
    resolver: zodResolver(faqSchema),
  });
  
  const onSubmit = async (data: z.infer<typeof faqSchema>) => {
    setIsLoading(true);

    const result = await createFaq({ data });
    
    toast.message(result?.message);
    await revalidate("/dashboard/faqs");
    form.reset({
      question: "",
      answer: "",
      status: "draft",
    });
    setIsLoading(false);
    setOpen(false);
  };
  
  return (
    <DialogWrapper
      open={open}
      setOpen={setOpen}
      label="faq"
      operation="create"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-3">
            <FormFieldWrapper form={form} name="question" label="Question" />
            <FormFieldWrapper form={form} name="answer" label="Answer" type="textarea" />
            <FormFieldWrapper form={form} name="status" label="Status" type="select" options={socialStatuses} />
          </div>
          <LoadingBtn isLoading={isLoading}>Create</LoadingBtn>
        </form>
      </Form>
    </DialogWrapper>
  );
}