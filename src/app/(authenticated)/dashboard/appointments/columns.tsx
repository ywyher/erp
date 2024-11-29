"use client";

import { Column, ColumnDef, Row } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Edit from "@/app/(authenticated)/dashboard/(admins)/users/_components/update-user";
import React from "react";
import AppointmentActions from "@/app/(authenticated)/dashboard/appointments/_components/appointment-actions";

const appointmentColumns = [
    { value: 'id', header: 'id', isVisible: false },
    { value: "startTime", header: "Start Time" },
    { value: "endTime", header: "End Time" },
    { value: "status", header: "Status" },
];

export const appointmentTableColumns: ColumnDef<any>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    ...appointmentColumns
        .filter(({ isVisible }) => isVisible !== false)
        .map(({ value, header, dialog, isBoolean, isVisible }: { value: string, header: string, dialog?: boolean, isBoolean?: boolean, isVisible?: boolean }) => ({
            accessorKey: value,
            header: ({ column }: { column: Column<any, any> }) => (
                <DataTableColumnHeader column={column} title={header} />
            ),
            cell: ({ row }: { row: Row<any> }) => {
                const cellValue = row.getValue(value);

                return dialog ? (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                View
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{header}</DialogTitle>
                            </DialogHeader>
                            <div>{cellValue as string}</div>
                        </DialogContent>
                    </Dialog>
                ) : (
                    <span>{cellValue as string}</span>
                );
            },
        })),
    {
        id: "actions",
        cell: ({ row }) => {
            const appointment = row.original;
            return (
                <AppointmentActions appointmentId={appointment.id} status={appointment.status} />
            );
        },
    },
];