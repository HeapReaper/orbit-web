"use client";

import { useEffect, useState, useRef } from "react";
import SaveButton from "@/app/(dashboard)/dashboard/components/buttons/Save";
import { useNotification } from "@/app/context/NotificationContext";
import { useGuild } from "@/app/context/GuildContext";
import PageLoader from "@/app/(dashboard)/dashboard/components/PageLoader";
import { addDashboardLog } from "@/app/lib/addDashboardLog";
import InfoTooltip from "@/app/(dashboard)/dashboard/components/ui/InfoToolTip";
import ChannelSelect from "@/app/(dashboard)/dashboard/components/inputs/ChannelSelect";
import ToggleSwitch from "@/app/(dashboard)/dashboard/components/inputs/Switch";
import SelectInput from "@/app/(dashboard)/dashboard/components/inputs/Select";
import RolesInput from "@/app/(dashboard)/dashboard/components/inputs/Role";

export default function Page() {
  const [loading, setLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [enabled, setEnabled] = useState<boolean>(false);
  const [currency, setCurrency] = useState<string>("");

  const { selectedGuild, roles } = useGuild();
  const { notify } = useNotification();
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.title = "Donations settings";
    if (!selectedGuild) return;

    const fetchGuildData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/donations?guildId=${selectedGuild}`);
        const data = await res.json();

        setEnabled(data.enabled ?? false);
        setCurrency(data.currency ?? "");
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
      const resp = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guildId: selectedGuild,
          enabled,
          currency,
        }),
      });

      if (!resp.ok) {
        notify("Could not save", "", "error");
      }

      void addDashboardLog(selectedGuild, "INFO", "Updated donations settings");

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
  }, [enabled]);

  return (
    <section className="relative bg-[#181b25] p-6 rounded-lg max-w-3xl mx-auto mt-6">
      {loading && <PageLoader />}

      <h1 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
        Donations
        <InfoTooltip text="Configure the Donations module to your needs." />
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

      <SelectInput
        label="Select which currency to use"
        value={currency}
        onChange={setCurrency}
        options={[
          { label: "Euro (€)", value: "€" },
          { label: "US Dollar ($)", value: "$" },
        ]}
      />

      <div className="text-right text-gray-400 text-sm mt-3">
        {isSaving ? "Saving..." : "Auto saved!"}
      </div>

      <SaveButton onClick={() => handleSave(false)} />
    </section>
  );
}
