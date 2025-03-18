"use client";

import { Column, ColumnDef, Row } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import DoctorAction from "@/app/(authenticated)/dashboard/(admin)/doctors/_components/doctor-actions";
import TableCell from "@/components/table-cell";

// Define columns
const doctorColumns = [
  { value: "id", header: "Id" },
  { value: "name", header: "Name" },
  { value: "username", header: "Username" },
  { value: "email", header: "Email" },
  // { value: "emailVerified", header: "Email Verified", isBoolean: true },
  { value: "phoneNumber", header: "Phone Number" },
  // { value: "phoneNumberVerified", header: "Phone Verified", isBoolean: true },
  { value: "nationalId", header: "National Id" },
  { value: "specialty", header: "Specialty" },
  { value: "schedules", header: "Schedules", dialog: true },
];

export const doctorTableColumns: ColumnDef<any>[] = [
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
  ...doctorColumns.map(({ value, header, dialog }) => ({
    accessorKey: value,
    header: ({ column }: { column: Column<any, any> }) => (
      <DataTableColumnHeader column={column} title={header} />
    ),
    cell: ({ row }: { row: Row<any> }) => {
      return (
        <TableCell
          row={row}
          value={value}
          header={header}
          dialog={dialog}
        />
      );
    },
  })),
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      return <DoctorAction userId={user.id} />;
    },
  },
];
