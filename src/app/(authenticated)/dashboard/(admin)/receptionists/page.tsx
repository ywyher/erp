import CreateReceptionist from "@/app/(authenticated)/dashboard/(admin)/receptionists/_components/create-receptionist";
import { getReceptionists } from "@/app/(authenticated)/dashboard/(admin)/receptionists/actions";
import { receptionistTableColumns } from "@/app/(authenticated)/dashboard/(admin)/receptionists/columns";
import DashboardLayout from "@/app/(authenticated)/dashboard/_components/dashboard-layout";
import StatCard from "@/app/(authenticated)/dashboard/_components/stat-cart";
import { DataTable } from "@/components/ui/data-table";
import { ConciergeBell } from "lucide-react";

export default async function Doctors() {
  const receptionists = await getReceptionists();

  return (
    <DashboardLayout title="Manage Receptionists">
      <StatCard
        title={'total receptionists'}
        data={receptionists.length}
        icon={<ConciergeBell />}
      />
      <DataTable
        columns={receptionistTableColumns}
        data={receptionists ?? []}
        bulkTableName="user"
        filters={["email", "phoneNumber", "name", "username", "nationalId"]}
      />
      <CreateReceptionist />
    </DashboardLayout>
  );
}
