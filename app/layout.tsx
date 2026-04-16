import "./globals.css";
import Script from "next/script";
import React from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
    <head>
      <link rel="icon" href="/favicon.ico" />
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#4f46e5" />
      <link rel="apple-touch-icon" href="/icons/icon-192.png" />

      {/* Privacy-friendly analytics by Plausible */}
      <Script
        async
        src="https://analytics.klikbit.nl/js/pa-eim-WFQi-lpQwlIO4Er-w.js"
        strategy="afterInteractive"
      />
      <Script id="plausible-init" strategy="afterInteractive">
        {`
            window.plausible = window.plausible || function(){(plausible.q = plausible.q || []).push(arguments)};
            plausible.init = plausible.init || function(i){plausible.o = i || {}};
            plausible.init();
          `}
      </Script>
    </head>
    <body className="bg-[#0d0f13] text-gray-200">
      {children}
    </body>
    </html>
  );
}
