import { headers } from "next/headers";
import { getSession } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { Appointment } from "@/lib/db/schema";
import { getAppointmentStatus } from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/actions";

type Params = Promise<{ appointmentId: Appointment['id'] }>

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { appointmentId } = await params

  const reqHeaders = await headers();

  // Validate session
  const session = await getSession({
    fetchOptions: {
      headers: reqHeaders,
    },
  });

  if (!session?.data) {
    console.error("Could not get session data");
    redirect("/login"); // Redirect to login if session is invalid
    return;
  }

  // Validate appointment status
  const status = await getAppointmentStatus(appointmentId);

  if (!status) {
    console.error("Could not get appointment status");
    redirect("/dashboard/appointment"); // Redirect if appointment status is invalid
    return;
  }

  // Check if the appointment is completed or if the user is a doctor
  if (status !== "completed" && session.data.user.role !== "doctor") {
    redirect("/dashboard/appointment");
    return;
  }

  return <>{children}</>;
}
