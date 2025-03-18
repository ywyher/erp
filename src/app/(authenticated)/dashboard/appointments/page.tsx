import DashboardLayout from "@/app/(authenticated)/dashboard/_components/dashboard-layout";
import StatCard from "@/app/(authenticated)/dashboard/_components/stat-cart";
import { getAppointments } from "@/app/(authenticated)/dashboard/appointments/actions";
import { appointmentTableColumns } from "@/app/(authenticated)/dashboard/appointments/columns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { getSession } from "@/lib/auth-client";
import db from "@/lib/db";
import { User } from "@/lib/db/schema";
import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { CalendarCheck } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";

export default async function Appointments() {
  const { data } = await getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });
  
  if (!data) throw new Error("Unauthorized");
  const appointments = await getAppointments(data.user.id, data.user.role as User["role"]);
  
  return (
    <DashboardLayout title="Manage Appointments">
      {appointments && (
        <div className="relative">
          <div>
            <StatCard
              title={'total appointments'}
              data={appointments.length}
              icon={<CalendarCheck />}
            />
            <DataTable
              columns={appointmentTableColumns}
              data={appointments}
              filters={["doctorId", "patientId"]}
              bulkTableName="appointment"
              hiddenColumns={["id", "role", "type", "createdBy"]}
            />
          </div>
          
          <div className="fixed bottom-0 left-0 w-full z-10">
            <div className="container mx-auto p-4">
              <Button className="w-full shadow-md">
                <Link href="/dashboard/appointments/create" className="w-full h-full flex items-center justify-center">
                  Create Appointment
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}