"use client";

import { useEffect, useRef, useState } from "react";
import SaveButton from "@/app/(dashboard)/dashboard/components/buttons/Save";
import { useNotification } from "@/app/context/NotificationContext";
import { useGuild } from "@/app/context/GuildContext";
import PageLoader from "@/app/(dashboard)/dashboard/components/PageLoader";
import { addDashboardLog } from "@/app/lib/addDashboardLog";
import InfoTooltip from "@/app/(dashboard)/dashboard/components/ui/InfoToolTip";
import ChannelSelect from "@/app/(dashboard)/dashboard/components/inputs/ChannelSelect";
import SelectInput from "@/app/(dashboard)/dashboard/components/inputs/Select";

import { previewQotd } from "./actions";

interface QotdSettings {
  channel: string;
  time: string;
  scheduleType: "daily" | "weekly" | "biweekly" | "monthly";
  days: string[];
  monthlyDate?: number;
  enabled: boolean;
  aiPrompt: string;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const defaultSettings: QotdSettings = {
  channel: "",
  time: "",
  scheduleType: "daily",
  days: [],
  monthlyDate: undefined,
  enabled: true,
  aiPrompt: "",
};

export default function Page() {
  const [loading, setLoading] = useState(false);
  const { selectedGuild } = useGuild();
  const { notify } = useNotification();

  const [settings, setSettings] = useState<QotdSettings>(defaultSettings);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewResult, setPreviewResult] = useState<{ question?: string; error?: string } | null>(null);

  useEffect(() => {
    document.title = "QOTD settings";
    if (!selectedGuild) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/qotd?guildId=${selectedGuild}`);
        const data = await res.json();

        if (data.guildId) {
          setSettings({
            channel: data.channel ?? "",
            time: data.time ?? "",
            scheduleType: data.scheduleType ?? "daily",
            days: data.days ?? [],
            monthlyDate: data.monthlyDate ?? undefined,
            enabled: data.enabled ?? true,
            aiPrompt: data.aiPrompt ?? "",
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [selectedGuild]);

  const update = (field: keyof QotdSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const triggerAutoSave = () => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => void handleSave(true), 1500);
  };

  const handlePreview = async () => {
    setIsPreviewing(true);
    setPreviewResult(null);
    const result = await previewQotd(settings.aiPrompt);
    setPreviewResult(result);
    setIsPreviewing(false);
  };

  const handleSave = async (auto = false) => {
    if (!selectedGuild) return;
    setIsSaving(true);
    try {
      await fetch("/api/qotd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guildId: selectedGuild, ...settings }),
      });

      void addDashboardLog(selectedGuild, "INFO", "Updated the QOTD module");
      notify("Saved!", "", "success");
    } catch (err) {
      if (!auto) notify("Error", `${err}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!selectedGuild) return;
    triggerAutoSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, selectedGuild]);

  return (
    <section className="relative bg-[#181b25] p-6 rounded-lg max-w-3xl mx-auto mt-6">
      {loading && <PageLoader />}

      {/* Header */}
      <h1 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
        QOTD
        <InfoTooltip text="Automatically send an AI-generated question of the day to a channel on a schedule." />
      </h1>

      {/* Settings block */}
      <div className="mb-6 border border-gray-700 rounded p-4 bg-[#1f2330]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-400 font-medium">Settings</span>
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-sm select-none">Enabled</span>
            <button
              type="button"
              onClick={() => update("enabled", !settings.enabled)}
              className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors duration-200 ${
                settings.enabled ? "bg-[var(--primary-color)]" : "bg-gray-700"
              }`}
            >
              <span
                className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform duration-200 ${
                  settings.enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Channel + schedule type */}
        <div className="flex gap-4">
          <div className="flex-1">
            <ChannelSelect
              label="Channel"
              value={settings.channel}
              onChange={(v) => update("channel", v)}
            />
          </div>
          <div className="flex-1">
            <SelectInput
              label="Schedule type"
              value={settings.scheduleType}
              onChange={(v) => update("scheduleType", v)}
              options={[
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
                { value: "biweekly", label: "Every 2 weeks" },
                { value: "monthly", label: "Monthly" },
              ]}
            />
          </div>
        </div>

        {/* Time + monthly date */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-gray-400 mb-1">Time</label>
            <input
              type="time"
              value={settings.time}
              onChange={(e) => update("time", e.target.value)}
              className="w-full bg-[#0f1117] border border-gray-700 rounded p-2 text-white"
            />
          </div>
          {settings.scheduleType === "monthly" && (
            <div className="flex-1">
              <label className="block text-gray-400 mb-1">Day of the month</label>
              <input
                type="number"
                min={1}
                max={31}
                value={settings.monthlyDate ?? ""}
                onChange={(e) =>
                  update("monthlyDate", parseInt(e.target.value))
                }
                className="w-full bg-[#0f1117] border border-gray-700 rounded p-2 text-white"
              />
            </div>
          )}
        </div>

        {/* Days checkboxes */}
        {["daily", "weekly", "biweekly"].includes(settings.scheduleType) && (
          <div className="mt-3">
            <label className="block text-gray-400 mb-1">Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <label
                  key={day}
                  className={`cursor-pointer px-2 py-1 rounded border text-sm ${
                    settings.days.includes(day)
                      ? "bg-[var(--primary-color)] border-[var(--primary-color)] text-white"
                      : "bg-[#0f1117] border-gray-700 text-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={settings.days.includes(day)}
                    onChange={(e) => {
                      const newDays = e.target.checked
                        ? [...settings.days, day]
                        : settings.days.filter((d) => d !== day);
                      update("days", newDays);
                    }}
                    className="hidden"
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Prompt block */}
      <div className="mb-6 border border-gray-700 rounded p-4 bg-[#1f2330]">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-purple-400 text-lg">✨</span>
          <span className="text-gray-400 font-medium">AI Prompt</span>
          <InfoTooltip text="The bot uses this prompt every time to generate a new question. This way the AI creates a unique QOTD each time." />
        </div>

        <textarea
          value={settings.aiPrompt}
          onChange={(e) => update("aiPrompt", e.target.value)}
          rows={4}
          placeholder="What prompt should the AI use to generate questions? e.g. 'Generate a fun, thought-provoking question of the day for a gaming community.'"
          className="w-full bg-[#0f1117] border border-gray-700 rounded p-3 text-white placeholder-gray-600 resize-none focus:outline-none focus:border-gray-500 text-sm leading-relaxed"
        />

        <div className="flex items-center justify-between mt-3">
          <p className="text-gray-600 text-xs">
            The bot calls the AI with this prompt at the scheduled time and sends the generated question to the selected channel.
          </p>
          <button
            type="button"
            onClick={handlePreview}
            disabled={isPreviewing || !settings.aiPrompt.trim()}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-purple-700 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm transition-colors"
          >
            <span>✨</span>
            {isPreviewing ? "Genereren..." : "Preview"}
          </button>
        </div>

        {previewResult && (
          <div
            className={`mt-3 rounded p-3 text-sm ${
              previewResult.error
                ? "bg-red-900/30 border border-red-700 text-red-300"
                : "bg-purple-900/20 border border-purple-700 text-white"
            }`}
          >
            {previewResult.error ? (
              <span>{previewResult.error}</span>
            ) : (
              <>
                <span className="text-purple-400 text-xs font-medium block mb-1">Preview vraag:</span>
                <span>{previewResult.question}</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="text-right text-gray-400 text-sm mt-3">
        {isSaving ? "Saving..." : "Auto saved!"}
      </div>

      <SaveButton onClick={handleSave} />
    </section>
  );
}
