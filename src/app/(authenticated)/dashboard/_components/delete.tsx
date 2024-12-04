'use client'

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
} from "@/components/ui/alert-dialog"
import { Dispatch, SetStateAction, useState } from "react";
import LoadingBtn from "@/components/loading-btn";
import { deleteById } from "@/lib/db/queries";
import { Tables } from "@/lib/db/schema";
import { toast } from "sonner";

export default function Delete({ id, table, setPopOpen, label = 'delete' }: {
    id: string,
    table: Tables,
    label?: string,
    setPopOpen: Dispatch<SetStateAction<boolean>>;
}) {
    const [open, setOpen] = useState<boolean>()
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const handleDelete = async () => {
        setIsLoading(true)
        const result = await deleteById(id, table);

        if (result?.message) {
            toast(result.message);
            setIsLoading(false)
            setPopOpen(false)
            setOpen(false)
        }
    };

    return (
        <AlertDialog open={open}>
            <AlertDialogTrigger asChild>
                <Button variant={'destructive'} className="capitalize font-bold">
                    {label}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="w-full">Cancel</AlertDialogCancel>
                    <LoadingBtn
                        isLoading={isLoading}
                        label='Proceed'
                        variant="destructive"
                        onClick={() => handleDelete()}
                    />
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}