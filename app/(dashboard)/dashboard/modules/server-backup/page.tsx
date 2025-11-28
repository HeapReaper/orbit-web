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
import SelectInput from "@/app/(dashboard)/dashboard/components/inputs/Select";
import TimeInput from "@/app/(dashboard)/dashboard/components/inputs/Time";
import { Download, Undo, Trash } from "lucide-react";

export default function ServerBackupPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [channel, setChannel] = useState("");
  const [backupContent, setBackupContent] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<string>("weekly");
  const [time, setTime] = useState<string>("00:00");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const { selectedGuild } = useGuild();
  const { notify } = useNotification();

  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.title = "Server Backup";
    if (!selectedGuild) return;

    setEnabled(false);

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/server-backup?guildId=${selectedGuild}`, { cache: "no-store" });
        const data = await res.json();

        if (!data || data.error) {
          setEnabled(false);
          return;
        }

        setEnabled(data.enabled ?? false);
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
      const resp = await fetch("/api/server-backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guildId: selectedGuild,
          enabled: enabled,
        }),
      });

      if (!resp.ok) {
        if (!auto) notify("Oops", "Could not save settings", "error");
      } else {
        void addDashboardLog(selectedGuild, "INFO", "Updated Server Backup settings");
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

      <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
        Server backup
        <InfoTooltip text="Automatically backup your server at regular intervals." />
      </h1>

      <p className="text-sm text-gray-500 mb-4 mt-1">
        Free members can store up to 3 weeks of backups,
        while Premium members enjoy 1.5 months of backup history.
      </p>

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
        label="Notifications channel"
        value={channel}
        onChange={setChannel}
      />

      <SelectInput
        label="Backup frequency"
        value={frequency}
        onChange={setFrequency}
        options={[
          { label: "Daily", value: "daily" },
          { label: "Weekly", value: "weekly" },
          { label: "Monthly", value: "monthly" },
          { label: "Manual", value: "manual" },
        ]}
      />

      <TimeInput
        label="Backup time"
        value={time}
        onChange={setTime}
      />

      <CheckList
        label="Backup content"
        items={[
          { id: "roles", name: "Roles"},
          { id: "channels", name: "Channels"},
          { id: "emojis", name: "Emojis"},
          { id: "stickers", name: "Stickers"},
          { id: "server_settings", name: "Server Settings"},
        ]}
        selectedIds={backupContent}
        onToggle={(id) => {
          setBackupContent((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
          );
        }}
      />

      <div className="mt-6">
        <label className="block text-gray-400 mb-2">Backups</label>

        <div className="overflow-x-auto rounded-lg border border-gray-700 bg-[#1f2330] max-h-64 overflow-y-auto">
          <table className="w-full text-left text-gray-300">
            <thead className="bg-[#14171f] text-gray-400 sticky top-0">
              <tr>
                <th className="px-4 py-2">Backup Time</th>
                <th className="px-4 py-2">Download</th>
                <th className="px-4 py-2">Restore</th>
                <th className="px-4 py-2">Delete</th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-t border-gray-700">
                <td className="px-4 py-2">27-11-2025 12:00</td>
                <td className="px-4 py-2">
                  <button className="text-blue-400 hover:underline">
                    <Download />
                  </button>
                </td>
                <td className="px-4 py-2">
                  <button className="text-green-400 hover:underline">
                    <Undo />
                  </button>
                </td>
                <td className="px-4 py-2">
                  <button className="text-red-400 hover:underline">
                    <Trash />
                  </button>
                </td>
              </tr>

              {/* Empty state */}
              {/*<tr>*/}
              {/*  <td colSpan={4} className="px-4 py-2 text-center text-gray-500">*/}
              {/*    No backups*/}
              {/*  </td>*/}
              {/*</tr>*/}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-right text-gray-400 text-sm mt-3">
        {isSaving ? "Saving..." : "Auto saved!"}
      </div>

      <SaveButton onClick={() => handleSave(false)} />
    </section>
  );
}