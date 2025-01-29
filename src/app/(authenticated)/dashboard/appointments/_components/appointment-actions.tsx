'use client'

import Delete from "@/app/(authenticated)/dashboard/_components/delete";
import UpdateUser from "@/app/(authenticated)/dashboard/(admins)/users/_components/update-user";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Appointment } from "@/lib/db/schema";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getSession } from "@/lib/auth-client";
import { Roles } from "@/app/types";

export default function AppointmentActions({ appointmentId, status, role }: {
    appointmentId: string,
    status: Appointment['status']
    role: Roles
}) {
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
                <DropdownMenuSeparator />
                <div className="flex flex-col gap-2">
                    {role == 'doctor' && (status == 'pending' || status == 'ongoing') && (
                        <Link href={`/dashboard/appointments/${appointmentId}`}>
                            <Button className="w-full">
                                Start
                            </Button>
                        </Link>
                    )}
                    <Delete
                        id={appointmentId}
                        table="appointment"
                        label="cancel"
                        setPopOpen={setOpen}
                    />
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}