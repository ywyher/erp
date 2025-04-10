import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Doctor Management | Perfect Health",
  description: "Manage profiles and schedules of doctors registered in the system.",
  keywords: ['doctors', 'manage doctors', 'dashboard doctor panel'],
  openGraph: {
    title: "Doctor Management | Perfect Health",
    description: "Keep doctor data up to date and manage their availability.",
    url: "https://perfect-health.net/dashboard/doctors",
    siteName: "Perfect Health",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Manage Doctors | Perfect Health",
    description: "View, edit, and manage doctor profiles from the dashboard panel.",
  },
}

export default async function DoctorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children
}
