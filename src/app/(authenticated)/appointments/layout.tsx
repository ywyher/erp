import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: "My Appointments | Perfect Health",
    description: "View and manage your upcoming medical appointments at Perfect Health.",
    keywords: ['health appointments', 'my appointments', 'medical scheduling', 'Perfect Health'],
    openGraph: {
      title: "My Appointments | Perfect Health",
      description: "Access your scheduled health appointments and manage your bookings in one place.",
      url: "https://perfect-health.net/appointments",
      siteName: "Perfect Health",
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: "My Appointments | Perfect Health",
      description: "Stay on top of your health by managing your upcoming appointments with ease.",
    },
}

export default function AppointmentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}