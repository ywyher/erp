"use client";

import { Column, ColumnDef, Row, Table } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import TableCell from "@/components/table-cell";
import PresetActions from "@/app/(authenticated)/dashboard/presets/_components/preset-actions";

const presetColumns = [
  { value: "id", header: "ID" },
  { value: "title", header: "Title", readMore: true, maxChars: 24 },
  { value: 'doctorName', header: "Doctor Name" },
  { value: "data", header: "Data", json: true },
];

export const presetTableColumns: ColumnDef<any>[] = [
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
  ...presetColumns.map(({ value, header, readMore, json, maxChars }) => ({
    accessorKey: value,
    header: ({ column }: { column: Column<any> }) => (
      <DataTableColumnHeader column={column} title={header} />
    ),
    cell: ({ row }: { row: Row<any> }) => (
      <TableCell 
        row={row} 
        value={value} 
        header={header} 
        readMore={readMore} 
        maxChars={maxChars}
        json={json}
      />
    ),
  })),
  {
    id: "actions",
    cell: ({ row }) => {
      const preset = row.original;
      return (
        <PresetActions
          preset={preset}
        />
      );
    },
  },
];