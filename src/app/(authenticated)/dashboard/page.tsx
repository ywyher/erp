'use client'

import AdminPage from "@/app/(authenticated)/dashboard/_components/page/admin/admin-page";
import ReceptionistPage from "@/app/(authenticated)/dashboard/_components/page/receptionist/receptionist-page";
import DoctorPage from "@/app/(authenticated)/dashboard/_components/page/doctor/doctor-page";
import { getSession } from "@/lib/auth-client";
import DashboardLayout from "@/app/(authenticated)/dashboard/_components/dashboard-layout";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/lib/db/schema";

export default async function Dashboard() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['session', 'dashboard'],
    queryFn: async () => {
      const { data } = await getSession()
      return data?.user as User
    }
  })

  if(!user || isLoading) return;

  return (
    <DashboardLayout
      title={`${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard`}
    >
      {user.role == "admin" && <AdminPage />}
      {user.role == "receptionist" && <ReceptionistPage userId={user.id} />}
      {user.role == "doctor" && <DoctorPage userId={user.id} />}
    </DashboardLayout>
  );
}