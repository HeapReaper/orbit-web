"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="flex flex-col min-h-screen bg-[#0d0f13] text-white items-center justify-center px-6 py-20">
        <div className="flex flex-col items-center text-center space-y-6 max-w-xl">
          <img
            src="/logo.png"
            alt="Orbit Logo"
            className="w-32 h-32 animate-spin-slow opacity-80"
          />

          <h1 className="text-5xl md:text-6xl font-bold text-white">
            Oops! Something went wrong
          </h1>

          <p className="text-gray-400 text-lg md:text-xl">
            A critical error occurred while rendering this page. Our team has
            been notified. You can try again or return home.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              onClick={() => location.reload()}
              className="px-6 py-3 bg-[var(--primary-color)] hover:bg-[var(--hover-color)] text-white font-semibold rounded-lg transition"
            >
              Reload Page
            </button>

            <a
              href="/"
              className="px-6 py-3 bg-[#14171f] hover:border-blue-600 border border-gray-900 text-white font-semibold rounded-lg transition"
            >
              Go Home
            </a>
          </div>

          <p className="text-gray-600 text-sm mt-4">
            If this keeps happening, join our Discord for support.
          </p>

          <a
            href="https://discord.gg/HyGNHZCeTQ"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-5 py-2 bg-[var(--primary-color)] hover:bg-[var(--hover-color)] text-white font-medium rounded-lg transition mt-2"
          >
            Join Discord
          </a>

          <div className="mt-6 w-full">
            <NextError statusCode={0} />
          </div>
        </div>
      </body>
    </html>
  );
}
