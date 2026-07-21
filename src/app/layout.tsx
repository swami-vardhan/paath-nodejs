import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Divine Audio - Spiritual Music Library",
  description: "Listen to Indian spiritual audio - Bhajans, Paath, Sacred Book Translations. A divine collection of spiritual music and teachings.",
  keywords: ["Bhajan", "Paath", "Spiritual Audio", "Indian Music", "Meditation", "Sacred Books", "Devotional Songs"],
  authors: [{ name: "Divine Audio" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Divine Audio - Spiritual Music Library",
    description: "Listen to Indian spiritual audio - Bhajans, Paath, Sacred Book Translations",
    siteName: "Divine Audio",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }
          }}
        />
      </body>
    </html>
  );
}
