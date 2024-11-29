'use client'

import Delete from "@/app/(authenticated)/dashboard/_components/delete";
import UpdateUser from "@/app/(authenticated)/dashboard/(admins)/users/_components/update-user";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

export default function UserActions({ userId }: { userId: string }) {
    const [open, setOpen] = useState<boolean>(false)

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(userId)}
                >
                    Copy User ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="flex flex-col gap-2">
                    <UpdateUser setPopOpen={setOpen} userId={userId} />
                    <Delete setPopOpen={setOpen} userId={userId} />
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}