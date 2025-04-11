import { cookies } from "next/headers";
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "@/app/(authenticated)/dashboard/_components/sidebar/sidebar";
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

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar />
      {children}
    </SidebarProvider>
  );
}
