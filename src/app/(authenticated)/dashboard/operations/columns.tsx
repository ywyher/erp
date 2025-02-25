"use client"

import { Column, ColumnDef, Row, Table } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import OperationActions from "@/app/(authenticated)/dashboard/operations/_components/operation-actions"
import TableCell from "@/components/table-cell"

const operationColumns = [
    { value: 'id', header: 'ID' },
    { value: "date", header: "Date" },
    { value: "startTime", header: "Start Time" },
    { value: "endTime", header: "End Time" },
    { value: "createdBy", header: "Created By" },
    { value: "doctorId", header: "Doctor Data" },
    { value: "patientId", header: "Patient Data" },
    { value: "status", header: "Status" },
    { value: "type", header: "Type" },
    { value: 'role', header: 'Role' }
]

export const operationTableColumns: ColumnDef<any>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
    ...operationColumns
        .map(({ value, header }) => ({
            accessorKey: value,
            header: ({ column }: { column: Column<any> }) => (
                <DataTableColumnHeader column={column} title={header} />
            ),
            cell: ({ row }: { row: Row<any> }) => (
                <TableCell row={row} value={value} header={header} />
            ),
        })),
    {
        id: "actions",
        cell: ({ row }) => {
            const operation = row.original
            return (
                <OperationActions
                    operationId={operation.id}
                    status={operation.status}
                    role={operation.role}
                />
            )
        },
    },
]