import { Suspense } from 'react';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar, Footer } from "@/components/layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Lawer and Lawers Foundation | Empowering Orphans, Widows & Caregivers in Ghana",
    template: "%s | Lawer and Lawers Foundation",
  },
  description: "Lawer and Lawers Foundation empowers orphans, widows, single mothers and caregivers in Lower Manya Krobo, Eastern Region, Ghana through education, vocational skills, economic empowerment, health & community support since early 2000.",
  keywords: ["Lawer and Lawers", "Ghana NGO", "orphan support", "widows empowerment", "house help training", "vocational skills", "Lower Manya Krobo", "caregiver", "micro-business"],
  authors: [{ name: "Lawer and Lawers Foundation" }],
  openGraph: {
    title: "Lawer and Lawers Foundation | Empowering Orphans, Widows & Caregivers in Ghana",
    description: "Family Support Project since early 2000 — education, skills training, shelter, micro-business and counselling for orphans, widows and caregivers in Ghana.",
    type: "website",
    locale: "en_GH",
    siteName: "Lawer and Lawers Foundation",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lawer and Lawers Foundation | Empowering Orphans, Widows & Caregivers in Ghana",
    description: "Family Support Project since early 2000 — education, skills training, shelter, micro-business and counselling for orphans, widows and caregivers in Ghana.",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "google-site-verification-code",
  },
};

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#2C5F2D] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        <Suspense fallback={<LoadingFallback />}>
          <main id="main-content" role="main">
            {children}
          </main>
        </Suspense>
        <Footer />
      </body>
    </html>
  );
}
