import type { Metadata } from "next";
import { ServerType } from "@/app/types/server";

export const metadata: Metadata = {
  title: "Discord Server List| Orbit",
  description:
    "View all Discord servers where Orbit is installed. Check details, descriptions and join with the invite button.",
};

async function getServers(): Promise<ServerType[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/servers`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error("Failed to fetch servers");

    const data: ServerType[] = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default async function ServersPage() {
  const servers: ServerType[] = await getServers();

  return (
    <main className="p-6 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Discord Server List</h1>
      {servers.length === 0 ? (
        <p className="text-gray-400">No servers found.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {servers.map((server) => (
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
              <p className="text-gray-400 mb-2">
                {(server.description?.slice(0, 100) || "No description") + "..."}
              </p>
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
      )}
    </main>
  );
}