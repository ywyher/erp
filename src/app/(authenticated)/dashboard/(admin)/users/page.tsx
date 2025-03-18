import CreateUser from "@/app/(authenticated)/dashboard/(admin)/users/_components/create-user";
import { getUsers } from "@/app/(authenticated)/dashboard/(admin)/users/actions";
import { userTableColumns } from "@/app/(authenticated)/dashboard/(admin)/users/columns";
import DashboardLayout from "@/app/(authenticated)/dashboard/_components/dashboard-layout";
import StatCard from "@/app/(authenticated)/dashboard/_components/stat-cart";
import { DataTable } from "@/components/ui/data-table";
import { User } from "lucide-react";

export default async function Users() {
  const users = await getUsers()

  return (
    <DashboardLayout title="Manage Users">
      <StatCard 
        title={'total users'}
        data={users.length}
        icon={<User />}
      />
      <DataTable
        columns={userTableColumns}
        data={users ?? []}
        bulkTableName="user"
        hiddenColumns={["id"]}
        filters={["email", "phoneNumber", "nationalId", "username"]}
      />
      <CreateUser />
    </DashboardLayout>
  );
}