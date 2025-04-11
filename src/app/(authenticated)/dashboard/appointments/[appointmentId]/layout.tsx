import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAppointmentStatus } from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/actions";
import type { Metadata } from "next";
import { Appointment } from "@/lib/db/schema";
import { auth } from "@/lib/auth";

type Params = Promise<{ appointmentId: Appointment['id'] }>

type LayoutProps = {
  children: React.ReactNode;
  params: Params;
};

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { appointmentId } = await params;

  return {
    title: "Appointment Details | Dashboard | Perfect Health",
    description: "Modify an existing appointment's details, timing, or status.",
    keywords: ['details appointment', 'details booking', 'health dashboard'],
    openGraph: {
      title: "Appointment Details | Dashboard | Perfect Health",
      description: "Details or reschedule appointments through the dashboard tools.",
      url: `https://perfect-health.net/dashboard/appointments/${appointmentId}`,
      siteName: "Perfect Health",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Appointment Details | Perfect Health",
      description: "Manage and modify existing appointments efficiently.",
    },
  };
}

export default async function AppointmentDetailsLayout({ children, params }: LayoutProps) {
  const { appointmentId } = await params;
  const reqHeaders = await headers();

  const data = await auth.api.getSession({
    headers: reqHeaders,
  });

  if (!data) {
    console.error("Could not get session data");
    redirect("/");
    return;
  }

  const status = await getAppointmentStatus(appointmentId);

  if (!status) {
    console.error("Could not get appointment status");
    redirect("/dashboard/appointment");
    return;
  }

  if (status !== "completed" && data.user.role !== "doctor") {
    redirect("/dashboard/appointment");
    return;
  }

  return <>{children}</>;
}