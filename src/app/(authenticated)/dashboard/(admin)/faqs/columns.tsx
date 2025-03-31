"use client";

import { Column, ColumnDef, Row, Table } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import TableCell from "@/components/table-cell";
import FaqActions from "@/app/(authenticated)/dashboard/(admin)/faqs/_components/faq-actions";

const faqColumns = [
  { value: "id", header: "ID" },
  { value: "question", header: "Question", readMore: true, maxChars: 24 },
  { value: "answer", header: "Answer", readMore: true, maxChars: 24 },
  { value: "status", header: "Status" },
];

export const faqTableColumns: ColumnDef<any>[] = [
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
  ...faqColumns.map(({ value, header, readMore, maxChars }) => ({
    accessorKey: value,
    header: ({ column }: { column: Column<any> }) => (
      <DataTableColumnHeader column={column} title={header} />
    ),
    cell: ({ row }: { row: Row<any> }) => (
      <TableCell row={row} value={value} header={header} readMore={readMore} maxChars={maxChars} />
    ),
  })),
  {
    id: "actions",
    cell: ({ row }) => {
      const faq = row.original;
      return (
        <FaqActions
          faqId={faq.id}
        />
      );
    },
  },
];
