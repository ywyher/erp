import { Metadata } from "next";

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

export default async function PostsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}