import CreateUser from "@/app/(authenticated)/dashboard/(admins)/users/_components/create-user";
import { userTableColumns } from "@/app/(authenticated)/dashboard/(admins)/users/columns";
import CardLayout from "@/app/(authenticated)/dashboard/_components/card-layout";
import { DataTable } from "@/components/ui/data-table";
import { listUsers } from "@/lib/db/queries";

export default async function Users() {
  const data = await listUsers("user");

  return (
    <CardLayout title="Manage Users">
      <DataTable
        columns={userTableColumns}
        data={data ?? []}
        bulkTableName="user"
        hiddenColumns={["id"]}
        filters={["email", "phoneNumber", "nationalId", "username"]}
      />
      <CreateUser />
    </CardLayout>
  );
}
