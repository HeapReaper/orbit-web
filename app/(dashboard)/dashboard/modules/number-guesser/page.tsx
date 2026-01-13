"use client";

import InfoTooltip from "@/app/(dashboard)/dashboard/components/ui/InfoToolTip";

export default function Page() {
  return (
    <section className="relative bg-[#181b25] p-6 rounded-lg max-w-3xl mx-auto mt-6">
      <h1 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
        Number Guesser
        <InfoTooltip text="Run a guessing contest to pick the right number." />
      </h1>

      <div className="bg-[#1f2333] border border-[#2a2f45] rounded-lg p-4 text-gray-300">
        <p className="text-base">
          This module doesn’t require any dashboard configuration.
        </p>
      </div>
    </section>
  );
}
