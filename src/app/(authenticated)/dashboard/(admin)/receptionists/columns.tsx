"use client";

import { Column, ColumnDef, Row } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import React from "react";
import ReceptionistAction from "@/app/(authenticated)/dashboard/(admin)/receptionists/_components/receptionist-actions";
import TableCell from "@/components/table-cell";
import { Receptionist, Schedule } from "@/lib/db/schema";

type ReceptionistWithDetails = {
  id: string;
  name: string;
  username: string | null;
  displayUsername: string | null;
  email: string | null;
  phoneNumber: string | null;
  nationalId: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  phoneNumberVerified: boolean;
  emailVerified: boolean;
  image: string | null;
  role: string;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
  receptionist: Receptionist
  schedules: Schedule[];
}

const receptionistColumns = [
  { value: "name", header: "Name" },
  { value: "username", header: "Username" },
  { value: "email", header: "Email" },
  // { value: "emailVerified", header: "Email Verified", isBoolean: true },
  { value: "phoneNumber", header: "Phone Number" },
  // { value: "phoneNumberVerified", header: "Phone Verified", isBoolean: true },
  { value: "nationalId", header: "National Id" },
  { value: "department", header: "Department" },
  { value: "schedules", header: "Schedules", dialog: true },
];

export const receptionistTableColumns: ColumnDef<ReceptionistWithDetails>[] = [
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
  ...receptionistColumns.map(
    ({
      value,
      header,
      dialog,
    }: {
      value: string;
      header: string;
      dialog?: boolean;
    }) => ({
      accessorKey: value,
      header: ({ column }: { column: Column<ReceptionistWithDetails> }) => (
        <DataTableColumnHeader column={column} title={header} />
      ),
      cell: ({ row }: { row: Row<ReceptionistWithDetails> }) => (
        <TableCell
          row={row}
          value={value}
          header={header}
          dialog={dialog}
        />
      ),
    }),
  ),
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      return <ReceptionistAction userId={user.id} />;
    },
  },
];
