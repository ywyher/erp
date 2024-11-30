"use client"

import { Column, ColumnDef, Row, Table } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import AppointmentActions from "@/app/(authenticated)/dashboard/appointments/_components/appointment-actions"
import UserData from "@/app/(authenticated)/dashboard/appointments/_components/user-data"

const appointmentColumns = [
    { value: 'id', header: 'ID', isVisible: false },
    { value: "startTime", header: "Start Time" },
    { value: "endTime", header: "End Time" },
    { value: "status", header: "Status" },
    { value: "createdBy", header: "Created By" },
    { value: "doctorId", header: "Doctor Data" },
    { value: "patientId", header: "Patient Data" },
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
        .filter(({ isVisible }) => isVisible !== false)
        .map(({ value, header }) => ({
            accessorKey: value,
            header: ({ column }: { column: Column<any> }) => (
                <DataTableColumnHeader column={column} title={header} />
            ),
            cell: ({ row, table }: { row: Row<any>, table: Table<any> }) => {
                const cellValue = row.getValue(value);
                const createdBy = row.getValue('createdBy'); // Get the createdBy field correctly

                if (value === 'doctorId') {
                    if ((createdBy === 'user' || createdBy === 'receptionist')) {
                        return (
                            <UserData
                                userId={cellValue as string}
                                role="doctor"
                            />
                        );
                    } else {
                        return <>N/A</>
                    }
                }

                if (value === 'patientId') {
                    if ((createdBy === 'doctor' || createdBy === 'receptionist')) {
                        return (
                            <UserData
                                userId={cellValue as string}
                                role="user"
                            />
                        );
                    } else {
                        return <>N/A</>
                    }
                }

                // Fallback to display raw value if no condition matches
                return <span>{cellValue as string}</span>;
            },
        })),
    {
        id: "actions",
        cell: ({ row }) => {
            const appointment = row.original
            return (
                <AppointmentActions
                    appointmentId={appointment.id}
                    status={appointment.status}
                    createdBy={appointment.createdBy}
                />
            )
        },
    },
]