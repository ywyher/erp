import { getSession } from "@/lib/auth-client";
import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Post Management | Dashboard | Perfect Health",
  description: "Create, update, and manage health-related posts and content.",
  keywords: ['content management', 'dashboard posts', 'Perfect Health blog'],
  openGraph: {
    title: "Post Management | Dashboard | Perfect Health",
    description: "Dashboard tools for publishing and managing health blog content.",
    url: "https://perfect-health.net/dashboard/posts",
    siteName: "Perfect Health",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Manage Blog Posts | Perfect Health",
    description: "Oversee all published articles and schedule new content with ease.",
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

  // if (data?.user.role !== "admin" && data?.user.role !== "doctor") {
  if (data?.user.role !== "admin") {
    return redirect("/");
  }

  return children;
}
