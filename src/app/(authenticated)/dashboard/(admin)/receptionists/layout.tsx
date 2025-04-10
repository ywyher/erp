import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Receptionist Management | Perfect Health",
  description: "Add, edit, and manage receptionist access and data.",
  keywords: ['receptionist dashboard', 'manage receptionists', 'healthcare staff'],
  openGraph: {
    title: "Receptionist Management | Perfect Health",
    description: "Easily handle receptionist user roles and permissions.",
    url: "https://perfect-health.net/dashboard/receptionists",
    siteName: "Perfect Health",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Manage Receptionists | Perfect Health",
    description: "Dashboard panel to oversee all receptionists in the system.",
  },
}

export default async function ReceptionistsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children
}
