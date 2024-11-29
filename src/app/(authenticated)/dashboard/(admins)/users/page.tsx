import CreateUser from "@/app/(authenticated)/dashboard/(admins)/users/_components/create-user"
import { userTableColumns } from "@/app/(authenticated)/dashboard/(admins)/users/columns"
import { DataTable } from "@/components/ui/data-table"
import db from "@/lib/db"
import { listUsers } from "@/lib/db/queries"

export default async function Users() {
    const data = await listUsers('user')

    return (
        <div className="w-[100%]">
            {data && (
                <>
                    <DataTable columns={userTableColumns} data={data} />
                    <CreateUser />
                </>
            )}
        </div>
    )
}
