"use client";

import { useEffect, useState, useRef } from "react";
import SaveButton from "@/app/(dashboard)/dashboard/components/buttons/Save";
import { useNotification } from "@/app/context/NotificationContext";
import PageLoader from "@/app/(dashboard)/dashboard/components/PageLoader";
import { useGuild } from "@/app/context/GuildContext";
import { addDashboardLog } from "@/app/lib/addDashboardLog";
import InfoTooltip from "@/app/(dashboard)/dashboard/components/ui/InfoToolTip";
import ChannelSelect from "@/app/(dashboard)/dashboard/components/inputs/ChannelSelect";
import XpRateChart from "@/app/(dashboard)/dashboard/components/charts/XpRate";
import NumberInput from "@/app/(dashboard)/dashboard/components/inputs/Number";
import SelectInput from "@/app/(dashboard)/dashboard/components/inputs/Select";
import ResetButon from "@/app/(dashboard)/dashboard/components/buttons/Reset";
import { Pickaxe } from "lucide-react";

export default function Page() {
  const [loading, setLoading] = useState<boolean>(false);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [levelRoles, setLevelRoles] = useState<string[]>([]);
  const [xpRate, setXpRate] = useState<number>(200);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [xpPerMessage, setXpPerMessage] = useState<number>(10);
  const [xpPerVoice, setXpPerVoice] = useState<number>(5);
  const [xpMessageGainSpeed, setXpMessageGainSpeed] = useState<string>("oneTimeAMinute");
  const [xpVoiceGainSpeed, setXpVoiceGainSpeed] = useState("everyMinute");
  const [curveExponent, setCurveExponent] = useState<number>(2.65);

  const { selectedGuild, roles: guildRoles } = useGuild();
  const [roles, setRoles] = useState(guildRoles || []);

  const { notify } = useNotification();
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  const DEFAULTS = {
    xpRate: 200,
    xpPerMessage: 10,
    xpPerVoice: 5,
    curveExponent: 2.65,
    xpMessageGainSpeed: "oneTimeAMinute",
    xpVoiceGainSpeed: "everyMinute",
    enabled: false,
    selectedChannel: "",
  };

  useEffect(() => {
    if (guildRoles) setRoles(guildRoles);
  }, [guildRoles]);

  const handleReset = () => {
    setXpRate(DEFAULTS.xpRate);
    setXpPerMessage(DEFAULTS.xpPerMessage);
    setXpPerVoice(DEFAULTS.xpPerVoice);
    setCurveExponent(DEFAULTS.curveExponent);
    setXpMessageGainSpeed(DEFAULTS.xpMessageGainSpeed);
    setXpVoiceGainSpeed(DEFAULTS.xpVoiceGainSpeed);
    setEnabled(DEFAULTS.enabled);
    setSelectedChannel(DEFAULTS.selectedChannel);

    notify("Settings reset to default", "", "info");
  };

  const handleGenerateRoles = async () => {
    if (!selectedGuild) return;

    const confirmed = confirm(
      "This will create 10 new roles (Level 1 → Level 10) and assign them for leveling. You can change the names later. Continue?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch("/api/generateLevelRoles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guildId: selectedGuild,
          count: 10,
        }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Invalid JSON response: ${text}`);
      }

      if (!res.ok) throw new Error(data.error || "Failed to generate roles");

      // Add generated role IDs to levelRoles
      const newRoleIds = data.roles.map((r: { id: string }) => r.id);
      setLevelRoles((prev) => [...prev, ...newRoleIds]);

      // Add generated role objects to local roles state
      setRoles((prevRoles) => [...prevRoles, ...data.roles]);

      notify("Level roles generated and selected successfully", "", "success");
    } catch (err) {
      notify("Error generating roles", String(err), "error");
    }
  };

  useEffect(() => {
    document.title = "Leveling Settings";
    if (!selectedGuild) return;

    const fetchGuildData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/leveling?guildId=${selectedGuild}`);
        const data = await res.json();
        setEnabled(data.enabled ?? false);
        setLevelRoles(data.levelRoles ?? []);
        setXpRate(data.xpRate ?? 1);
        setSelectedChannel(data.channel ?? "");
        setXpPerMessage(data.xpPerMessage ?? 10);
        setXpPerVoice(data.xpPerVoice ?? 5);
        setCurveExponent(data.curveExponent ?? 2.65);
        setXpMessageGainSpeed(data.xpMessageGainSpeed ?? "oneTimeAMinute");
        setXpVoiceGainSpeed(data.xpVoiceGainSpeed ?? "everyMinute");
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
      const resp = await fetch("/api/leveling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guildId: selectedGuild,
          channel: selectedChannel,
          enabled,
          levelRoles,
          xpRate,
          xpPerMessage,
          xpPerVoice,
          curveExponent,
          xpMessageGainSpeed,
          xpVoiceGainSpeed,
        }),
      });

      if (!resp.ok) {
        notify("Could not save", "", "error");
      }

      void addDashboardLog(selectedGuild, "INFO", "Updated Leveling settings");

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
  }, [enabled, selectedChannel, levelRoles, xpRate, xpPerMessage, xpPerVoice, xpRate, curveExponent, xpMessageGainSpeed, xpVoiceGainSpeed]);

  const toggleRole = (roleId: string) => {
    if (levelRoles.includes(roleId)) {
      setLevelRoles(levelRoles.filter((r) => r !== roleId));
    } else {
      setLevelRoles([...levelRoles, roleId]);
    }
  };

  return (
    <section className="relative bg-[#181b25] p-6 rounded-lg max-w-3xl mx-auto mt-6">
      {loading && <PageLoader />}

      <h1 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
        Leveling Settings
        <InfoTooltip
          text="With the default settings there are ~100,000 messages needed to reach level 10,
          which will get harder when you go higher in levels. That can be changed by changing the Curve Exponent.
          With voice you need in total 200,000 minutes to reach level 10 (without sending messages)."
        />
      </h1>

      <div className="flex items-center justify-between mb-4">
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

      <div className="grid md:grid-cols-2 gap-4">
        <ChannelSelect
          label="Select channel for Leveling notifications"
          value={selectedChannel ?? ""}
          onChange={(value) => setSelectedChannel(value)}
        />

        <NumberInput
          label="Message XP amount"
          value={xpPerMessage}
          onChange={setXpPerMessage}
          min={1}
          step={1}
          placeholder=""
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <NumberInput
          label="Voice XP amount"
          value={xpPerVoice}
          onChange={setXpPerVoice}
          min={1}
          step={1}
          placeholder=""
        />

        <NumberInput
          label="XP total"
          value={xpRate}
          onChange={setXpRate}
          min={0.1}
          step={0.1}
          placeholder="Speed of XP gain"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <NumberInput
          label="Curve exponent"
          value={curveExponent}
          onChange={setCurveExponent}
          min={1}
          step={1}
          placeholder=""
        />

        <SelectInput
          label="How fast users gain XP by sending messages"
          value={xpMessageGainSpeed}
          onChange={(value) => setXpMessageGainSpeed(value)}
          options={[
            { label: "Every message", value: "everyMessage" },
            { label: "One time a minute", value: "oneTimeAMinute" },
            { label: "One time every 2 minutes", value: "oneTimeEvery2Minutes" },
            { label: "One time every 3 minutes", value: "oneTimeEvery3Minutes" },
            { label: "One time every 4 minutes", value: "oneTimeEvery4Minutes" },
            { label: "One time every 5 minutes", value: "oneTimeEvery5Minutes" },
          ]}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <SelectInput
          label="How fast users gain XP by being in voice chat"
          value={xpVoiceGainSpeed}
          onChange={(value) => setXpVoiceGainSpeed(value)}
          options={[
            { label: "Every minute", value: "everyMinute" },
            { label: "Every 2 minutes", value: "every2Minutes" },
            { label: "Every 3 minutes", value: "every3Minutes" },
            { label: "Every 4 minutes", value: "every4Minutes" },
            { label: "Every 5 minutes", value: "every5Minutes" },
          ]}
        />
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-500 mt-1 mb-4">
          How fast users gain levels (defined by XP Rate)
        </p>
        <XpRateChart xpRate={xpRate} curveExponent={curveExponent} />
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">Level Roles (10 required)</label>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search roles..."
          className="w-full bg-[#0f1117] border border-gray-700 rounded p-2 mb-2 text-gray-200 placeholder-gray-500"
        />

        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto border border-gray-700 p-2 rounded bg-[#1f2330] custom-scrollbar">
          {roles
            ?.filter((role) => role.name.toLowerCase().includes(search.toLowerCase()))
            .map((role) => (
              <label
                key={role.id}
                className="flex items-center gap-2 text-white cursor-pointer hover:bg-[#2a2e3b] px-2 py-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={levelRoles.includes(role.id)}
                  onChange={() => toggleRole(role.id)}
                  className="w-4 h-4 accent-[var(--primary-color)]"
                />
                {role.name}
              </label>
            ))}
          {roles?.filter((role) => role.name.toLowerCase().includes(search.toLowerCase())).length === 0 && (
            <p className="text-gray-500 text-sm text-center py-2">No roles found.</p>
          )}
        </div>
      </div>

      <div className="text-right text-gray-400 text-sm mt-3">
        {isSaving ? "Saving..." : "Auto saved!"}
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={handleGenerateRoles}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary-color)] hover:bg-[var(--hover-color)]
          text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Pickaxe size={16} />
          Generate Level Roles
        </button>

        <ResetButon onClick={handleReset} />
        <SaveButton onClick={() => handleSave(false)} />
      </div>
    </section>
  );
}