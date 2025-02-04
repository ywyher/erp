"use client"

import { Column, ColumnDef, Row, Table } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import OperationActions from "@/app/(authenticated)/dashboard/operations/_components/operation-actions"
import UserDataDialog from "@/app/(authenticated)/dashboard/_components/user-data-dialog"

const operationColumns = [
    { value: 'id', header: 'ID', isVisible: false },
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
        .filter(({ isVisible }) => isVisible !== false)
        .map(({ value, header }) => ({
            accessorKey: value,
            header: ({ column }: { column: Column<any> }) => (
                <DataTableColumnHeader column={column} title={header} />
            ),
            cell: ({ row, table }: { row: Row<any>, table: Table<any> }) => {
                const cellValue = row.getValue(value);
                const role = row.getValue('role'); // Get the role field correctly

                if (value == 'doctorId') {
                    if ((role == 'user' || role == 'receptionist')) {
                        return (
                            <UserDataDialog
                                userId={cellValue as string}
                                role="doctor"
                            />
                        );
                    } else {
                        return <>N/A</>
                    }
                }

                if (value == 'patientId') {
                    if ((role == 'doctor' || role == 'receptionist')) {
                        return (
                            <UserDataDialog
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