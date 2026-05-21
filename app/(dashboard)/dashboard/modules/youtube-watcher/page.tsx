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

const emptyEntry = (): YoutubeChannel => ({
  youtubeChannel: "",
  discordChannel: "",
});

export default function Page() {
  const [loading, setLoading] = useState<boolean>(false);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [channels, setChannels] = useState<YoutubeChannel[]>([emptyEntry()]);
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
        setChannels(data.channels?.length ? data.channels : [emptyEntry()]);
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
          channels: channels.filter((c) => c.youtubeChannel.trim() !== ""),
        }),
      });

      if (!resp.ok) {
        notify("Could not save", "", "error");
      }

      void addDashboardLog(
        selectedGuild,
        "INFO",
        "Updated YouTube Watcher settings",
      );

      if (!auto) notify("Saved", "", "success");
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

  const handleYoutubeChannelChange = (index: number, value: string) => {
    setChannels((prev) =>
      prev.map((c, i) => (i === index ? { ...c, youtubeChannel: value } : c)),
    );
  };

  const handleDiscordChannelChange = (index: number, discordChannel: string) => {
    setChannels((prev) =>
      prev.map((c, i) => (i === index ? { ...c, discordChannel } : c)),
    );
  };

  const addChannel = () => setChannels((prev) => [...prev, emptyEntry()]);
  const removeChannel = (index: number) =>
    setChannels((prev) => prev.filter((_, i) => i !== index));

  return (
    <section className="relative bg-[#181b25] p-6 rounded-lg max-w-3xl mx-auto mt-6">
      {loading && <PageLoader />}

      <h1 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
        YouTube Watcher
        <InfoTooltip text="Get notified when a Youtuber posts a new video!" />
      </h1>

      <div className="flex items-center justify-between mb-6">
        <span className="text-gray-400">Enable module</span>
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
          YouTube Channels
        </label>
        <div className="flex flex-col gap-3 max-h-[32rem] overflow-y-auto border border-gray-700 p-2 rounded bg-[#1f2330]">
          {channels.map((entry, index) => (
            <div
              key={index}
              className="flex flex-col gap-1 bg-[#0f1117] border border-gray-700 rounded p-2"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={entry.youtubeChannel}
                  onChange={(e) =>
                    handleYoutubeChannelChange(index, e.target.value)
                  }
                  placeholder="Youtube channel URL or handle like @FliteTest"
                  className="flex-1 bg-[#0f1117] border border-gray-700 rounded p-2 text-white text-sm"
                />
                {channels.length > 1 && (
                  <DeleteButton onClick={() => removeChannel(index)} />
                )}
              </div>
              <ChannelSelect
                label=""
                value={entry.discordChannel}
                onChange={(val) => handleDiscordChannelChange(index, val)}
                className="relative"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addChannel}
          className="mt-2 bg-[var(--primary-color)] hover:brightness-90 text-white px-3 py-1 rounded"
        >
          Add Channel
        </button>
      </div>

      <div className="text-right text-gray-400 text-sm mt-3">
        {isSaving ? "Saving..." : "Auto saved!"}
      </div>

      <SaveButton onClick={() => handleSave(false)} />
    </section>
  );
}