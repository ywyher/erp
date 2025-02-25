"use client"

import { Column, ColumnDef, Row, Table } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import AppointmentActions from "@/app/(authenticated)/dashboard/appointments/_components/appointment-actions"
import TableCell from "@/components/table-cell"

const appointmentColumns = [
    { value: 'id', header: 'ID' },
    { value: "date", header: "Date" },
    { value: "startTime", header: "Start Time" },
    { value: "endTime", header: "End Time" },
    { value: "createdBy", header: "Created By" },
    { value: "doctorId", header: "Doctor Data" },
    { value: "patientId", header: "Patient Data" },
    { value: "status", header: "Status" },
    { value: 'role', header: 'Role' }
]

export const appointmentTableColumns: ColumnDef<any>[] = [
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
    ...appointmentColumns
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
            const appointment = row.original
            return (
                <AppointmentActions
                    appointmentId={appointment.id}
                    status={appointment.status}
                    role={appointment.role}
                    patientId={appointment.patientId}
                />
            )
        },
    },
]