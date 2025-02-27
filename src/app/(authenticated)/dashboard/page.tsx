"use client";

import CardLayout from "@/app/(authenticated)/dashboard/_components/card-layout";
import AdminPage from "@/app/(authenticated)/dashboard/_components/page/admin/admin-page";
import ReceptionistPage from "@/app/(authenticated)/dashboard/_components/page/receptionist/receptionist-page";
import DoctorPage from "@/app/(authenticated)/dashboard/_components/page/doctor/doctor-page";
import { getSession } from "@/lib/auth-client";
import { User } from "@/lib/db/schema";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["session", "dashboard"],
    queryFn: async () => {
      const { data } = await getSession();
      return (data?.user as User) || null;
    },
  });

  if (!user || isLoading) return <>Loading...</>;

  return (
    <CardLayout
      title={`${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard`}
    >
      {user.role == "admin" && <AdminPage />}
      {user.role == "receptionist" && <ReceptionistPage userId={user.id} />}
      {user.role == "doctor" && <DoctorPage userId={user.id} />}
    </CardLayout>
  );
}
