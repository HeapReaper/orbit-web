"use client";

import InfoTooltip from "@/app/(dashboard)/dashboard/components/ui/InfoToolTip";

export default function Page() {
  return (
    <section className="relative bg-[#181b25] p-6 rounded-lg max-w-3xl mx-auto mt-6">
      <h1 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
        Server Stats
        <InfoTooltip text="Displays live server statistics in channels" />
      </h1>

      <div className="bg-[#1f2333] border border-[#2a2f45] rounded-lg p-4 text-gray-300">
        <p className="text-base">
          This module doesn’t require any dashboard configuration.
        </p>

        <p className="mt-3 text-sm text-gray-400">
          You can set up Server Stats directly in Discord using the command:
        </p>

        <div className="mt-3 inline-block bg-black/40 px-3 py-1 rounded text-[var(--primary-color)] font-mono text-sm">
          /serverstats setup
        </div>

        <p className="mt-3 text-sm text-gray-400">
          The bot will guide you through creating and managing the statistic
          channels.
        </p>
      </div>
    </section>
  );
}
