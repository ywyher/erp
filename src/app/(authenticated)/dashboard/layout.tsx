import { cookies, headers } from "next/headers";
import { SidebarProvider } from "@/components/ui/sidebar"
import Sidebar from "@/app/(authenticated)/dashboard/_components/sidebar/sidebar"
import { getSession } from "@/lib/auth-client";
import { User } from "@/lib/db/schema";

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
      <Sidebar userRole={data?.user.role as User['role']} />
      {children}
    </SidebarProvider>
  )
}