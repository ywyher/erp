"use client";

import { Column, ColumnDef, Row } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { isFakeEmail } from "@/lib/funcs";
import React from "react";
import ReceptionistAction from "@/app/(authenticated)/dashboard/(admins)/receptionists/_components/receptionist-actions";
import { ScheduleDisplay } from "@/components/schedule-display";

const receptionistColumns = [
    { value: "name", header: "Name" },
    { value: "username", header: "Username" },
    { value: "email", header: "Email" },
    { value: "emailVerified", header: "Email Verified", isBoolean: true },
    { value: "phoneNumber", header: "Phone Number" },
    { value: "phoneNumberVerified", header: "Phone Verified", isBoolean: true },
    { value: "nationalId", header: "National Id" },
    { value: "department", header: "Department", },
    { value: 'schedules', header: 'Schedules', dialog: true },
];

export const receptionistTableColumns: ColumnDef<any>[] = [
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
    ...receptionistColumns.map(({ value, header, dialog, isBoolean }: { value: string, header: string, dialog?: boolean, isBoolean?: boolean }) => ({
        accessorKey: value,
        header: ({ column }: { column: Column<any, any> }) => (
            <DataTableColumnHeader column={column} title={header} />
        ),
        cell: ({ row }: { row: Row<any> }) => {
            const cellValue = row.getValue(value);

            if (cellValue == null || isFakeEmail(row.getValue('email'))) {
                return <span className="text-muted-foreground">Empty</span>
            }

            if (isBoolean) {
                return cellValue === true ? "Yes" : "No"
            }

            if (value === 'schedules') {
                const schedules = Array.isArray(cellValue) ? cellValue : [cellValue];

                return (
                    <ScheduleDisplay schedules={schedules} />
                )
            }

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
            const user = row.original;
            return (
                <ReceptionistAction userId={user.id} />
            );
        },
    },
];
