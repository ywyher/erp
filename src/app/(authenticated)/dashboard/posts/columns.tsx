"use client";

import { Column, ColumnDef, Row } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import TableCell from "@/components/table-cell";
import PostActions from "@/app/(authenticated)/dashboard/posts/_components/post-actions";
import { Post } from "@/lib/db/schema";

const postColumns = [
  { value: "id", header: "ID" },
  { value: "title", header: "Title", readMore: true, maxChars: 24 },
  { value: "content", header: "Content", editor: true },
  { value: "slug", header: "Slug" },
  { value: "thumbnail", header: "Thumbnail" },
  // { value: "authorId", header: "Author" },
  { value: "status", header: "Status" },
];

export const postTableColumns: ColumnDef<Post>[] = [
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
  ...postColumns.map(({ value, header, editor, readMore, maxChars }) => ({
    accessorKey: value,
    header: ({ column }: { column: Column<Post> }) => (
      <DataTableColumnHeader column={column} title={header} />
    ),
    cell: ({ row }: { row: Row<Post> }) => (
      <TableCell 
        row={row} 
        value={value} 
        header={header} 
        editor={editor} 
        readMore={readMore} 
        maxChars={maxChars}
      />
    ),
  })),
  {
    id: "actions",
    cell: ({ row }) => {
      const post = row.original as Post;
      return (
        <PostActions
          post={post}
        />
      );
    },
  },
];