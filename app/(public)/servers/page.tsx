"use client";

import { useEffect, useState } from "react";
import { ServerType } from "@/app/types/server";

export default function ServersPage() {
  const [servers, setServers] = useState<ServerType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const res = await fetch("/api/servers");
        if (!res.ok) throw new Error("Failed to fetch servers");
        const data = await res.json();

        setServers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    void fetchServers();
  }, []);

  if (loading) return <p className="text-white p-6">Loading Servers...</p>

  return (
    <main className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Your Discord Servers</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {servers.map((server: ServerType) => (
          <div
            key={server.id}
            className="bg-[#14171f] p-6 rounded-lg hover:shadow-lg border border-gray-900"
          >
            <div className="flex items-center gap-4 mb-4">
              {server.icon ? (
                <img
                  src={server.icon}
                  alt={server.name}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                  {server.name[0]}
                </div>
              )}
              <h2 className="font-semibold text-lg">{server.name}</h2>
              {server.premium && (
                <span className="ml-auto px-2 py-1 bg-yellow-500 text-black rounded-full text-sm font-medium">
                  Premium
                </span>
              )}
            </div>
            <p className="text-gray-400 mb-2">{server.description.slice(0, 100) || "No description"}...</p>
            <a
              href={server.inviteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 px-4 py-2 bg-[var(--primary-color)] rounded-lg font-semibold hover:bg-[var(--hover-color)]"
            >
              Invite Link
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}
