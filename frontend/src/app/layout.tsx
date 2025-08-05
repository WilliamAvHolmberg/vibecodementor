import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google'
import "./globals.css";
import { Providers } from "./providers";
import { AppHeader } from "@/shared/components/app-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Full-Stack Template | Next.js + .NET 9 + SignalR",
  description: "Modern full-stack template with Next.js 15, .NET 9, SignalR real-time chat, PostgreSQL, and Tailwind CSS. Perfect starting point for AI-generated applications with live analytics, file uploads, and authentication.",
  keywords: ["Next.js", ".NET 9", "SignalR", "PostgreSQL", "Full-Stack", "Template", "AI-Generated", "Real-time", "Chat", "Analytics"],
  authors: [{ name: "VibeCodeMentor Team" }],
  creator: "VibeCodeMentor",
  publisher: "VibeCodeMentor",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://vibecodementor.se',
    title: 'AI Full-Stack Template | Next.js + .NET 9 + SignalR',
    description: 'Modern full-stack template with Next.js 15, .NET 9, SignalR real-time chat, PostgreSQL, and Tailwind CSS.',
    siteName: 'VibeCodeMentor Template',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Full-Stack Template | Next.js + .NET 9 + SignalR',
    description: 'Modern full-stack template with Next.js 15, .NET 9, SignalR real-time chat, PostgreSQL, and Tailwind CSS.',
    creator: '@vibecodementor',
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'VibeCodeMentor - AI-Powered Full-Stack Starter',
    description: 'Production-ready starter for building AI-powered applications with Next.js, .NET 9, and real-time features',
    url: 'https://vibecodementor.net',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://vibecodementor.net/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    },
    author: {
      '@type': 'Organization',
      name: 'VibeCodeMentor',
      url: 'https://vibecodementor.se'
    }
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>
          {children}
        </Providers>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
      </body>
    </html>
  );
}
