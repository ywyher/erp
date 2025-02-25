'use client'

import {
  Sidebar as CSidebar,
  SidebarContent,
  SidebarHeader,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import SidebarFooter from "@/app/(authenticated)/dashboard/_components/sidebar/sidebar-footer";
import AdminDashboard from "@/app/(authenticated)/dashboard/_components/sidebar/admin/admin-sidebar";
import DoctorDashboard from "@/app/(authenticated)/dashboard/_components/sidebar/doctor/doctor-sidebar";
import ReceptionistDashboard from "@/app/(authenticated)/dashboard/_components/sidebar/receptionist/receptionist-sidebar";
import UserDashboard from "@/app/(authenticated)/dashboard/_components/sidebar/user/user-sidebar";
import { User } from "@/lib/db/schema";
import Logo from "@/components/logo";
import { useSidebar } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle";

export default function Sidebar({ userRole }: { userRole: User['role'] }) {
  const {
    state,
    isMobile
  } = useSidebar()
  
  return (
    <CSidebar collapsible="icon" variant="floating">
      <SidebarHeader className={`
          flex justify-between items-center
          ${!isMobile && state == 'collapsed' ? `flex-col` : 'flex-row'}
        `}>
        {!isMobile && state == 'collapsed' ? ( 
          <Logo size={70} type='icon' />
        ): (
          <Logo size={100} />
        )}
        <div className={`
          flex gap-1 items-center
          ${state != 'collapsed' ? `flex-row`: 'flex-col'}
        `}>
          <ThemeToggle />
          <SidebarTrigger size={'icon'} />
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        {userRole == 'admin' && (
          <AdminDashboard />
        )}
        {userRole == 'doctor' && (
          <DoctorDashboard />
        )}
        {userRole == 'receptionist' && (
          <ReceptionistDashboard />
        )}
        {userRole == 'user' && (
          <UserDashboard />
        )}
      </SidebarContent>
      <SidebarFooter />
    </CSidebar>
  );
}
