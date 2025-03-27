"use client";

import { FormFieldWrapper } from "@/components/form-field-wrapper";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import LoadingBtn from "@/components/loading-btn";
import { z } from "zod";
import { toast } from "sonner";
import { revalidate } from "@/app/actions";
import { useFileUpload } from "@/hooks/use-file-upload";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { deleteFile } from "@/lib/s3";
import DashboardLayout from "@/app/(authenticated)/dashboard/_components/dashboard-layout";
import { useRouter } from "next/navigation";
import { postCategoryStatuses, postSchema } from "@/app/(authenticated)/dashboard/posts/types";
import { createPost } from "@/app/(authenticated)/dashboard/posts/actions";
import { socialStatuses } from "@/lib/constants";
import { useProcessStore } from "@/components/editor/store";
import { Editor } from '@udecode/plate';

export default function CreatePost() {
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string>();
  
  const editorRef = useRef<Editor | null>(null);

  const router = useRouter();
  const { handleUpload } = useFileUpload();
  const { isProcessing } = useProcessStore();

  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
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
  
  const onSubmit = async (data: z.infer<typeof postSchema>) => {
    setIsLoading(true)
    try {
      // Get the latest editor content before submission
      if (editorRef.current) {
        const currentContent = editorRef.current.children;
        form.setValue("content", currentContent);
        data.content = currentContent;
      }

      const { name, error } = await handleUpload(data.thumbnail);
      
      if (!name) {
        setIsLoading(false);
        throw new Error(error);
      }

      const { title, content, status, tags, category } = data;

      const result = await createPost({ 
        title,
        content,
        status,
        tags: tags.join(','),
        category,
        thumbnail: name
      });
      
      if (result?.error) {
        toast.error(result?.error);

        await deleteFile(name);

        setIsLoading(false);
        return;
      }

      toast.message(result?.message);
      await revalidate("/dashboard/posts");
      form.reset({
        title: "",
        content: [],
        thumbnail: undefined,
      });
      router.push('/dashboard/posts')
      setIsLoading(false);
      setOpen(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to create post. Please try again.");
      setIsLoading(false);
    }
  };

  const onError = () => {
    toast.error(Object.values(form.formState.errors)[0].message);
  };

  return (
    <DashboardLayout title="Create a post">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onError)}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-3 max-w-[95%]">
            {previewUrl ? (
              <div className="relative rounded-md overflow-hidden border border-gray-200">
                <div className="relative w-full h-96">
                  <Image 
                    src={previewUrl}
                    alt="Post thumbnail preview"
                    fill
                    className="object-contain"
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
            <FormFieldWrapper form={form} name="category" label="Category" type="select" options={postCategoryStatuses} />
            <FormFieldWrapper form={form} name="tags" label="Tags" type="tags" />
            <FormFieldWrapper form={form} name="content" label="Editor" type="editor" editorRef={editorRef} />
          </div>
          <LoadingBtn isLoading={isLoading || isProcessing}>Create</LoadingBtn>
        </form>
      </Form>
    </DashboardLayout>
  );
}