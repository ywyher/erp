import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Service Management | Dashboard | Perfect Health",
  description: "Add and manage medical services offered by your healthcare facility.",
  keywords: ['service list', 'manage services', 'healthcare offerings'],
  openGraph: {
    title: "Service Management | Dashboard | Perfect Health",
    description: "Control and customize your platform’s list of healthcare services.",
    url: "https://perfect-health.net/dashboard/services",
    siteName: "Perfect Health",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Manage Services | Perfect Health",
    description: "Administer available services, procedures, and specialties through the dashboard.",
  },
}

export default async function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children
}
