import CreateDoctor from "@/app/(authenticated)/dashboard/(admin)/doctors/_components/create-doctor";
import { getDoctors } from "@/app/(authenticated)/dashboard/(admin)/doctors/actions";
import { doctorTableColumns } from "@/app/(authenticated)/dashboard/(admin)/doctors/columns";
import DashboardLayout from "@/app/(authenticated)/dashboard/_components/dashboard-layout";
import StatCard from "@/app/(authenticated)/dashboard/_components/stat-cart";
import { DataTable } from "@/components/ui/data-table";
import { Stethoscope } from "lucide-react";

export default async function Doctors() {
  const doctors = await getDoctors()

  return (
    <DashboardLayout title="Manage Doctors">
      <StatCard
        title={'total doctors'}
        data={doctors.length}
        icon={<Stethoscope />}
      />
      <DataTable
        columns={doctorTableColumns}
        data={doctors ?? []}
        bulkTableName="user"
        filters={[
          "email",
          "phoneNumber",
          "name",
          "username",
          "nationalId",
          "specialty",
        ]}
      />
      <CreateDoctor />
    </DashboardLayout>
  );
}
