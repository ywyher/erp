import CreateAdmin from "@/app/(authenticated)/dashboard/(admins)/admins/_components/create-admin"
import { adminTableColumns } from "@/app/(authenticated)/dashboard/(admins)/admins/columns"
import CardLayout from "@/app/(authenticated)/dashboard/_components/card-layout"
import { DataTable } from "@/components/ui/data-table"
import { listUsers } from "@/lib/db/queries"

export default async function Admin() {
    const data = await listUsers('admin', true)

    return (
        <CardLayout title="Manage Admins">
            <DataTable 
                columns={adminTableColumns} 
                data={data ?? []}
                bulkTableName="user"
                filters={['email', 'phoneNumber', 'name', 'username', 'nationalId']}
            />
            <CreateAdmin />
        </CardLayout>
    )
}