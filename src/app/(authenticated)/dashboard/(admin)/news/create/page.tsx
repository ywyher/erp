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
import { newsSchema } from "@/app/(authenticated)/dashboard/(admin)/news/types";
import { createNews } from "@/app/(authenticated)/dashboard/(admin)/news/actions";
import { useFileUpload } from "@/hooks/use-file-upload";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { deleteFile } from "@/lib/s3";
import { socialStatuses } from "@/lib/constants";
import CardLayout from "@/components/card-layout";

export default function CreateNews() {
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const { handleUpload } = useFileUpload();
  
  const form = useForm<z.infer<typeof newsSchema>>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      status: 'draft'
    }
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      form.setValue("thumbnail", selectedFile);
    }
  };
  
  const handleRemoveImage = () => {
    setPreviewUrl(undefined);
    form.reset({
      thumbnail: undefined
    });
    form.clearErrors("thumbnail");
  };
  
  const onSubmit = async (data: z.infer<typeof newsSchema>) => {
    console.log(data)
    return;
    setIsLoading(true);

    const { name, error } = await handleUpload(data.thumbnail);
    
    if (!name) {
      setIsLoading(false);
      throw new Error(error);
    }

    const { title, content, status } = data;

    const result = await createNews({ 
      title,
      content,
      status,
      thumbnail: name
    });
    
    if (result?.error) {
      toast.error(result?.error);

      await deleteFile(name);

      setIsLoading(false);
      return;
    }

    toast.message(result?.message);
    await revalidate("/dashboard/news");
    form.reset({
      title: "",
      content: [],
      thumbnail: undefined,
    });
    setIsLoading(false);
    setOpen(false);
  };
  
  return (
    <CardLayout title="Create news">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-3 max-w-[95%]">
            {previewUrl ? (
              <div className="relative rounded-md overflow-hidden border border-gray-200">
                <div className="relative w-full h-96">
                  <Image 
                    src={previewUrl}
                    alt="News thumbnail preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 rounded-full w-8 h-8"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <FormFieldWrapper 
                form={form}
                name="thumbnail"
                label="Thumbnail"
                type="file"
                accept="image/*"
                onFileChange={handleFileChange}
              />
            )}
            <FormFieldWrapper form={form} name="title" label="Title" />
            <FormFieldWrapper form={form} name="status" label="Status" type="select" options={socialStatuses} />
            <FormFieldWrapper form={form} name="tags" label="Tags" type="tags" />
            <FormFieldWrapper form={form} name="content" label="Editor" type="editor" />
          </div>
          <LoadingBtn isLoading={isLoading}>Create</LoadingBtn>
        </form>
      </Form>
    </CardLayout>
  );
}