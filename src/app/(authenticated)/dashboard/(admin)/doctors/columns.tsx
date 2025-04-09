"use client";

import { Column, ColumnDef, Row } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import DoctorAction from "@/app/(authenticated)/dashboard/(admin)/doctors/_components/doctor-actions";
import TableCell from "@/components/table-cell";
import { Doctor, Schedule } from "@/lib/db/schema";

type DoctorWithDetails = {
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
  onBoarding: boolean;
  image: string | null;
  role: string;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
  specialty: Doctor['specialty']
  doctor: {
    id: string;
    specialty: string | null;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  schedules: Schedule[];
};


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

export const doctorTableColumns: ColumnDef<DoctorWithDetails>[] = [
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
    header: ({ column }: { column: Column<DoctorWithDetails> }) => (
      <DataTableColumnHeader column={column} title={header} />
    ),
    cell: ({ row }: { row: Row<DoctorWithDetails> }) => {
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