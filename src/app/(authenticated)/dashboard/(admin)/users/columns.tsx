"use client";

import { Column, ColumnDef, Row } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import React from "react";
import UserActions from "@/app/(authenticated)/dashboard/(admin)/users/_components/user-actions";
import TableCell from "@/components/table-cell";
import { User } from "@/lib/db/schema";

const userColumns = [
  { value: "id", header: "Id" },
  { value: "name", header: "Name" },
  { value: "username", header: "Username" },
  { value: "email", header: "Email" },
  { value: "emailVerified", header: "Email Verified", isBoolean: true },
  { value: "phoneNumber", header: "Phone Number" },
  { value: "phoneNumberVerified", header: "Phone Verified", isBoolean: true },
  { value: "nationalId", header: "National Id" },
  { value: "provider", header: "Provider" },
];

export const userTableColumns: ColumnDef<User>[] = [
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
  ...userColumns.map(
    ({
      value,
      header,
      dialog,
      isBoolean,
    }: {
      value: string;
      header: string;
      dialog?: boolean;
      isBoolean?: boolean;
    }) => ({
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
    }),
  ),
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      return <UserActions userId={user.id} />;
    },
  },
];
