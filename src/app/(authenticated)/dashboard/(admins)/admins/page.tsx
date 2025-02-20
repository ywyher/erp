import CreateAdmin from "@/app/(authenticated)/dashboard/(admins)/admins/_components/create-admin"
import { adminTableColumns } from "@/app/(authenticated)/dashboard/(admins)/admins/columns"
import { DataTable } from "@/components/ui/data-table"
import { listUsers } from "@/lib/db/queries"

export default async function Admin() {
    const data = await listUsers('admin', true)

    return (
        <div className="w-[100%]">
            <DataTable columns={adminTableColumns} data={data ?? []} />
            <CreateAdmin />
        </div>
    )
}