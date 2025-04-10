import CreateAppointment from "@/app/(authenticated)/dashboard/appointments/create/_components/create-appointment";
import { getSession } from "@/lib/auth-client";
import db from "@/lib/db/index";
import { doctor, Schedule, schedule, User } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const getDocotorId = async (userId: User["id"]) => {
  const [doctorData] = await db
    .select()
    .from(doctor)
    .where(eq(doctor.userId, userId))
    .limit(1);

  return doctorData.id;
};

const getUserSchedules = async (userId: User["id"]) => {
  const schedules = await db
    .select()
    .from(schedule)
    .where(eq(schedule.userId, userId));

  if (!schedules) return;

  return schedules;
};

export default async function CreateAppointmentPage() {
  const { data } = await getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!data || data.user.role == "user") return redirect("/dashboard");

  if (!data.user) return;

  const schedules = (await getUserSchedules(data.user.id)) as Schedule[];

  let doctorId;
  if (data.user.role == "doctor") {
    doctorId = await getDocotorId(data.user.id);
  }

  return (
    <div className="w-full">
      <CreateAppointment
        id={data.user.id}
        schedules={schedules}
        role={data?.user.role as "admin" | "receptionist" | "doctor"}
        doctorWorkId={data.user.role == "doctor" ? doctorId : undefined}
      />
    </div>
  );
}
