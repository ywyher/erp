import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Book a Doctor Appointment | Perfect Health",
  description: "Easily book an appointment with top-rated doctors and health professionals at Perfect Health.",
  keywords: ['book doctor', 'health booking', 'medical appointment', 'online doctor booking', 'Perfect Health'],
  openGraph: {
    title: "Book a Doctor Appointment | Perfect Health",
    description: "Find and book appointments with trusted healthcare providers near you in just a few clicks.",
    url: "https://perfect-health.net/booking",
    siteName: "Perfect Health",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Book a Doctor Appointment | Perfect Health",
    description: "Schedule your next health checkup or consultation with expert doctors online.",
  },
}

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}