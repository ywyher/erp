import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management | Dashboard | Perfect Health",
  description: "View, update, and manage user accounts from the dashboard panel.",
  keywords: ['dashboard', 'user management', 'health users', 'Perfect Health dashboard'],
  openGraph: {
    title: "User Management | Dashboard | Perfect Health",
    description: "Dashboard tools to manage and oversee all registered users.",
    url: "https://perfect-health.net/dashboard/users",
    siteName: "Perfect Health",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Manage Users | Dashboard | Perfect Health",
    description: "Easily manage users and monitor activity through the dashboard dashboard.",
  },
}

export default async function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children
}
