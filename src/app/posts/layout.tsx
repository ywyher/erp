import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Health & Wellness Posts | Perfect Health',
  description: 'Explore expert-written articles on health, fitness, nutrition, and wellness from the team at Perfect Health.',
  keywords: ['health', 'wellness', 'fitness', 'nutrition', 'expert health advice', 'perfect health blog'],
  openGraph: {
    title: 'Health & Wellness Posts | Perfect Health',
    description: 'Read trusted articles by experts on everything from fitness tips to healthy living at Perfect Health.',
    url: 'https://perfect-health.net/posts',
    siteName: 'Perfect Health',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Health & Wellness Posts | Perfect Health',
    description: 'Expert advice on health, fitness, and nutrition — stay informed with Perfect Health.',
  },
}

export default function PostsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}