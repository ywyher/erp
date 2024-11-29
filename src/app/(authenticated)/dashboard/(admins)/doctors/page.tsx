import CreateDoctor from "@/app/(authenticated)/dashboard/(admins)/doctors/_components/create-doctor"
import { doctorTableColumns } from "@/app/(authenticated)/dashboard/(admins)/doctors/columns"
import { DataTable } from "@/components/ui/data-table"
import { listUsers } from "@/lib/db/queries"

export default async function Doctors() {
    const data = await listUsers('doctor', true)

    return (
        <div className="w-[100%]">
            <DataTable columns={doctorTableColumns} data={data ?? []} />
            {/* <Link href="/dashboard/doctors/create">
                <Button>
                    Create Doctor
                </Button>
            </Link> */}
            <CreateDoctor />
        </div>
    )
}