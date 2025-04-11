"use client";

import {
  Sidebar as CSidebar,
  SidebarContent,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import SidebarFooter from "@/app/(authenticated)/dashboard/_components/sidebar/sidebar-footer";
import AdminDashboard from "@/app/(authenticated)/dashboard/_components/sidebar/admin/admin-sidebar";
import DoctorDashboard from "@/app/(authenticated)/dashboard/_components/sidebar/doctor/doctor-sidebar";
import ReceptionistDashboard from "@/app/(authenticated)/dashboard/_components/sidebar/receptionist/receptionist-sidebar";
import UserDashboard from "@/app/(authenticated)/dashboard/_components/sidebar/user/user-sidebar";
import { User } from "@/lib/db/schema";
import Logo from "@/components/logo";
import { useSidebar } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useQuery } from "@tanstack/react-query";
import { getSession } from "@/lib/auth-client";

export default function Sidebar() {
  const { state, isMobile } = useSidebar();

  const { data: user, isLoading } = useQuery({
    queryKey: ['session', 'sidebar'],
    queryFn: async () => {
      const { data } = await getSession()
      return data?.user as User
    }
  })

  return (
    <CSidebar collapsible="icon" variant="inset">
      <SidebarHeader
        className={`
          flex justify-between items-center
          ${!isMobile && state == "collapsed" ? `flex-col` : "flex-row"}
        `}
      >
        {!isMobile && state == "collapsed" ? (
          <Logo type="icon" />
        ) : (
          <Logo />
        )}
        <div
          className={`
          flex gap-1 items-center
          ${state != "collapsed" ? `flex-row` : "flex-col"}
        `}
        >
          <ThemeToggle />
          {/* <SidebarTrigger size={"icon"} /> */}
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        {(user && !isLoading) && (
          <>
            {user.role == "admin" && <AdminDashboard />}
            {user.role == "doctor" && <DoctorDashboard />}
            {user.role == "receptionist" && <ReceptionistDashboard />}
            {user.role == "user" && <UserDashboard />}
          </>
        )}
      </SidebarContent>
      <SidebarFooter />
    </CSidebar>
  );
}
