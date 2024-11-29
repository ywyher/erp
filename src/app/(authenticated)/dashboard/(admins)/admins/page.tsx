import CreateAdmin from "@/app/(authenticated)/dashboard/(admins)/admins/_components/create-admin"
import { doctorTableColumns } from "@/app/(authenticated)/dashboard/(admins)/doctors/columns"
import { DataTable } from "@/components/ui/data-table"
import { listUsers } from "@/lib/db/queries"

export default async function Admin() {
    const data = await listUsers('admin', true)

    return (
        <div className="w-[100%]">
            <DataTable columns={doctorTableColumns} data={data ?? []} />
            <CreateAdmin />
        </div>
    )
}