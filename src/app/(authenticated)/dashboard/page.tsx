'use client'

import AdminPage from "@/app/(authenticated)/dashboard/_components/page/admin/admin-page";
import ReceptionistPage from "@/app/(authenticated)/dashboard/_components/page/receptionist/receptionist-page";
import DoctorPage from "@/app/(authenticated)/dashboard/_components/page/doctor/doctor-page";
import { getSession } from "@/lib/auth-client";
import DashboardLayout from "@/app/(authenticated)/dashboard/_components/dashboard-layout";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/lib/db/schema";

export default function Dashboard() {
  const { data: user } = useQuery({
    queryKey: ['session', 'dashboard'],
    queryFn: async () => {
      const { data } = await getSession()
      return data?.user as User
    }
  })

  return (
    <DashboardLayout
      title={`
        ${user && user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        Dashboard`}
    >
      {user && (
        <>
          {user.role == "admin" && <AdminPage />}
          {user.role == "receptionist" && <ReceptionistPage userId={user.id} />}
          {user.role == "doctor" && <DoctorPage userId={user.id} />}
        </>
      )}
    </DashboardLayout>
  );
}