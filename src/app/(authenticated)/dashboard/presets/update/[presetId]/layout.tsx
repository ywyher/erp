import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Update Operation Preset | Dashboard | Perfect Health",
  description: "Edit existing operation presets for better workflow customization.",
  keywords: ['update preset', 'operation preset edit', 'dashboard operations'],
  openGraph: {
    title: "Update Operation Preset | Dashboard | Perfect Health",
    description: "Update and refine predefined operation templates for efficiency.",
    url: "https://perfect-health.net/dashboard/presets/update",
    siteName: "Perfect Health",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Update Operation Preset | Perfect Health",
    description: "Modify and manage medical operation presets via the dashboard.",
  },
}

export default async function UpdatePresetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children
}
