import { getSession } from "@/lib/auth-client";
import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Operation Presets | Dashboard | Perfect Health",
  description: "Create and manage preset operations for streamlined appointment handling.",
  keywords: ['operation presets', 'healthcare flows', 'dashboard tools'],
  openGraph: {
    title: "Operation Presets | Dashboard | Perfect Health",
    description: "Define and configure reusable appointment operation presets.",
    url: "https://perfect-health.net/dashboard/presets",
    siteName: "Perfect Health",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Manage Operation Presets | Perfect Health",
    description: "Customize and optimize operation workflows with dashboard presets.",
  },
}


export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const reqHeaders = await headers();

  const { data } = await getSession({
    fetchOptions: {
      headers: reqHeaders,
    },
  });

  if (data?.user.role !== "admin" && data?.user.role !== "doctor") {
    return redirect("/");
  }

  return children;
}
