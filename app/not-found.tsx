"use client";

import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <main className="flex flex-col min-h-screen bg-[#0d0f13] text-white items-center justify-center px-6 py-20">
      <div className="flex flex-col items-center text-center space-y-6 max-w-xl">

        <Image
          src="/logo.png"
          alt="Orbit Logo"
          width={150}
          height={150}
          className="animate-spin-slow opacity-80"
        />

        <h1 className="text-5xl md:text-6xl font-bold text-white">
          404 – Lost in Space
        </h1>

        <p className="text-gray-400 text-lg md:text-xl">
          Looks like this page drifted too far from the Orbit.
          It may have been moved, deleted, or never existed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Link
            href="/"
            className="px-6 py-3 bg-[var(--primary-color)] hover:bg-[var(--hover-color)] text-white font-semibold rounded-lg transition"
          >
            Return Home
          </Link>

          <Link
            href="/dashboard"
            className="px-6 py-3 bg-[#14171f] hover:border-blue-600 border border-gray-900 text-white font-semibold rounded-lg transition"
          >
            Go to Dashboard
          </Link>
        </div>

        <p className="text-gray-600 text-sm mt-4">
          If you think this is a mistake, let us know in our Discord.
        </p>

        <a
          href="https://discord.gg/HyGNHZCeTQ"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-5 py-2 bg-[var(--primary-color)] hover:bg-[var(--hover-color)] text-white font-medium rounded-lg transition mt-2"
        >
          Join our Discord
        </a>
      </div>
    </main>
  );
}