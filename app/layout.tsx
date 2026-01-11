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
    </head>
    <body className="bg-[#0d0f13] text-gray-200">
    {/* Plausible analytics */}
    <Script
      defer
      data-domain="botinorbit.com"
      src="https://analytics.heapreaper.nl/js/script.outbound-links.js"
    />
    <Script id="plausible-init">
      {`
        window.plausible = window.plausible || function() {
          (window.plausible.q = window.plausible.q || []).push(arguments)
        }
      `}
    </Script>

    {/* Chatwoot SDK */}
    <Script id="chatwoot-sdk" strategy="afterInteractive">
      {`
        (function(d, t) {
          var BASE_URL = "https://tickets.klikbit.nl";
          var g = d.createElement(t), s = d.getElementsByTagName(t)[0];
          g.src = BASE_URL + "/packs/js/sdk.js";
          g.async = true;
          s.parentNode.insertBefore(g, s);
          g.onload = function() {
            window.chatwootSDK.run({
              websiteToken: '44WFMu1dJ4oRHR7d1H7Vr9qc',
              baseUrl: BASE_URL
            });
          };
        })(document, "script");
      `}
    </Script>

    {children}
    </body>
    </html>
  );
}
