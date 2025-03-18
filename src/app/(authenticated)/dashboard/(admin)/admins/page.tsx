import CreateAdmin from "@/app/(authenticated)/dashboard/(admin)/admins/_components/create-admin";
import { getAdmins } from "@/app/(authenticated)/dashboard/(admin)/admins/actions";
import { adminTableColumns } from "@/app/(authenticated)/dashboard/(admin)/admins/columns";
import DashboardLayout from "@/app/(authenticated)/dashboard/_components/dashboard-layout";
import StatCard from "@/app/(authenticated)/dashboard/_components/stat-cart";
import { DataTable } from "@/components/ui/data-table";
import { Lock } from "lucide-react";

export default async function Admin() {
  const admins = await getAdmins();

  return (
    <DashboardLayout title="Manage Admins">
      <StatCard
        title={'total admins'}
        data={admins.length}
        icon={<Lock />}
      />
      <DataTable
        columns={adminTableColumns}
        data={admins ?? []}
        bulkTableName="user"
        filters={["email", "phoneNumber", "name", "username", "nationalId"]}
      />
      <CreateAdmin />
    </DashboardLayout>
  );
}