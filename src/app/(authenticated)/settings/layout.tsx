import { headers } from "next/headers";
import { getSession } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Settings | Perfect Health",
  description: "Update your profile, email, and personal information to keep your account up to date.",
  keywords: ['profile settings', 'account settings', 'user preferences', 'Perfect Health'],
  openGraph: {
    title: "Account Settings | Perfect Health",
    description: "Manage your profile details and personal account settings easily.",
    url: "https://perfect-health.net/settings",
    siteName: "Perfect Health",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Account Settings | Perfect Health",
    description: "Keep your health profile up to date with our easy-to-use account settings.",
  },
}

export default async function SettingsLayout({
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

  if(!data?.user.id) {
    redirect('/')
    return;
  }

  return children
}
