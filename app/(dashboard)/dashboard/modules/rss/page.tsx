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

export default function RssPage() {
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [urls, setUrls] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("");
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
          setSelectedChannel(data?.channelId ?? "");
          setUrls(data?.urls ?? []);
        } else {
          setUrls([]);
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
  }, [enabled, urls, selectedChannel]);

  const addUrl = () => {
    const trimmed = newUrl.trim();
    if (!trimmed) return;
    if (urls.includes(trimmed)) {
      notify("URL already added", "", "error");
      return;
    }
    setUrls((prev) => [...prev, trimmed]);
    setNewUrl("");
  };

  const removeUrl = (url: string) => {
    setUrls((prev) => prev.filter((u) => u !== url));
  };

  const handleSave = async (auto = false) => {
    if (!selectedGuild) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/rss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guildId: selectedGuild, enabled, channelId: selectedChannel, urls }),
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

      {/* Add URL input */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">Add RSS Feed URL</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addUrl()}
            placeholder="https://example.com/feed.xml"
            className="flex-1 bg-[#0f1117] border border-gray-700 rounded p-2 text-white"
          />
          <button
            type="button"
            onClick={addUrl}
            className="px-4 py-2 bg-[var(--primary-color)] text-white rounded hover:opacity-90 transition-opacity"
          >
            Add
          </button>
        </div>
      </div>

      {/* URL list */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">RSS Feeds</label>
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto border border-gray-700 p-2 rounded bg-[#1f2330]">
          {urls.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">
              No RSS feeds added yet.
            </p>
          )}
          {urls.map((url) => (
            <div key={url} className="flex items-center gap-2">
              <span className="flex-1 text-gray-300 bg-[#0f1117] border border-gray-700 px-3 py-2 rounded text-sm truncate">
                {url}
              </span>
              <DeleteButton onClick={() => removeUrl(url)} />
            </div>
          ))}
        </div>
      </div>

      <ChannelSelect
        label="Select channel for RSS posts"
        value={selectedChannel}
        onChange={(value) => setSelectedChannel(value)}
      />

      <div className="text-right text-gray-400 text-sm mt-3">
        {isSaving ? "Saving..." : "Auto saved!"}
      </div>

      <SaveButton onClick={() => void handleSave(false)} />
    </section>
  );
}