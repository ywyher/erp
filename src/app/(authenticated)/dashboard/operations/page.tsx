import DashboardLayout from "@/app/(authenticated)/dashboard/_components/dashboard-layout";
import StatCard from "@/app/(authenticated)/dashboard/_components/stat-cart";
import { getOperations } from "@/app/(authenticated)/dashboard/operations/actions";
import { operationTableColumns } from "@/app/(authenticated)/dashboard/operations/columns";
import ToastWrapper from "@/components/toast-wrapper";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { auth } from "@/lib/auth";
import { User } from "@/lib/db/schema";
import { Cross } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";

export default async function Operations() {
  const data = await auth.api.getSession({
    headers: await headers(),
  });

  if (!data) throw new Error("Unauthorized");

  const operations = await getOperations(data.user.id, data.user.role as User["role"]);

  return (
    <DashboardLayout title="Manage Operations" className="flex-1">
      <ToastWrapper name="error" />
      {operations && (
        <div className="relative">
          <div>
            <StatCard
              title={'total operations'}
              data={operations.length}
              icon={<Cross />}
            />
            <DataTable
              columns={operationTableColumns}
              data={operations}
              filters={["doctorId", "patientId"]}
              bulkTableName="operation"
              hiddenColumns={["id", "role", "type", "createdBy"]}
            />
          </div>
          
          <div className="fixed bottom-0 left-0 w-full z-10">
            <div className="container mx-auto p-4">
              <Button className="w-full shadow-md">
                <Link href="/dashboard/operations/create" className="w-full h-full flex items-center justify-center">
                  Create Operation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
