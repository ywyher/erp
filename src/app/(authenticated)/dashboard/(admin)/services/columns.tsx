"use client";

import { Column, ColumnDef, Row } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import ServiceActions from "@/app/(authenticated)/dashboard/(admin)/services/_components/service-actions";
import TableCell from "@/components/table-cell";
import { Service } from "@/lib/db/schema";

const serviceColumns = [
  { value: "id", header: "ID" },
  { value: "title", header: "Title" },
  { value: "icon", header: "Icon" },
  { value: "status", header: "Status" },
];

export const serviceTableColumns: ColumnDef<Service>[] = [
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
  ...serviceColumns.map(({ value, header }) => ({
    accessorKey: value,
    header: ({ column }: { column: Column<Service> }) => (
      <DataTableColumnHeader column={column} title={header} />
    ),
    cell: ({ row }: { row: Row<Service> }) => (
      <TableCell row={row} value={value} header={header} />
    ),
  })),
  {
    id: "actions",
    cell: ({ row }) => {
      const service = row.original;
      return (
        <ServiceActions
          serviceId={service.id}
        />
      );
    },
  },
];
