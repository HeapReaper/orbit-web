import React from "react";
import { getStatsFromDatabaseAndBot } from "@/app/lib/getStats";

export default async function StatisticsSection() {
  const botRes = await fetch(`${process.env.API_URL}/api/expose-guild-channels-and-roles`, { cache: "no-store" });
  const botData = await botRes.json();

  const data = await getStatsFromDatabaseAndBot(botData);

  return (
    <section className="px-6 md:px-20 py-16">
      <h2 className="text-3xl font-bold text-white mb-12 text-center">Statistics</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { value: data.totalGuilds, label: "Total Servers" },
          { value: data.premiumGuilds, label: "Premium Guilds" },
          { value: data.totalUsers, label: "Users" },
          { value: data.enabledModules, label: "Active Modules" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-[#14171f] p-6 rounded-lg text-center hover:shadow-lg hover:border-blue-600 border border-gray-900 transition">
            <h3 className="text-4xl font-bold text-[var(--primary-color)]">{stat.value}</h3>
            <p className="text-gray-400 mt-2">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}