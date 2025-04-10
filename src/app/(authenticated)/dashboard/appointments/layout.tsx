import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Appointments Management | Perfect Health",
  description: "Track, update, and manage all patient appointments in one place.",
  keywords: ['appointments', 'dashboard appointments', 'manage health bookings'],
  openGraph: {
    title: "Appointments Management | Perfect Health",
    description: "A full overview of upcoming and past appointments for dashboardistrative control.",
    url: "https://perfect-health.net/dashboard/appointments",
    siteName: "Perfect Health",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Manage Appointments | Perfect Health",
    description: "Control and update medical appointments with ease from the dashboard panel.",
  },
}

export default async function AppointmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children
}
