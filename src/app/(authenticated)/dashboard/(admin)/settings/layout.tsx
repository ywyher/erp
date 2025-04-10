import { headers } from "next/headers";
import { getSession } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Application Settings | Dashboard | Perfect Health",
  description: "Configure global application settings, behaviors, and policies.",
  keywords: ['app settings', 'dashboard config', 'Perfect Health setup'],
  openGraph: {
    title: "Application Settings | Dashboard | Perfect Health",
    description: "Manage core configuration and system settings for the entire application.",
    url: "https://perfect-health.net/dashboard/settings",
    siteName: "Perfect Health",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Settings | Dashboard | Perfect Health",
    description: "Control application-wide settings and behaviors from the dashboard interface.",
  },
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const reqHeaders = await headers();

  // Validate session
  const session = await getSession({
    fetchOptions: {
      headers: reqHeaders,
    },
  });

  if (!session?.data) {
    console.error("Could not get session data");
    redirect("/"); // Redirect to login if session is invalid
    return;
  }

  if (session.data.user.role !== "admin") {
    redirect("/dashboard");
    return;
  }

  return <>{children}</>;
}
