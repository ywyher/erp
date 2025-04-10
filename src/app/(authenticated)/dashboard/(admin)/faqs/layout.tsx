import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ Management | Dashboard | Perfect Health",
  description: "Manage frequently asked questions to support users and patients.",
  keywords: ['faq admin', 'support content', 'dashboard help center'],
  openGraph: {
    title: "FAQ Management | Dashboard | Perfect Health",
    description: "Update, organize, and publish FAQs for better user support.",
    url: "https://perfect-health.net/dashboard/faqs",
    siteName: "Perfect Health",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Manage FAQs | Perfect Health",
    description: "Maintain and organize your health platform’s FAQ section.",
  },
}

export default async function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children
}
