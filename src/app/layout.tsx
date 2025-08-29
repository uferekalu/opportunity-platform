import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from './providers';
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/ui/sections/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Opportunity Platform - Your Gateway to Success",
  description: "Discover exclusive opportunities, join our waitlist, and unlock your potential with our comprehensive platform.",
  keywords: "opportunities, jobs, careers, waitlist, platform",
  authors: [{ name: "Opportunity Platform" }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${inter.variable} min-h-screen flex flex-col font-sans antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}
      >
        <Providers>
          <Header />
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
