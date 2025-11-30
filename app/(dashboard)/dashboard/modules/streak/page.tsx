"use client";

import { useEffect, useState, useRef } from "react";
import SaveButton from "@/app/(dashboard)/dashboard/components/buttons/Save";
import { useNotification } from "@/app/context/NotificationContext";
import { useGuild } from "@/app/context/GuildContext";
import PageLoader from "@/app/(dashboard)/dashboard/components/PageLoader";
import { addDashboardLog } from "@/app/lib/addDashboardLog";
import InfoTooltip from "@/app/(dashboard)/dashboard/components/ui/InfoToolTip";
import ChannelSelect from "@/app/(dashboard)/dashboard/components/inputs/ChannelSelect";
import RolesInput from "@/app/(dashboard)/dashboard/components/inputs/Role";

export default function StreakSettingsPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [channel, setChannel] = useState<string>("");
  const [role, setRole] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const { selectedGuild, roles } = useGuild();
  const { notify } = useNotification();
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!selectedGuild) return;

    setChannel("");
    setEnabled(false);

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/streak?guildId=${selectedGuild}`, { cache: "no-store" });
        const data = await res.json();

        if (!data || data.error) {
          setChannel("");
          setEnabled(false);
          return;
        }

        setChannel(data.channel ?? "");
        setChannel(data.channel ?? "");
        setRole(data.role ?? "");
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
      const resp = await fetch("/api/streak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guildId: selectedGuild,
          channel,
          role,
          enabled,
        }),
      });

      if (!resp.ok) {
        if (!auto) notify("Oops", "Could not save settings", "error");
      } else {
        void addDashboardLog(selectedGuild, "INFO", "Updated streak settings");
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
  }, [enabled, channel]);

  return (
    <section className="relative bg-[#181b25] p-6 rounded-lg max-w-3xl mx-auto mt-6">
      {loading && <PageLoader />}

      <h1 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
        Streak
        <InfoTooltip text="For each day users are active, their streak will go + 1 day. You can select here the channel where notification will display and the reward role." />
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
        value={channel ?? ""}
        onChange={(value) => setChannel(value)}
      />

      <RolesInput
        label="Reward role"
        roles={roles}
        selectedRoles={role ? [role] : []}
        onToggle={(roleId) => setRole(roleId)}
      />
      <div className="text-right text-gray-400 text-sm mt-3">
        {isSaving ? "Saving..." : "Auto saved!"}
      </div>

      <SaveButton onClick={() => handleSave(false)} />
    </section>
  );
}