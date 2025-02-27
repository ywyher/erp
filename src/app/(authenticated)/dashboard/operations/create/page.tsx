import CreateOperation from "@/app/(authenticated)/dashboard/operations/create/_components/create-operation";
import { getSession, User } from "@/lib/auth-client";
import db from "@/lib/db";
import { doctor } from "@/lib/db/schema";
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

export default async function CreateOperationPage() {
  const { data } = await getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (
    !data ||
    (data.user.role != "doctor" &&
      data.user.role != "receptionist" &&
      data.user.role != "admin")
  )
    return redirect("/dashboard");

  if (!data.user) return;

  let doctorId;
  if (data.user.role == "doctor") {
    doctorId = await getDocotorId(data.user.id);
  }

  return (
    <div className="w-full">
      <CreateOperation
        id={data.user.id}
        doctorWorkId={data.user.role == "doctor" ? doctorId : undefined}
        role={data.user.role}
      />
    </div>
  );
}
