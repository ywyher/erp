import CreateDoctor from "@/app/(authenticated)/dashboard/(admins)/doctors/_components/create-doctor"
import { doctorTableColumns } from "@/app/(authenticated)/dashboard/(admins)/doctors/columns"
import CardLayout from "@/app/(authenticated)/dashboard/_components/card-layout"
import { DataTable } from "@/components/ui/data-table"
import { listUsers } from "@/lib/db/queries"

export default async function Doctors() {
    const data = await listUsers('doctor', true)

    return (
        <CardLayout title="Manage Doctors">
            <DataTable columns={doctorTableColumns} data={data ?? []} bulkTableName="doctor" />
            <CreateDoctor />
        </CardLayout>
    )
}