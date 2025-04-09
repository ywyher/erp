"use client";

import { Column, ColumnDef, Row } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import React from "react";
import AdminAction from "@/app/(authenticated)/dashboard/(admin)/admins/_components/admin-actions";
import TableCell from "@/components/table-cell";
import { User } from "@/lib/db/schema";

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

export const adminTableColumns: ColumnDef<User>[] = [
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
    header: ({ column }: { column: Column<User> }) => (
      <DataTableColumnHeader column={column} title={header} />
    ),
    cell: ({ row }: { row: Row<User> }) => (
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
