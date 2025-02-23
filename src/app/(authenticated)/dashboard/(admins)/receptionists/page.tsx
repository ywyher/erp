import CreateReceptionist from "@/app/(authenticated)/dashboard/(admins)/receptionists/_components/create-receptionist"
import { receptionistTableColumns } from "@/app/(authenticated)/dashboard/(admins)/receptionists/columns"
import CardLayout from "@/app/(authenticated)/dashboard/_components/card-layout"
import { DataTable } from "@/components/ui/data-table"
import { listUsers } from "@/lib/db/queries"

export default async function Doctors() {
    const data = await listUsers('receptionist', true)

    return (
        <CardLayout title="Manage Doctors">
            <DataTable columns={receptionistTableColumns} data={data ?? []} bulkTableName="receptionist" />
            <CreateReceptionist />
        </CardLayout>
    )
}