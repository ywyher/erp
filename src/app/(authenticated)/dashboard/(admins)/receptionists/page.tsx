import CreateReceptionist from "@/app/(authenticated)/dashboard/(admins)/receptionists/_components/create-receptionist"
import { receptionistTableColumns } from "@/app/(authenticated)/dashboard/(admins)/receptionists/columns"
import { DataTable } from "@/components/ui/data-table"
import { listUsers } from "@/lib/db/queries"

export default async function Doctors() {
    const data = await listUsers('receptionist', true)

    return (
        <div className="w-[100%]">
            <DataTable columns={receptionistTableColumns} data={data ?? []} />
            <CreateReceptionist />
        </div>
    )
}