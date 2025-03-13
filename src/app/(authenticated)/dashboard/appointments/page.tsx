import CardLayout from "@/components/card-layout";
import { appointmentTableColumns } from "@/app/(authenticated)/dashboard/appointments/columns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { getSession } from "@/lib/auth-client";
import db from "@/lib/db";
import { listAppointments } from "@/lib/db/queries";
import { appointment, doctor, receptionist, user, User } from "@/lib/db/schema";
import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";

export default async function Appointments() {
  const { data } = await getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!data) throw new Error("Unauthorized");

  const appointments = await listAppointments(
    data.user.id,
    data.user.role as User["role"],
  );

  return (
    <CardLayout title="Manage Appointments" className="flex-1">
      {appointments && (
        <div className="h-screen flex flex-col">
          <div className="flex-1">
            <DataTable
              columns={appointmentTableColumns}
              data={appointments}
              filters={["doctorId", "patientId"]}
              bulkTableName="appointment"
              hiddenColumns={["id"]}
            />
          </div>
          <Button className="sticky bottom-4 p-4 shadow-md w-full">
            <Link href="/dashboard/appointments/create">
              Create Appointment
            </Link>
          </Button>
        </div>
      )}
    </CardLayout>
  );
}
