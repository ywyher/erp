"use client";

import { Column, ColumnDef, Row } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { isFakeEmail } from "@/lib/funcs";
import React from "react";
import AdminAction from "@/app/(authenticated)/dashboard/(admins)/admins/_components/admin-actions";
import TableCell from "@/components/table-cell";

// Define admin columns with proper types
const adminColumns: {
  value: string;
  header: string;
  dialog?: boolean;
  isBoolean?: boolean;
}[] = [
  { value: "id", header: "Id" },
  { value: "name", header: "Name" },
  { value: "username", header: "Username" },
  { value: "email", header: "Email" },
  { value: "phoneNumber", header: "Phone Number" },
  { value: "nationalId", header: "National Id" },
];

export const adminTableColumns: ColumnDef<any>[] = [
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
  ...adminColumns.map(({ value, header, dialog, isBoolean }) => ({
    accessorKey: value,
    header: ({ column }: { column: Column<any, any> }) => (
      <DataTableColumnHeader column={column} title={header} />
    ),
    cell: ({ row }: { row: Row<any> }) => (
      <TableCell
        row={row}
        value={value}
        header={header}
        dialog={dialog}
        isBoolean={isBoolean}
      />
    ),
  })),
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      return <AdminAction userId={user.id} />;
    },
  },
];
