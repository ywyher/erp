"use client";

import { Column, ColumnDef, Row, Table } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import ServiceActions from "@/app/(authenticated)/dashboard/(admin)/services/_components/service-actions";
import TableCell from "@/components/table-cell";

const serviceColumns = [
  { value: "id", header: "ID" },
  { value: "title", header: "Title" },
  { value: "content", header: "Content", dialog: true },
  { value: "thumbnail", header: "Thumbnail" },
  { value: "status", header: "Status" },
];

export const serviceTableColumns: ColumnDef<any>[] = [
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
  ...serviceColumns.map(({ value, header, dialog }) => ({
    accessorKey: value,
    header: ({ column }: { column: Column<any> }) => (
      <DataTableColumnHeader column={column} title={header} />
    ),
    cell: ({ row }: { row: Row<any> }) => (
      <TableCell row={row} value={value} header={header} dialog={dialog} />
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
