import { Bot } from "lucide-react";
import InlineCode from "@/app/(dashboard)/dashboard/components/ui/InlineCode";

async function getBotInfo() {
  try {
    const res = await fetch("https://bot.botinorbit.com/api/bot-info", {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getRepoInfo() {
  try {
    const res = await fetch(
      "https://api.github.com/repos/HeapReaper/Orbit-bot/releases/latest",
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function BotInfo() {
  const data = await getBotInfo();
  const repoInfo = await getRepoInfo();

  return (
    <section className="bg-[#181b25] p-6 rounded-lg">
      <div className="flex items-center gap-2 mb-3 text-2xl">
        <Bot className="w-8 h-8 text-[var(--primary-color)]" />

        <h2 className="font-semibold">Bot info</h2>
      </div>

      {data ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <p>
            <span className="font-semibold text-white">Status: </span>{" "}
            <InlineCode text={data.status} />
          </p>
          <p>
            <span className="font-semibold text-white">Uptime: </span>{" "}
            <InlineCode text={data.uptime} />
          </p>
          <p>
            <span className="font-semibold text-white">Ping: </span>{" "}
            <InlineCode text={data.ping} />
            ms
          </p>
          <p>
            <span className="font-semibold text-white">Servers: </span>{" "}
            <InlineCode text={data.guilds} />
          </p>
          <p>
            <span className="font-semibold text-white">Users: </span>{" "}
            <InlineCode text={data.users} />
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Bot status unavailable.</p>
      )}
    </section>
  );
}
