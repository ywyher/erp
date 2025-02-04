'use client'

import Delete from "@/app/(authenticated)/dashboard/_components/delete";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Operation } from "@/lib/db/schema";
import Link from "next/link";
import { Roles } from "@/app/types";
import { useRouter } from "next/navigation";
import { updateOperationStatus } from "@/app/(authenticated)/dashboard/operations/actions";

export default function OperationActions({ operationId, status, role }: {
    operationId: string,
    status: Operation['status']
    role: Roles
}) {    
    const router = useRouter();
    const [open, setOpen] = useState<boolean>(false)

    const handleStart = async () => {
        await updateOperationStatus({ operationId, status: 'ongoing' })
        router.push(`/dashboard/appointments/${operationId}`)
    }


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
                <DropdownMenuSeparator />
                <div className="flex flex-col gap-2">
                    {role == 'doctor' && (status == 'pending' || status == 'ongoing') && (
                        <Button className="w-full" onClick={(() => handleStart())}>
                            Start
                        </Button>
                    )}
                    {status == 'pending' && (
                        <Delete
                            id={operationId}
                            table="operation"
                            label="cancel"
                            setPopOpen={setOpen}
                        />
                    )}
                    {role == 'doctor' && status == 'completed' && (
                        <Link href={`/dashboard/operations/${operationId}`}>
                            <Button className="w-full">
                                Details/Edit
                            </Button>
                        </Link>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}