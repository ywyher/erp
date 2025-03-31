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
import { getFaqData, updateFaq } from "@/app/(authenticated)/dashboard/(admin)/faqs/actions";
import { Faq } from "@/lib/db/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { socialStatuses } from "@/lib/constants";
import { getChangedFields, getFileUrl } from "@/lib/funcs";
import { faqSchema } from "@/app/(authenticated)/dashboard/(admin)/faqs/types";

export default function UpdateFaq({ faqId }: { faqId: Faq['id'] }) {
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof faqSchema>>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: "",
      answer: "",
      status: "draft",
    }
  });

  const { data: faqData, isLoading: isFaqDataLoading } = useQuery({
    queryKey: ['faq', 'data', 'update', faqId],
    queryFn: async () => {
      return await getFaqData(faqId);
    }
  });

  useEffect(() => {
    if (faqData) {
      console.log(`faqData`)
      console.log(faqData)
      form.reset({
        question: faqData.question,
        answer: faqData.answer,
        status: faqData.status,
      });
    }
  }, [faqData, form]);
  
  const onSubmit = async (data: z.infer<typeof faqSchema>) => {
    if (!faqData) return;
    
    setIsLoading(true);

    const sessionData = {
      question: faqData.question,
      answer: faqData.answer,
      status: faqData.status,
    }

    const localData = {
      question: data.question,
      answer: data.answer,
      status: data.status,
    }

    const changedFields = getChangedFields(sessionData, localData);

    if (Object.keys(changedFields).length === 0) {
      toast.error("No Changes thus no fields were updated.");
      setIsLoading(false);
      return;
    }

    const result = await updateFaq({ 
      data,
      faqId
    });

    if (result?.error) {
      toast.error(result?.error);
      setIsLoading(false);
      return;
    }

    toast.message(result?.message);

    await revalidate("/dashboard/faqs");
    queryClient.invalidateQueries({ queryKey: ['faq', 'data', 'update', faqId] })
    setIsLoading(false);
    setOpen(false);
  };

  return (
    <DialogWrapper
      open={open}
      setOpen={setOpen}
      label="faq"
      operation="update"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-3">
            {isFaqDataLoading ? (
              <div>Loading...</div>
            ) : (
              <div className="flex flex-col gap-3">
                <FormFieldWrapper form={form} name="question" label="Question" />
                <FormFieldWrapper form={form} name="answer" label="Answer" />
                <FormFieldWrapper form={form} name="status" label="Status" type="select" options={socialStatuses} />
              </div>
            )}
          </div>
          <LoadingBtn isLoading={isLoading}>Update</LoadingBtn>
        </form>
      </Form>
    </DialogWrapper>
  );
}