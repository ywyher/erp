import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Operation | Dashboard | Perfect Health",
  description: "Add a new medical operation or procedure to the schedule.",
  keywords: ['create operation', 'schedule surgery', 'health dashboard'],
  openGraph: {
    title: "Create Operation | Dashboard | Perfect Health",
    description: "Register a new operation or medical procedure in the system.",
    url: "https://perfect-health.net/dashboard/operations/create",
    siteName: "Perfect Health",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Operation | Perfect Health",
    description: "Set up and schedule new operations using the dashboard.",
  },
}

export default async function CreateOperationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children
}
