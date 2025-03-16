"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import LoadingBtn from "@/components/loading-btn";
import { toast } from "sonner";
import { DeletePost as DeletePostAction } from "@/app/(authenticated)/dashboard/(admin)/posts/actions";
import { revalidate } from "@/app/actions";

export default function DeletePost({
  id,
  names,
}: {
  id: string;
  names: string[]
}) {
  const [open, setOpen] = useState<boolean>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleDelete = async () => {
    setIsLoading(true);
    const result = await DeletePostAction({ id, names });

    await revalidate("/dashboard/posts");
    if (result?.message) {
      toast(result.message);
      setIsLoading(false);
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogTrigger asChild>
        <Button variant={"destructive"} className="font-bold capitalize">
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="w-full">Cancel</AlertDialogCancel>
          <LoadingBtn
            isLoading={isLoading}
            variant="destructive"
            onClick={() => handleDelete()}
          >
            Procced
          </LoadingBtn>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}