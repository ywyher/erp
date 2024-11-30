import { cookies, headers } from "next/headers";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import DashboardSidebar from "@/app/(authenticated)/dashboard/_components/sidebar/dashboard-sidebar"
import { getSession } from "@/lib/auth-client";
import { Roles } from "@/app/types";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"
  const reqHeaders = await headers()

  const { data } = await getSession({
    fetchOptions: {
      headers: reqHeaders
    }
  })

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <DashboardSidebar userRole={data?.user.role as Roles} />
      {children}
    </SidebarProvider>
  )
}