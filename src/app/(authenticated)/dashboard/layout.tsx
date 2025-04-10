import { cookies, headers } from "next/headers";
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "@/app/(authenticated)/dashboard/_components/sidebar/sidebar";
import { getSession } from "@/lib/auth-client";
import { User } from "@/lib/db/schema";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Perfect Health",
  description: "Overview of your health records, appointments, and activity all in one place.",
  keywords: ['dashboard', 'health overview', 'appointments', 'Perfect Health'],
  openGraph: {
    title: "Dashboard | Perfect Health",
    description: "Access your health data and manage everything from one place.",
    url: "https://perfect-health.net/dashboard",
    siteName: "Perfect Health",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashboard | Perfect Health",
    description: "A complete view of your medical activity and appointments at Perfect Health.",
  },
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";
  const reqHeaders = await headers();

  const { data } = await getSession({
    fetchOptions: {
      headers: reqHeaders,
    },
  });

  if(data?.user.role == 'user') {
    redirect('/')
    return;
  }

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar userRole={data?.user.role as User["role"]} />
      {children}
    </SidebarProvider>
  );
}
