"use client";

import { useEffect, useState, useRef } from "react";
import SaveButton from "@/app/(dashboard)/dashboard/components/buttons/Save";
import { useNotification } from "@/app/context/NotificationContext";
import { useGuild } from "@/app/context/GuildContext";
import PageLoader from "@/app/(dashboard)/dashboard/components/PageLoader";
import { addDashboardLog } from "@/app/lib/addDashboardLog";
import InfoTooltip from "@/app/(dashboard)/dashboard/components/ui/InfoToolTip";
import ChannelSelect from "@/app/(dashboard)/dashboard/components/inputs/ChannelSelect";
import CheckList from "@/app/(dashboard)/dashboard/components/inputs/CheckList";

export default function ModLinkSettings() {
  const [loading, setLoading] = useState<boolean>(false);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [channel, setChannel] = useState<string>("");
  const [syncedGuilds, setSyncedGuilds] = useState<string[]>([]);
  const [actionsToSync, setActionsToSync] = useState<string[]>([]);

  const [isSaving, setIsSaving] = useState<boolean>(false);

  const { selectedGuild, guilds } = useGuild();

  const { notify } = useNotification();
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.title = "ModLink Settings";
    if (!selectedGuild) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/mod-link?guildId=${selectedGuild}`);
        const data = await res.json();

        setChannel(data.channel ?? "");
        setSyncedGuilds(data.syncedGuilds ?? []);
        setActionsToSync(data.actionsToSync ?? []);
        setEnabled(data.enabled ?? false);
      } catch (err) {
        console.error(err);
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

  const handleSave = async (auto = false) => {
    if (!selectedGuild) return;
    setIsSaving(true);

    try {
      const resp = await fetch("/api/mod-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guildId: selectedGuild,
          channel,
          syncedGuilds,
          actionsToSync,
          enabled: enabled,
        }),
      });

      if (!resp.ok) {
        if (!auto) notify("Oops", "Could not save settings", "error");
      } else {
        void addDashboardLog(selectedGuild, "INFO", "Updated Mod Link settings");
        if (!auto) notify("Saved", "", "success");
      }
    } catch (error) {
      if (!auto) notify("Error", `${error}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!selectedGuild) return;
    triggerAutoSave();
  }, [enabled]);

  return (
    <section className="relative bg-[#181b25] p-6 rounded-lg max-w-3xl mx-auto mt-6">
      {loading && <PageLoader />}

      <h1 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
        Mod Link
        <InfoTooltip
          text="Sync moderation actions like Ban, Kick and Mute across multiple servers"
        />
      </h1>

      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400">Enable</span>
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

      <ChannelSelect
        label="Notification channel"
        tooltip="If you want the notification in another server, you can change your selected server from the menu bar"
        value={channel ?? ""}
        onChange={(value) => setChannel(value)}
      />

      <CheckList
        label="Servers to sync"
        items={guilds}
        selectedIds={syncedGuilds}
        onToggle={(id) =>
          setSyncedGuilds((prev) =>
            prev.includes(id)
              ? prev.filter((g) => g !== id) // Remove guild ID if already selected
              : [...prev, id] // Add guild ID if not selected
          )
        }
      />

      <CheckList
        label="Actions to sync"
        items={[
          { id: "ban", name: "Ban"},
          { id: "kick", name: "Kick"},
          { id: "Mute", name: "Mute"},
        ]}
        selectedIds={actionsToSync}
        onToggle={(id) =>
          setActionsToSync((prev) =>
            prev.includes(id)
              ? prev.filter((a) => a !== id)
              : [...prev, id]
          )
        }
      />

      <div className="text-right text-gray-400 text-sm mt-3">
        {isSaving ? "Saving..." : "Auto saved!"}
      </div>

      <SaveButton onClick={() => handleSave(false)} />
    </section>
  );
}