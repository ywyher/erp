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
import { servicSchema } from "@/app/(authenticated)/dashboard/(admin)/services/types";
import { updateService } from "@/app/(authenticated)/dashboard/(admin)/services/actions";
import { Service } from "@/lib/db/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryServiceData } from "@/lib/db/queries";
import { useFileUpload } from "@/hooks/use-file-upload";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { deleteFile } from "@/lib/s3";
import { socialStatuses } from "@/lib/constants";
import { getChangedFields, getFileUrl } from "@/lib/funcs";

// Create a modified schema for updates where thumbnail is optional
const updateServiceSchema = servicSchema.extend({
  thumbnail: z.instanceof(File, { message: "Invalid file type" }).optional(),
});

export default function UpdateService({ serviceId }: { serviceId: Service['id'] }) {
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [hasExistingThumbnail, setHasExistingThumbnail] = useState<boolean>(false);

  const queryClient = useQueryClient();
  const { handleUpload } = useFileUpload();

  const form = useForm<z.infer<typeof updateServiceSchema>>({
    resolver: zodResolver(updateServiceSchema),
    defaultValues: {
      title: "",
      content: "",
      status: "draft",
    }
  });

  const { data: serviceData, isLoading: isServiceDataLoading } = useQuery({
    queryKey: ['service', 'data', 'update', serviceId],
    queryFn: async () => {
      return await queryServiceData(serviceId);
    }
  });

  useEffect(() => {
    if (serviceData) {
      form.reset({
        title: serviceData.title,
        content: serviceData.content,
        status: serviceData.status,
      });
      
      if (serviceData.thumbnail) {
        setHasExistingThumbnail(true);
      }
    }
  }, [serviceData, form]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      form.setValue("thumbnail", selectedFile);
      setHasExistingThumbnail(false);
    }
  };
  
  const handleRemoveImage = () => {
    setPreviewUrl(undefined);
    form.setValue("thumbnail", undefined);
    setHasExistingThumbnail(false);
    form.clearErrors("thumbnail");
  };

  const onSubmit = async (data: z.infer<typeof updateServiceSchema>) => {
    if (!serviceData) return;
    
    setIsLoading(true);

    const sessionData = {
      title: serviceData.title,
      content: serviceData.content,
      thumbnail: serviceData.thumbnail,
      status: serviceData.status,
    }

    const localData = {
      title: data.title,
      content: data.content,
      status: data.status,
      thumbnail: data.thumbnail ? 'updated' : serviceData.thumbnail,
    }

    const changedFields = getChangedFields(sessionData, localData);

    if (Object.keys(changedFields).length === 0) {
      toast.error("No Changes thus no fields were updated.");
      setIsLoading(false);
      return;
    }

    let fileName: string = serviceData.thumbnail || '';
    
    // Only upload new file if thumbnail is changed
    if (data.thumbnail) {
      // Delete the old file if it exists
      if (serviceData.thumbnail) {
        await deleteFile(serviceData.thumbnail);
      }
      
      const { name, error } = await handleUpload(data.thumbnail);
      
      if (!name || error) {
        setIsLoading(false);
        throw new Error(error);
      }
      
      fileName = name;
    } else if (!hasExistingThumbnail && !data.thumbnail) {
      // If there's no existing thumbnail and no new thumbnail, use empty string
      fileName = '';
    }

    const { title, content, status } = data;
    
    const result = await updateService({ 
      title,
      content,
      status,
      thumbnail: fileName,
      serviceId
    });

    if (result?.error) {
      toast.error(result?.error);
      
      // If we uploaded a new file but the update failed, delete it
      if (data.thumbnail && fileName !== serviceData.thumbnail) {
        await deleteFile(fileName);
      }
      
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
                ) : serviceData?.thumbnail && hasExistingThumbnail ? (
                  <div className="relative rounded-md overflow-hidden border border-gray-200">
                    <div className="relative w-full h-48">
                      <Image 
                        src={getFileUrl(serviceData.thumbnail)}
                        alt="Service thumbnail"
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
              </>
            )}
          </div>
          <LoadingBtn isLoading={isLoading}>Update</LoadingBtn>
        </form>
      </Form>
    </DialogWrapper>
  );
}