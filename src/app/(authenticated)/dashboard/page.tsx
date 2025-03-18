'use server'

import AdminPage from "@/app/(authenticated)/dashboard/_components/page/admin/admin-page";
import ReceptionistPage from "@/app/(authenticated)/dashboard/_components/page/receptionist/receptionist-page";
import DoctorPage from "@/app/(authenticated)/dashboard/_components/page/doctor/doctor-page";
import { getSession } from "@/lib/auth-client";
import DashboardLayout from "@/app/(authenticated)/dashboard/_components/dashboard-layout";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const { data } = await getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if(!data) {
    redirect('/')
    return
  }

  return (
    <DashboardLayout
      title={`${data.user.role.charAt(0).toUpperCase() + data.user.role.slice(1)} Dashboard`}
    >
      {data.user.role == "admin" && <AdminPage />}
      {data.user.role == "receptionist" && <ReceptionistPage userId={data.user.id} />}
      {data.user.role == "doctor" && <DoctorPage userId={data.user.id} />}
    </DashboardLayout>
  );
}