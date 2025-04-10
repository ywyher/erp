import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Management | Perfect Health",
  description: "Assign roles, manage access, and monitor admin activity.",
  keywords: ['admin roles', 'admin access control', 'Perfect Health admins'],
  openGraph: {
    title: "Admin Management | Perfect Health",
    description: "Control and organize admin-level access and permissions.",
    url: "https://perfect-health.net/dashboard/admins",
    siteName: "Perfect Health",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Manage Admins | Perfect Health",
    description: "Oversee all administrative users and configure their permissions.",
  },
}

export default async function AdminsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children
}
