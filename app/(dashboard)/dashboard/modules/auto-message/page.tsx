"use client";

import { useEffect, useRef, useState } from "react";
import SaveButton from "@/app/(dashboard)/dashboard/components/buttons/Save";
import DeleteButton from "@/app/(dashboard)/dashboard/components/buttons/Delete";
import { useNotification } from "@/app/context/NotificationContext";
import { useGuild } from "@/app/context/GuildContext";
import MarkdownEditor from "@/app/(dashboard)/dashboard/components/MarkdownEditor";
import MessagePreview from "@/app/(dashboard)/dashboard/components/previews/Message";
import PageLoader from "@/app/(dashboard)/dashboard/components/PageLoader";
import cleanMessage from "@/app/lib/cleanMessage";
import { addDashboardLog } from "@/app/lib/addDashboardLog";
import InfoTooltip from "@/app/(dashboard)/dashboard/components/ui/InfoToolTip";
import ChannelSelect from "@/app/(dashboard)/dashboard/components/inputs/ChannelSelect";
import EmbedBuilder from "@/app/(dashboard)/dashboard/components/EmbedEditor";
import EmbedPreview from "@/app/(dashboard)/dashboard/components/previews/Embed";
import { EmbedData } from "@/app/types/embed";
import SelectInput from "@/app/(dashboard)/dashboard/components/inputs/Select";

interface AutoMessage {
  id: string;
  messageType: "text" | "embed";
  message: string;
  channel: string;
  time: string;
  days: string[];
  scheduleType: "daily" | "weekly" | "biweekly" | "monthly";
  monthlyDate?: number;
  enabled: boolean;
}

export default function Page() {
  const [loading, setLoading] = useState<boolean>(false);
  const { selectedGuild, channels } = useGuild();
  const { notify } = useNotification();

  const [autoMessages, setAutoMessages] = useState<AutoMessage[]>([]);
  const [embeds, setEmbeds] = useState<EmbedData[]>([]);

  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    document.title = "Auto message settings";
    if (!selectedGuild) return;

    const fetchAutoMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/auto-message?guildId=${selectedGuild}`);
        const data = await res.json();
        setLoading(false);

        setAutoMessages(
          data.map((msg: any) => ({
            id: msg.id,
            messageType: msg.messageType || "text",
            message: msg.message,
            channel: msg.channel,
            time: msg.time,
            days: msg.days ?? [],
            scheduleType: msg.scheduleType || "daily",
            monthlyDate: msg.monthlyDate,
            enabled: msg.enabled
          }))
        );

        setEmbeds(
          data.map((msg: any) =>
              msg.embed ?? {
                color: "#5865F2",
                title: "",
                titleUrl: "",
                description: "",
                author: { name: "", icon: "" },
                thumbnail: "",
                fields: [],
              }
          )
        );

      } catch (err) {
        console.error(err);
      }
    };

    void fetchAutoMessages();
  }, [selectedGuild]);

  const addAutoMessage = () => {
    setAutoMessages(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        messageType: "text",
        message: "",
        channel: "",
        time: "",
        days: [],
        scheduleType: "daily",
        monthlyDate: undefined,
        enabled: true
      },
    ]);

    setEmbeds(prev => [
      ...prev,
      {
        color: "#5865F2",
        title: "",
        titleUrl: "",
        description: "",
        author: { name: "", icon: "" },
        thumbnail: "",
        fields: [],
      }
    ]);
  };

  const updateAutoMessage = (index: number, field: keyof AutoMessage, value: any) => {
    setAutoMessages(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const updateEmbed = (index: number, value: EmbedData) => {
    setEmbeds(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const removeAutoMessage = (index: number) => {
    setAutoMessages(prev => prev.filter((_, i) => i !== index));
    setEmbeds(prev => prev.filter((_, i) => i !== index));
  };

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
      const cleanedAutoMessages = autoMessages.map((msg, i) => ({
        ...msg,
        message: cleanMessage(msg.message),
        embed: embeds[i]
      }));

      const resp = await fetch(`/api/auto-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guildId: selectedGuild,
          autoMessages: cleanedAutoMessages
        }),
      });

      if (!resp.ok) throw new Error(resp.statusText);

      void addDashboardLog(selectedGuild, "INFO", "Updated the auto messages module");

      if (!auto) notify("Saved!", "", "success");
    } catch (err) {
      if (!auto) notify("Error", `${err}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!selectedGuild) return;
    triggerAutoSave();
  }, [autoMessages, embeds, selectedGuild]);

  return (
    <section className="relative bg-[#181b25] p-6 rounded-lg max-w-3xl mx-auto mt-6">
      {loading && <PageLoader />}

      <h1 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
        Auto Messages
        <InfoTooltip text="Create automated scheduled messages for your server." />
      </h1>

      {autoMessages.map((msg, i) => (
        <div key={msg.id} className="mb-6 border border-gray-700 rounded p-4 bg-[#1f2330]">
          <span className="text-gray-400">Auto Message {i + 1}</span>

          <SelectInput
            label="Message type"
            value={msg.messageType}
            onChange={(v) => updateAutoMessage(i, "messageType", v as "text" | "embed")}
            options={[
              { value: "text", label: "Text" },
              { value: "embed", label: "Embed" }
            ]}
          />

          <div className="mb-3 mt-3">
            <SelectInput
              label="Schedule type"
              value={msg.scheduleType}
              onChange={(v) => updateAutoMessage(i, "scheduleType", v)}
              options={[
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
                { value: "biweekly", label: "Every 2 Weeks" },
                { value: "monthly", label: "Monthly" },
              ]}
            />
          </div>

          {["daily", "weekly", "biweekly"].includes(msg.scheduleType) && (
            <div className="mb-3 mt-3">
              <label className="block text-gray-400 mb-1">Days</label>
              <div className="flex flex-wrap gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                  <label
                    key={day}
                    className={`cursor-pointer px-2 py-1 rounded border text-sm ${
                      msg.days?.includes(day)
                        ? "bg-[var(--primary-color)] border-[var(--primary-color)] text-white"
                        : "bg-[#0f1117] border-gray-700 text-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={msg.days?.includes(day)}
                      onChange={(e) => {
                        const newDays = e.target.checked
                          ? [...(msg.days || []), day]
                          : (msg.days || []).filter(d => d !== day);
                        updateAutoMessage(i, "days", newDays);
                      }}
                      className="hidden"
                    />
                    {day}
                  </label>
                ))}
              </div>
            </div>
          )}

          {msg.scheduleType === "monthly" && (
            <div className="mb-3">
              <label className="block text-gray-400 mb-1">Day of the month</label>
              <input
                type="number"
                min={1}
                max={31}
                value={msg.monthlyDate ?? ""}
                onChange={(e) => updateAutoMessage(i, "monthlyDate", parseInt(e.target.value))}
                className="w-full bg-[#0f1117] border border-gray-700 rounded p-2 text-white"
              />
            </div>
          )}

          <div className="flex justify-between mb-2">
            {autoMessages.length > 1 && (
              <DeleteButton onClick={() => removeAutoMessage(i)} />
            )}
          </div>

          {msg.messageType === "text" ? (
            <>
              <MarkdownEditor
                value={msg.message}
                onChange={(v) => updateAutoMessage(i, "message", v)}
              />
              <MessagePreview
                username="Orbit"
                message={msg.message}
                channels={Object.fromEntries(channels.map(c => [c.id, c.name]))}
              />
            </>
          ) : (
            <>
              <EmbedBuilder
                value={embeds[i]}
                onChange={(v) => updateEmbed(i, v)}
              />
              <EmbedPreview embed={embeds[i]} />
            </>
          )}

          <ChannelSelect
            label="Channel"
            value={msg.channel ?? ""}
            onChange={(value) => updateAutoMessage(i, "channel", value)}
          />

          <div className="mb-2">
            <label className="block text-gray-400 mb-1">Time</label>
            <input
              type="time"
              value={msg.time}
              onChange={(e) => updateAutoMessage(i, "time", e.target.value)}
              className="w-full bg-[#0f1117] border border-gray-700 rounded p-2 text-white"
            />
          </div>

          <div className="flex items-center">
            <span className="text-gray-400 mr-2">Enabled</span>
            <button
              type="button"
              onClick={() => updateAutoMessage(i, "enabled", !msg.enabled)}
              className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors duration-200 ${
                msg.enabled ? "bg-[var(--primary-color)]" : "bg-gray-700"
              }`}
            >
              <span
                className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform duration-200 ${
                  msg.enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={addAutoMessage}
        className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg"
      >
        Add auto message
      </button>

      <div className="text-right text-gray-400 text-sm mt-3">
        {isSaving ? "Saving..." : "Auto saved!"}
      </div>

      <SaveButton onClick={handleSave} />
    </section>
  );
}