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
import { News } from "@/lib/db/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryNewsData } from "@/lib/db/queries";
import { useFileUpload } from "@/hooks/use-file-upload";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { deleteFile } from "@/lib/s3";
import { socialStatuses } from "@/lib/constants";
import { getChangedFields, getFileUrl } from "@/lib/funcs";
import { updateNews } from "@/app/(authenticated)/dashboard/(admin)/news/actions";
import { newsSchema } from "@/app/(authenticated)/dashboard/(admin)/news/types";

// Create a modified schema for updates where thumbnail is optional
const updateNewsSchema = newsSchema.extend({
  thumbnail: z.instanceof(File, { message: "Invalid file type" }).optional(),
});

export default function UpdateNews({ newsId }: { newsId: News['id'] }) {
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [hasExistingThumbnail, setHasExistingThumbnail] = useState<boolean>(false);

  const queryClient = useQueryClient();
  const { handleUpload } = useFileUpload();

  const form = useForm<z.infer<typeof updateNewsSchema>>({
    resolver: zodResolver(updateNewsSchema),
    defaultValues: {
      title: "",
      content: [],
      status: "draft",
    }
  });

  const { data: newsData, isLoading: isNewsDataLoading } = useQuery({
    queryKey: ['news-data', newsId],
    queryFn: async () => {
      return await queryNewsData(newsId);
    }
  });

  useEffect(() => {
    if (newsData) {
      form.reset({
        title: newsData.title,
        content: newsData.content as [],
        status: newsData.status,
      });
      
      if (newsData.thumbnail) {
        setHasExistingThumbnail(true);
      }
    }
  }, [newsData, form]);
  
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

  const onSubmit = async (data: z.infer<typeof updateNewsSchema>) => {
    if (!newsData) return;
    
    setIsLoading(true);

    const sessionData = {
      title: newsData.title,
      content: newsData.content,
      thumbnail: newsData.thumbnail,
      status: newsData.status,
    }

    const localData = {
      title: data.title,
      content: data.content,
      status: data.status,
      thumbnail: data.thumbnail ? 'updated' : newsData.thumbnail,
    }

    const changedFields = getChangedFields(sessionData, localData);

    if (Object.keys(changedFields).length === 0) {
      toast.error("No Changes thus no fields were updated.");
      setIsLoading(false);
      return;
    }

    let fileName: string = newsData.thumbnail || '';
    
    // Only upload new file if thumbnail is changed
    if (data.thumbnail) {
      // Delete the old file if it exists
      if (newsData.thumbnail) {
        await deleteFile(newsData.thumbnail);
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
    
    const result = await updateNews({ 
      title,
      content,
      status,
      thumbnail: fileName,
      newsId,
    });

    if (result?.error) {
      toast.error(result?.error);
      
      // If we uploaded a new file but the update failed, delete it
      if (data.thumbnail && fileName !== newsData.thumbnail) {
        await deleteFile(fileName);
      }
      
      setIsLoading(false);
      return;
    }

    toast.message(result?.message);

    await revalidate("/dashboard/newss");
    queryClient.invalidateQueries({ queryKey: ['news-data', newsId] })
    setIsLoading(false);
    setOpen(false);
  };

  return (
    <DialogWrapper
      open={open}
      setOpen={setOpen}
      label="news"
      operation="update"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-3">
            {isNewsDataLoading ? (
              <div>Loading...</div>
            ) : (
              <>
                {previewUrl ? (
                  <div className="relative rounded-md overflow-hidden border border-gray-200">
                    <div className="relative w-full h-48">
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
                ) : newsData?.thumbnail && hasExistingThumbnail ? (
                  <div className="relative rounded-md overflow-hidden border border-gray-200">
                    <div className="relative w-full h-48">
                      <Image 
                        src={getFileUrl(newsData.thumbnail)}
                        alt="News thumbnail"
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
                    accept="image/*"
                    type="file"
                    onFileChange={handleFileChange}
                  />
                )}
                <FormFieldWrapper form={form} name="title" label="Title" />
                <FormFieldWrapper form={form} name="status" label="Status" type="select" options={socialStatuses} />
                <FormFieldWrapper form={form} name="content" label="Editor" type="editor" />
              </>
            )}
          </div>
          <LoadingBtn isLoading={isLoading}>Update</LoadingBtn>
        </form>
      </Form>
    </DialogWrapper>
  );
}