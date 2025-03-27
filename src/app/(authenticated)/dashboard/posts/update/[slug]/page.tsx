"use client";

import { FormFieldWrapper } from "@/components/form-field-wrapper";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import LoadingBtn from "@/components/loading-btn";
import { z } from "zod";
import { toast } from "sonner";
import { revalidate } from "@/app/actions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFileUpload } from "@/hooks/use-file-upload";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { deleteFile } from "@/lib/s3";
import { getChangedFields, getFileUrl } from "@/lib/funcs";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/app/(authenticated)/dashboard/_components/dashboard-layout";
import { Editor, Value } from "@udecode/plate";
import { postCategoryStatuses, postSchema } from "@/app/(authenticated)/dashboard/posts/types";
import { getPostData, updatePost } from "@/app/(authenticated)/dashboard/posts/actions";
import { socialStatuses } from "@/lib/constants";
import { useProcessStore } from "@/components/editor/store";

// Create a modified schema for updates where thumbnail is optional
const updatePostSchema = postSchema.extend({
  thumbnail: z.instanceof(File, { message: "Invalid file type" }).optional(),
});

export default function UpdatePost() {
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [hasExistingThumbnail, setHasExistingThumbnail] = useState<boolean>(false);

  const queryClient = useQueryClient();
  const router = useRouter();
  const { handleUpload } = useFileUpload();
  const { isProcessing } = useProcessStore();

  const editorRef = useRef<Editor | null>(null);

  const params = useParams();
  const slug = params.slug as string; // Ensure it's treated as a string

  const form = useForm<z.infer<typeof updatePostSchema>>({
    resolver: zodResolver(updatePostSchema),
    defaultValues: {
      title: "",
      content: [],
      status: "draft",
    }
  });

  const { data: postData, isLoading: isPostDataLoading } = useQuery({
    queryKey: ['post', 'date', 'update', slug],
    queryFn: async () => {
      return await getPostData(slug);
    }
  });

  useEffect(() => {
    if (postData) {
      form.reset({
        title: postData.title,
        content: postData.content as [],
        status: postData.status,
        tags: postData.tags ? postData.tags.split(",") : [],
        category: postData.category,
      });
      
      if (postData.thumbnail) {
        setHasExistingThumbnail(true);
      }
    }
  }, [postData, form]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      form.setValue("thumbnail", selectedFile);
      setHasExistingThumbnail(false);
    }
  };
  
  const handleRemoveImage = async () => {
    // !form.getValues('thumbnail') -> means that a file exists but from the database
    if(postData?.thumbnail && !form.getValues('thumbnail')) {
      await deleteFile(postData?.thumbnail)
    }

    setPreviewUrl(undefined);
    form.setValue("thumbnail", undefined);
    setHasExistingThumbnail(false);
    form.clearErrors("thumbnail");
  };

  const onSubmit = async (data: z.infer<typeof updatePostSchema>) => {
    if (!postData) return;
    setIsLoading(true);
    
    try {
      if (editorRef.current) {
        const currentContent = editorRef.current.children;
        form.setValue("content", currentContent);
        data.content = currentContent;
      }
  
      const sessionData = {
        title: postData.title,
        content: postData.content,
        thumbnail: postData.thumbnail,
        status: postData.status,
      }
  
      const localData = {
        title: data.title,
        content: data.content,
        status: data.status,
        thumbnail: data.thumbnail ? 'updated' : postData.thumbnail,
      }
  
      const changedFields = getChangedFields(sessionData, localData);
  
      if (Object.keys(changedFields).length === 0) {
        toast.error("No Changes thus no fields were updated.");
        setIsLoading(false);
        return;
      }
  
      let fileName: string = postData.thumbnail || '';
      
      // Only upload new file if thumbnail is changed
      if (data.thumbnail) {
        // Delete the old file if it exists
        if (postData.thumbnail) {
          await deleteFile(postData.thumbnail);
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
  
      const { title, content, status, tags, category } = data;
      
      const result = await updatePost({ 
        title,
        content,
        status,
        category,
        thumbnail: fileName,
        tags: tags.join(','),
        slug,
      });
  
      if (result?.error) {
        toast.error(result?.error);
        
        // If we uploaded a new file but the update failed, delete it
        if (data.thumbnail && fileName !== postData.thumbnail) {
          await deleteFile(fileName);
        }
        
        setIsLoading(false);
        return;
      }
  
      toast.message(result?.message);
  
      await revalidate("/dashboard/posts");
      queryClient.invalidateQueries({ queryKey: ['post', 'data', 'update', slug] })
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

  if(!postData || isPostDataLoading) return <>Loading...</>;

  return (
    <DashboardLayout title="Update a post">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onError)}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-3">
            {isPostDataLoading ? (
              <div>Loading...</div>
            ) : (
              <>
                {previewUrl ? (
                  <div className="relative rounded-md overflow-hidden border border-gray-200">
                    <div className="relative w-full h-48">
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
                ) : postData?.thumbnail && hasExistingThumbnail ? (
                  <div className="relative rounded-md overflow-hidden border border-gray-200">
                    <div className="relative w-full h-96">
                      <Image 
                        src={getFileUrl(postData.thumbnail)}
                        alt="Post thumbnail"
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
                    accept="image/*"
                    type="file"
                    onFileChange={handleFileChange}
                  />
                )}
                <FormFieldWrapper form={form} name="title" label="Title" />
                <FormFieldWrapper form={form} name="status" label="Status" type="select" options={socialStatuses} />
                <FormFieldWrapper form={form} name="category" label="Category" type="select" options={postCategoryStatuses} />
                <FormFieldWrapper form={form} name="tags" label="Tags" type="tags" defaultValue={postData.tags as string} />
                <FormFieldWrapper form={form} name="content" label="Editor" type="editor" editorRef={editorRef} defaultValue={postData.content as Value} />
              </>
            )}
          </div>
          <LoadingBtn isLoading={isLoading || isProcessing}>Update</LoadingBtn>
        </form>
      </Form>
    </DashboardLayout>
  );
}