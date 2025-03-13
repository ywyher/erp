import CreateReceptionist from "@/app/(authenticated)/dashboard/(admin)/receptionists/_components/create-receptionist";
import { receptionistTableColumns } from "@/app/(authenticated)/dashboard/(admin)/receptionists/columns";
import CardLayout from "@/components/card-layout";
import { DataTable } from "@/components/ui/data-table";
import { listUsers } from "@/lib/db/queries";

export default async function Doctors() {
  const data = await listUsers("receptionist", true);

  return (
    <CardLayout title="Manage Receptionists">
      <DataTable
        columns={receptionistTableColumns}
        data={data ?? []}
        bulkTableName="user"
        filters={["email", "phoneNumber", "name", "username", "nationalId"]}
      />
      <CreateReceptionist />
    </CardLayout>
  );
}
