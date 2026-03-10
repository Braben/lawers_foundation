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
    default: "Lawers Foundation | Legal Empowerment for Women & Children",
    template: "%s | Lawers Foundation",
  },
  description: "Lawers Foundation is an NGO dedicated to empowering underprivileged women and children through legal awareness, free legal aid, rehabilitation support, and policy advocacy.",
  keywords: ["NGO", "legal aid", "women empowerment", "child rights", "legal awareness", "rehabilitation", "policy advocacy", "social justice"],
  authors: [{ name: "Lawers Foundation" }],
  openGraph: {
    title: "Lawers Foundation | Legal Empowerment for Women & Children",
    description: "Empowering underprivileged women and children through legal awareness, aid, and support for a just society.",
    type: "website",
    locale: "en_IN",
    siteName: "Lawers Foundation",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lawers Foundation | Legal Empowerment for Women & Children",
    description: "Empowering underprivileged women and children through legal awareness, aid, and support for a just society.",
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
