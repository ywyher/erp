import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import localFont from "next/font/local";
import "./globals.css";
import { ReactQueryProvider } from "@/lib/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import Seeder from "@/components/seeder";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Perfect Health | Expert Health, Wellness & Nutrition Advice",
  description: "Discover trusted insights on health, wellness, and nutrition from the experts at Perfect Health.",
  keywords: ['health', 'wellness', 'nutrition', 'fitness', 'healthy living', 'perfect health'],
  openGraph: {
    title: "Perfect Health | Expert Health, Wellness & Nutrition Advice",
    description: "Explore expert-written content to support your journey toward better health and well-being.",
    url: "https://perfect-health.net",
    siteName: "Perfect Health",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Perfect Health | Expert Health, Wellness & Nutrition Advice",
    description: "Tips, articles, and expert advice for a healthier, happier life.",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* <Script src="//unpkg.com/react-scan/dist/auto.global.js" strategy="afterInteractive" /> */}
      </head>
      <body
        className={`
          ${geistSans.variable} ${geistMono.variable}
          antialiased
        `}
      >
        <ReactQueryProvider>

          <main className="
            absolute top-0 z-[-2] h-screen w-screen
            bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsla(215,85%,30%,0.3),rgba(255,255,255,0))]
            dark:bg-neutral-950 dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsla(215,70%,40%,0.3),rgba(0,0,0,0))]          
          ">
            <NuqsAdapter>
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
              >
                {process.env.ENV == 'DEVELOPMENT' && (
                  <Seeder />
                )}
                {children}
              </ThemeProvider>
            </NuqsAdapter>
          </main>
          <Toaster />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
