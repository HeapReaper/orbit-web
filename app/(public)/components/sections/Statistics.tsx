"use client";

import React, { useEffect, useState } from "react";

export default function StatisticsSection() {
  const [totalServers, setTotalServers] = useState<number | null>(null);
  const [premiumServers, setPremiumServers] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [activeModules, setActiveModules] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();

        setTotalServers(data.totalGuilds);
        setPremiumServers(data.premiumGuilds);
        setTotalUsers(data.totalUsers);
        setActiveModules(data.enabledModules);
      } catch (err) {
        console.error(err);
      }
    };

    void fetchData();
  }, []);

  return (
    <section className="px-6 md:px-20 py-16">
      <h2 className="text-3xl font-bold text-white mb-12 text-center">
        Statistics
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="bg-[#14171f] p-6 rounded-lg text-center hover:shadow-lg hover:border-blue-600 border border-gray-900 transition">
          <h3 className="text-4xl font-bold text-[var(--primary-color)]">{totalServers ?? "-"}</h3>
          <p className="text-gray-400 mt-2">Total Servers</p>
        </div>

        <div className="bg-[#14171f] p-6 rounded-lg text-center hover:shadow-lg hover:border-blue-600 border border-gray-900 transition">
          <h3 className="text-4xl font-bold text-[var(--primary-color)]">{premiumServers ?? "-"}</h3>
          <p className="text-gray-400 mt-2">Premium Guilds</p>
        </div>

        <div className="bg-[#14171f] p-6 rounded-lg text-center hover:shadow-lg hover:border-blue-600 border border-gray-900 transition">
          <h3 className="text-4xl font-bold text-[var(--primary-color)]">{totalUsers ?? "-"}</h3>
          <p className="text-gray-400 mt-2">Users</p>
        </div>

        <div className="bg-[#14171f] p-6 rounded-lg text-center hover:shadow-lg hover:border-blue-600 border border-gray-900 transition">
          <h3 className="text-4xl font-bold text-[var(--primary-color)]">{activeModules ?? "-"}</h3>
          <p className="text-gray-400 mt-2">Active Modules</p>
        </div>
      </div>
    </section>
  );
}