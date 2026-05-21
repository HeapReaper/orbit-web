"use client";

import { useEffect, useState, useRef } from "react";
import SaveButton from "@/app/(dashboard)/dashboard/components/buttons/Save";
import { useNotification } from "@/app/context/NotificationContext";
import PageLoader from "@/app/(dashboard)/dashboard/components/PageLoader";
import { useGuild } from "@/app/context/GuildContext";
import { addDashboardLog } from "@/app/lib/addDashboardLog";
import InfoTooltip from "@/app/(dashboard)/dashboard/components/ui/InfoToolTip";
import DeleteButton from "@/app/(dashboard)/dashboard/components/buttons/Delete";
import ChannelSelect from "@/app/(dashboard)/dashboard/components/inputs/ChannelSelect";

type YoutubeChannel = { youtubeChannel: string; discordChannel: string };

export default function Page() {
  const [loading, setLoading] = useState<boolean>(false);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [channels, setChannels] = useState<YoutubeChannel[]>([]);
  const [newYoutubeChannel, setNewYoutubeChannel] = useState("");
  const [newDiscordChannel, setNewDiscordChannel] = useState("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const { selectedGuild } = useGuild();
  const { notify } = useNotification();
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.title = "YouTube Watcher Settings";
    if (!selectedGuild) return;

    const fetchGuildData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/youtube-watcher?guildId=${selectedGuild}`,
        );
        const data = await res.json();
        setEnabled(data.enabled ?? false);
        setChannels(data.channels ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    void fetchGuildData();
  }, [selectedGuild]);

  const triggerAutoSave = () => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      void handleSave(true);
    }, 1500);
  };

  const handleSave = async (auto = false) => {
    if (!selectedGuild) return;
    setIsSaving(true);

    try {
      const resp = await fetch("/api/youtube-watcher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guildId: selectedGuild,
          enabled,
          channels,
        }),
      });

      if (!resp.ok) {
        if (!auto) notify("Could not save", "", "error");
      } else {
        void addDashboardLog(
          selectedGuild,
          "INFO",
          "Updated YouTube Watcher settings",
        );
        if (!auto) notify("Saved!", "", "success");
      }
    } catch (error) {
      if (!auto) notify("Error", String(error), "error");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!selectedGuild) return;
    triggerAutoSave();
  }, [enabled, channels]);

  const addChannel = () => {
    const trimmed = newYoutubeChannel.trim();
    if (!trimmed) return;
    if (channels.some((c) => c.youtubeChannel === trimmed)) {
      notify("Channel already added", "", "error");
      return;
    }
    setChannels((prev) => [
      ...prev,
      { youtubeChannel: trimmed, discordChannel: newDiscordChannel },
    ]);
    setNewYoutubeChannel("");
    setNewDiscordChannel("");
  };

  const removeChannel = (youtubeChannel: string) => {
    setChannels((prev) => prev.filter((c) => c.youtubeChannel !== youtubeChannel));
  };

  const updateDiscordChannel = (youtubeChannel: string, discordChannel: string) => {
    setChannels((prev) =>
      prev.map((c) =>
        c.youtubeChannel === youtubeChannel ? { ...c, discordChannel } : c,
      ),
    );
  };

  return (
    <section className="relative bg-[#181b25] p-6 rounded-lg max-w-3xl mx-auto mt-6">
      {loading && <PageLoader />}

      <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
        YouTube Watcher
        <InfoTooltip text="Get notified when a YouTuber posts a new video!" />
      </h1>

      <p className="text-xs text-gray-400 mb-4">
        Add YouTube channels below. The bot will check for new videos and post
        them in your configured Discord channel.
      </p>

      <div className="flex items-center justify-between mb-6">
        <span className="text-gray-400">Enable YouTube Watcher</span>
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

      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">
          Add YouTube Channel
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newYoutubeChannel}
            onChange={(e) => setNewYoutubeChannel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addChannel()}
            placeholder="Channel URL or handle like @FliteTest"
            className="flex-1 bg-[#0f1117] border border-gray-700 rounded p-2 text-white"
          />
          <button
            type="button"
            onClick={addChannel}
            className="px-4 py-2 bg-[var(--primary-color)] text-white rounded hover:opacity-90 transition-opacity"
          >
            Add
          </button>
        </div>
        <ChannelSelect
          label="Channel for this feed"
          value={newDiscordChannel}
          onChange={setNewDiscordChannel}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">
          YouTube Channels
        </label>
        <div className="flex flex-col gap-3 max-h-96 overflow-y-auto border border-gray-700 p-2 rounded bg-[#1f2330]">
          {channels.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">
              No YouTube channels added yet.
            </p>
          )}
          {channels.map((entry) => (
            <div
              key={entry.youtubeChannel}
              className="flex flex-col gap-1 bg-[#0f1117] border border-gray-700 rounded p-2"
            >
              <div className="flex items-center gap-2">
                <span className="flex-1 text-gray-300 text-sm truncate">
                  {entry.youtubeChannel}
                </span>
                <DeleteButton onClick={() => removeChannel(entry.youtubeChannel)} />
              </div>
              <ChannelSelect
                label=""
                value={entry.discordChannel}
                onChange={(val) => updateDiscordChannel(entry.youtubeChannel, val)}
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