"use client";

import { useEffect, useState } from "react";
import MarkdownEditor from "@/app/(dashboard)/dashboard/components/MarkdownEditor";
import { useSession } from "next-auth/react";
import MessagePreview from "@/app/(dashboard)/dashboard/components/previews/Message";
import { Send } from "lucide-react";
import GenericTable from "@/app/(dashboard)/dashboard/components/tables/Table";

type GuildRow = {
  id: string;
  name: string;
  isPremium: boolean;
  trialEndsAt?: string | null;
  createdAt?: string | null;
};

export default function Page() {
  const session = useSession();
  const [guilds, setGuilds] = useState<GuildRow[]>([]);
  const [loadingGuilds, setLoadingGuilds] = useState(false);

  const [updateMessage, setUpdateMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuilds = async () => {
      setLoadingGuilds(true);
      try {
        const res = await fetch("/api/discord/guilds");
        const data = await res.json();

        if (data.guilds) {
          setGuilds(
            data.guilds.map((g: any) => ({
              id: g.id,
              name: g.name,
              isPremium: g.isPremium,
              trialEndsAt: g.trialEndsAt ?? null,
              createdAt: g.createdAt ?? null,
            })),
          );
        }
      } catch (err) {
        console.error("Failed to fetch guilds", err);
      } finally {
        setLoadingGuilds(false);
      }
    };

    void fetchGuilds();
  }, []);

  if (!session) return;
  if (session.data?.user?.id !== "632677231113666601") return;

  const handleSend = async () => {
    if (!updateMessage.trim()) {
      setError("Message cannot be empty");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updateMessage }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess("Message sent successfully!");
        setUpdateMessage("");
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      setError("Failed to send message");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const headers = ["Name", "Premium", "Trial Ends", "Created At"];
  const rows = guilds.map((g) => [
    g.name,
    g.isPremium ? "Yes" : "No",
    g.trialEndsAt ? new Date(g.trialEndsAt).toLocaleDateString() : "–",
    g.createdAt ? new Date(g.createdAt).toLocaleDateString() : "–",
  ]);

  return (
    <section className="relative bg-[#181b25] p-6 rounded-lg max-w-3xl mx-auto mt-6">
      <h1 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
        Owner page
      </h1>

      {loadingGuilds ? (
        <p className="text-gray-400">Loading guilds...</p>
      ) : (
        <GenericTable
          title="Guilds"
          headers={headers}
          rows={rows}
          maxHeight="64"
        />
      )}

      <div className="mb-6 mt-6">
        <label className="block text-gray-400 mb-2">Send update message</label>
        <div className="rounded-lg border border-gray-700 bg-[#1f2330]">
          <MarkdownEditor
            value={updateMessage}
            onChange={setUpdateMessage}
            placeholder=""
          />
        </div>
      </div>

      <MessagePreview username="Orbit" message={updateMessage} />

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && <p className="text-green-500 mt-2">{success}</p>}

      <button
        onClick={handleSend}
        disabled={loading}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary-color)]
          hover:bg-[var(--hover-color)] text-white font-semibold transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        <Send size={16} />
        {loading ? "Sending..." : "Send"}
      </button>
    </section>
  );
}
