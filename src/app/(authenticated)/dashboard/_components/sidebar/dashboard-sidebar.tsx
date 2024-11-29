import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { DashboardSidebarFooter } from "@/app/(authenticated)/dashboard/_components/sidebar/dashboard-sidebar-footer";
import { User } from "@/lib/db/schema";
import AdminDashboard from "@/app/(authenticated)/dashboard/_components/sidebar/admin/admin-dashboard";
import DoctorDashboard from "@/app/(authenticated)/dashboard/_components/sidebar/doctor/doctor-dashboard";
import ReceptionistDashboard from "@/app/(authenticated)/dashboard/_components/sidebar/receptionist/receptionist-dashboard";
import { Roles } from "@/app/types";

export default async function DashboardSidebar({ userRole }: { userRole: Roles }) {
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <SidebarTrigger size={'icon'} />
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
      </SidebarContent>
      <DashboardSidebarFooter />
    </Sidebar>
  );
}
