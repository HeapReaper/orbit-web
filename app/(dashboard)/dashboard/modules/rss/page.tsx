"use client";

import { useState, useEffect, useRef } from "react";
import SaveButton from "@/app/(dashboard)/dashboard/components/buttons/Save";
import { useNotification } from "@/app/context/NotificationContext";
import PageLoader from "@/app/(dashboard)/dashboard/components/PageLoader";
import InfoTooltip from "@/app/(dashboard)/dashboard/components/ui/InfoToolTip";
import DeleteButton from "@/app/(dashboard)/dashboard/components/buttons/Delete";
import { useGuild } from "@/app/context/GuildContext";
import { addDashboardLog } from "@/app/lib/addDashboardLog";
import ChannelSelect from "@/app/(dashboard)/dashboard/components/inputs/ChannelSelect";

type Feed = { url: string; channelId: string };

export default function RssPage() {
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [newChannelId, setNewChannelId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { selectedGuild } = useGuild();
  const { notify } = useNotification();
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.title = "RSS Settings";
    if (!selectedGuild) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/rss?guildId=${selectedGuild}`);
        if (res.ok) {
          const data = await res.json();
          setEnabled(data?.enabled ?? false);
          setFeeds(data?.feeds ?? []);
        } else {
          setFeeds([]);
        }
      } catch (err) {
        console.error("Failed to fetch RSS data:", err);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [selectedGuild]);

  const triggerAutoSave = () => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      void handleSave(true);
    }, 1500);
  };

  useEffect(() => {
    if (!selectedGuild) return;
    triggerAutoSave();
  }, [enabled, feeds]);

  const addFeed = () => {
    const trimmed = newUrl.trim();
    if (!trimmed) return;
    if (feeds.some((f) => f.url === trimmed)) {
      notify("URL already added", "", "error");
      return;
    }
    setFeeds((prev) => [...prev, { url: trimmed, channelId: newChannelId }]);
    setNewUrl("");
    setNewChannelId("");
  };

  const removeFeed = (url: string) => {
    setFeeds((prev) => prev.filter((f) => f.url !== url));
  };

  const updateFeedChannel = (url: string, channelId: string) => {
    setFeeds((prev) =>
      prev.map((f) => (f.url === url ? { ...f, channelId } : f))
    );
  };

  const handleSave = async (auto = false) => {
    if (!selectedGuild) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/rss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guildId: selectedGuild, enabled, feeds }),
      });

      if (!res.ok) {
        if (!auto) notify("Failed to save settings", "", "error");
      } else {
        void addDashboardLog(selectedGuild, "INFO", "Updated RSS settings");
        if (!auto) notify("Saved!", "", "success");
      }
    } catch (err) {
      if (!auto) notify("Error saving settings", String(err), "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="relative bg-[#181b25] p-6 rounded-lg max-w-3xl mx-auto mt-6">
      {loading && <PageLoader />}

      <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
        RSS
        <InfoTooltip text="Subscribe to RSS feeds and receive new articles automatically in your Discord server." />
      </h1>

      <p className="text-xs text-gray-400 mb-4">
        Add RSS feed URLs below. The bot will periodically check for new items
        and post them in your configured channel.
      </p>

      {/* Enable toggle */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-gray-400">Enable RSS</span>
        <button
          type="button"
          onClick={() => setEnabled(!enabled)}
          className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors duration-200 focus:outline-none ${
            enabled ? "bg-[var(--primary-color)]" : "bg-gray-700"
          }`}
        >
          <span
            className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform duration-200 ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Add feed */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">Add RSS Feed URL</label>
        <div className="flex gap-2 mb-2">
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addFeed()}
            placeholder="https://example.com/feed.xml"
            className="flex-1 bg-[#0f1117] border border-gray-700 rounded p-2 text-white"
          />
          <button
            type="button"
            onClick={addFeed}
            className="px-4 py-2 bg-[var(--primary-color)] text-white rounded hover:opacity-90 transition-opacity"
          >
            Add
          </button>
        </div>
        <ChannelSelect
          label="Channel for this feed"
          value={newChannelId}
          onChange={setNewChannelId}
        />
      </div>

      {/* Feed list */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">RSS Feeds</label>
        <div className="flex flex-col gap-3 max-h-96 overflow-y-auto border border-gray-700 p-2 rounded bg-[#1f2330]">
          {feeds.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">
              No RSS feeds added yet.
            </p>
          )}
          {feeds.map((feed) => (
            <div
              key={feed.url}
              className="flex flex-col gap-1 bg-[#0f1117] border border-gray-700 rounded p-2"
            >
              <div className="flex items-center gap-2">
                <span className="flex-1 text-gray-300 text-sm truncate">
                  {feed.url}
                </span>
                <DeleteButton onClick={() => removeFeed(feed.url)} />
              </div>
              <ChannelSelect
                label=""
                value={feed.channelId}
                onChange={(val) => updateFeedChannel(feed.url, val)}
                className="relative"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="text-right text-gray-400 text-sm mt-3">
        {isSaving ? "Saving..." : "Auto saved!"}
      </div>

      <SaveButton onClick={() => void handleSave(false)} />
    </section>
  );
}