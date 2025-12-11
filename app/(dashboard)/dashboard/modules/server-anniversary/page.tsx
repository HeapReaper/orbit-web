"use client";

import { useEffect, useState, useRef } from "react";
import SaveButton from "@/app/(dashboard)/dashboard/components/buttons/Save";
import { useNotification } from "@/app/context/NotificationContext";
import InlineCode from "@/app/(dashboard)/dashboard/components/ui/InlineCode";
import { useGuild } from "@/app/context/GuildContext";
import MarkdownEditor from "@/app/(dashboard)/dashboard/components/MarkdownEditor";
import MessagePreview from "@/app/(dashboard)/dashboard/components/previews/Message";
import PageLoader from "@/app/(dashboard)/dashboard/components/PageLoader";
import { addDashboardLog } from "@/app/lib/addDashboardLog";
import InfoTooltip from "@/app/(dashboard)/dashboard/components/ui/InfoToolTip";
import ChannelSelect from "@/app/(dashboard)/dashboard/components/inputs/ChannelSelect";
import TimeInput from "@/app/(dashboard)/dashboard/components/inputs/Time";
import { EmbedData } from "@/app/types/embed";
import SelectInput from "@/app/(dashboard)/dashboard/components/inputs/Select";
import EmbedBuilder from "@/app/(dashboard)/dashboard/components/EmbedEditor";
import EmbedPreview from "@/app/(dashboard)/dashboard/components/previews/Embed";

export default function ServerAnniversaryPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [enabled, setEnabled] = useState<boolean>(false);

  const [messageType, setMessageType] = useState<string>("text");
  const [message, setMessage] = useState<string>("");
  const [embed, setEmbed] = useState<EmbedData>({
    color: "#5865F2",
    title: "",
    titleUrl: "",
    description: "",
    author: { name: "", icon: "" },
    thumbnail: "",
    fields: [],
  });

  const [channel, setChannel] = useState<string>("");
  const [randomize, setRandomize] = useState<boolean>(false);
  const [time, setTime] = useState<string>("09:00");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const { selectedGuild, channels } = useGuild();
  const { notify } = useNotification();
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.title = "Server Anniversary Settings";
    if (!selectedGuild) return;

    const fetchGuildData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/server-anniversary?guildId=${selectedGuild}`);
        const data = await res.json();
        setMessageType(data.messageType ?? "text");
        setMessage(data.message ?? "");
        setEmbed(data.embed ?? {
          color: "#5865F2",
          title: "",
          titleUrl: "",
          description: "",
          author: { name: "", icon: "" },
          thumbnail: "",
          fields: [],
        });
        setChannel(data.channel ?? "");
        setTime(data.time ?? "");
        setEnabled(data.enabled ?? false);
        setRandomize(data.randomize ?? false);
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
      const resp = await fetch("/api/server-anniversary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guildId: selectedGuild,
          messageType,
          message,
          embed,
          channel: channel || null,
          time,
          enabled,
          randomize,
        }),
      });

      if (!resp.ok) {
        if (!auto) notify("Oeps", "Could not save settings", "error");
      } else {
        void addDashboardLog(selectedGuild, "INFO", "Updated welcome message settings");
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
  }, [messageType, message, embed, channel, enabled, randomize]);

  return (
    <section className="relative bg-[#181b25] p-6 rounded-lg max-w-3xl mx-auto mt-6">
      {loading && <PageLoader />}

      <h1 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
        Server Anniversary
        <InfoTooltip text="Send a notification to your server each year on its anniversary" />
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

      <TimeInput
        label="Notification time"
        value={time}
        onChange={setTime}
      />

      <div className="mb-6">
        <div className="mb-6">
          <SelectInput
            label="Message type"
            value={messageType}
            onChange={setMessageType}
            options={[
              { value: "text", label: "Text"},
              { value: "embed", label: "Embed"}
            ]}
          />

          <div className="mb-2">
            <label className="block text-gray-400 mb-1">Message</label>
            <p className="text-sm text-gray-500 mb-2 mt-1">
              You can use <InlineCode text="{guildAge}" /> to get the current server age in years (like 2).
            </p>
          </div>

          {messageType === "text" ? (
            <>
              <div className="rounded-lg border border-gray-700 bg-[#1f2330]">
                <MarkdownEditor
                  value={message}
                  onChange={setMessage}
                  placeholder=""
                />
              </div>

              <MessagePreview
                username="Orbit"
                message={message.replace("{guildAge}", "2")}
                channels={Object.fromEntries(channels.map(channel => [channel.id, channel.name]))}
              />
            </>
          ) : (
            <>
              <EmbedBuilder value={embed} onChange={setEmbed} />
              <EmbedPreview embed={embed} replaceKey="{guildAge}" replaceValue="2" />
            </>
          )}
        </div>
      </div>

      <div className="text-right text-gray-400 text-sm mt-3">
        {isSaving ? "Saving..." : "Auto saved!"}
      </div>

      <SaveButton onClick={() => handleSave(false)} />
    </section>
  );
}
