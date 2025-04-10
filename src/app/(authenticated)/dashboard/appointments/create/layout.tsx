import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Appointment | Dashboard | Perfect Health",
  description: "Schedule a new patient appointment with available doctors and time slots.",
  keywords: ['create appointment', 'schedule appointment', 'health dashboard'],
  openGraph: {
    title: "Create Appointment | Dashboard | Perfect Health",
    description: "Easily create and schedule appointments for patients from the dashboard.",
    url: "https://perfect-health.net/dashboard/appointments/create",
    siteName: "Perfect Health",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Appointment | Perfect Health",
    description: "Quickly schedule new appointments through the dashboard.",
  },
}

export default async function CreateAppointmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children
}
