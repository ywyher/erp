import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Operation Preset | Dashboard | Perfect Health",
  description: "Define a new operation preset for standardized procedures.",
  keywords: ['operation preset', 'healthcare preset', 'dashboard tools'],
  openGraph: {
    title: "Create Operation Preset | Dashboard | Perfect Health",
    description: "Create reusable templates for common medical operations.",
    url: "https://perfect-health.net/dashboard/presets/create",
    siteName: "Perfect Health",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Operation Preset | Perfect Health",
    description: "Simplify workflows by creating operation presets.",
  },
}

export default async function CreatPresetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children
}
