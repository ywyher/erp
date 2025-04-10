import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Operations Management | Perfect Health",
  description: "Perform and log real-time operations on active patient appointments.",
  keywords: ['appointment actions', 'check-in', 'appointment processing', 'healthcare ops'],
  openGraph: {
    title: "Operations | Perfect Health",
    description: "Operate on scheduled appointments like check-ins, cancellations, or completions.",
    url: "https://perfect-health.net/dashboard/operations",
    siteName: "Perfect Health",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Operations | Perfect Health",
    description: "Manage real-time actions for appointments through the operations dashboard.",
  },
}

export default async function OperationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children
}
