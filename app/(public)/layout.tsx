import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Script from "next/script";
import Navbar from "@/app/(public)/components/Nav";
import Link from "next/link";
import Provider from "@/app/providers/SessionProvider";
import React from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orbit – Powerful Discord Bot with Dashboard",
  description: "Manage and grow your Discord server effortlessly with Orbit: Automated moderation, engagement tools, analytics and more with a sleek web dashboard.",
  keywords: ["Discord", "Dashboard", "Server management", "Orbit", "Automation", "Bots", "Analytics", "Tickets", "Notifications"],
  authors: [{ name: "HeapReaper", url: "https://heapreaper.nl" }],
  creator: "HeapReaper",
  publisher: "HeapReaper",
  openGraph: {
    type: "website",
    title: "Orbit – Powerful Discord Bot with Dashboard",
    description: "Manage and grow your Discord server effortlessly with Orbit: Automated moderation, engagement tools, analytics and more with a sleek web dashboard.",
    url: "https://botinorbit.com",
    siteName: "Orbit",
    images: [
      {
        url: "https://botinorbit.com/banner-v2.png",
        width: 1200,
        height: 630,
        alt: "Orbit Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Orbit – Powerful Discord Bot with Dashboard",
    description: "Manage and grow your Discord server effortlessly with Orbit: Automated moderation, engagement tools, analytics and more with a sleek web dashboard.",
    creator: "@HeapReaper",
    images: ["https://botinorbit.com/banner-v2.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#0d0f13] text-gray-200">
      {/* Plausible analytics */}
      <Script
        defer
        data-domain="botinorbit.com"
        src="https://analytics.heapreaper.nl/js/script.outbound-links.js"
      />
      <Script id="plausible-init">{`
        window.plausible = window.plausible || function() { 
          (window.plausible.q = window.plausible.q || []).push(arguments) 
        }
      `}
      </Script>

      <Provider>
        <Navbar />

        <div>
          {children}
        </div>
      </Provider>

      <footer className="bg-[#14171f] text-gray-500 text-center py-6 mt-auto">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            <span className="underline decoration-purple-700 hover:text-white">
            <a href="https://klikbit.nl" target="_blank" rel="noopener noreferrer">
              KlikBit
            </a>
            </span>
            <span className="block md:inline md:ml-2 text-xs text-gray-600">
              — A product by <a href="https://klikbit.nl" target="_blank" className="underline decoration-purple-700">KlikBit</a>
            </span>
          </p>
          <div className="flex gap-4 text-sm">
            <Link href="/terms" className="hover:text-white transition">
              Terms of Service
            </Link>
            <span>|</span>
            <Link href="/privacy" className="hover:text-white transition">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
