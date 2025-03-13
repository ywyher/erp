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
import { servicSchema } from "@/app/(authenticated)/dashboard/(admin)/services/types";
import { createService } from "@/app/(authenticated)/dashboard/(admin)/services/actions";
import { useFileUpload } from "@/hooks/use-upload-file";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { deleteFile } from "@/lib/s3";
import { socialStatuses } from "@/lib/constants";

export default function CreateService() {
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const { handleUpload } = useFileUpload();
  
  const form = useForm<z.infer<typeof servicSchema>>({
    resolver: zodResolver(servicSchema),
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
  
  const onSubmit = async (data: z.infer<typeof servicSchema>) => {
    setIsLoading(true);

    const fileName = await handleUpload(data.thumbnail);
    
    if (!fileName) {
      setIsLoading(false);
      throw new Error("Failed to upload file");
    }

    const { title, content, status } = data;

    const result = await createService({ 
      title,
      content,
      status,
      fileName
    });
    
    if (result?.error) {
      toast.error(result?.error);

      await deleteFile(fileName);

      setIsLoading(false);
      return;
    }

    toast.message(result?.message);
    await revalidate("/dashboard/services");
    form.reset({
      title: "",
      content: "",
      thumbnail: undefined,
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
            {previewUrl ? (
              <div className="relative rounded-md overflow-hidden border border-gray-200">
                <div className="relative w-full h-48">
                  <Image 
                    src={previewUrl}
                    alt="Service thumbnail preview"
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
                onFileChange={handleFileChange}
              />
            )}
            <FormFieldWrapper form={form} name="title" label="Title" />
            <FormFieldWrapper form={form} name="status" label="Status" type="select" options={socialStatuses} />
            <FormFieldWrapper form={form} name="content" label="Content" type="textarea" />
          </div>
          <LoadingBtn isLoading={isLoading}>Create</LoadingBtn>
        </form>
      </Form>
    </DialogWrapper>
  );
}