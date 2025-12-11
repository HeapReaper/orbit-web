"use client";

import { useEffect, useState, useRef } from "react";
import SaveButton from "@/app/(dashboard)/dashboard/components/buttons/Save";
import { useNotification } from "@/app/context/NotificationContext";
import PageLoader from "@/app/(dashboard)/dashboard/components/PageLoader";
import { useGuild } from "@/app/context/GuildContext";
import { addDashboardLog } from "@/app/lib/addDashboardLog";
import InfoTooltip from "@/app/(dashboard)/dashboard/components/ui/InfoToolTip";
import MarkdownEditor from "@/app/(dashboard)/dashboard/components/MarkdownEditor";
import MessagePreview from "@/app/(dashboard)/dashboard/components/previews/Message";
import InlineCode from "@/app/(dashboard)/dashboard/components/ui/InlineCode";
import ChannelSelect from "@/app/(dashboard)/dashboard/components/inputs/ChannelSelect";
import ToggleSwitch from "@/app/(dashboard)/dashboard/components/inputs/Switch";
import EmbedBuilder from "@/app/(dashboard)/dashboard/components/EmbedEditor";
import EmbedPreview from "@/app/(dashboard)/dashboard/components/previews/Embed";
import {EmbedData} from "@/app/types/embed";
import SelectInput from "@/app/(dashboard)/dashboard/components/inputs/Select";

export default function Page() {
  const [loading, setLoading] = useState<boolean>(false);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [maxMessages, setMaxMessages] = useState<number>(1);
  const [autoReply, setAutoReply] = useState<string>("");
  const [messageType, setMessageType] = useState<string>("text");
  const [embed, setEmbed] = useState<EmbedData>({
    color: "#5865F2",
    title: "",
    titleUrl: "",
    description: "",
    author: { name: "", icon: "" },
    thumbnail: "",
    fields: [],
  });
  const [autoEmoji, setAutoEmoji] = useState<string>("");
  const [autoDelete, setAutoDelete] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const { selectedGuild } = useGuild();
  const { notify } = useNotification();

  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.title = "Introduction Settings";
    if (!selectedGuild) return;

    const fetchGuildData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/introduction?guildId=${selectedGuild}`);
        const data = await res.json();

        setEnabled(data.enabled ?? false);
        setSelectedChannel(data.channel ?? "");
        setMaxMessages(data.maxMessages ?? 1);
        setMessageType(data.messageType ?? "text");
        setAutoReply(data.autoReply ?? "");
        setEmbed(data.embed);
        setAutoEmoji(data.autoEmoji ?? "");
        setAutoDelete(data.autoDelete ?? false);
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
      const resp = await fetch("/api/introduction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guildId: selectedGuild,
          channel: selectedChannel,
          enabled,
          maxMessages,
          autoReply,
          messageType,
          embed,
          autoEmoji,
          autoDelete,
        }),
      });

      if (!resp.ok) {
        notify("Could not save", "", "error");
      }

      void addDashboardLog(selectedGuild, "INFO", "Updated Introduction settings");

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
  }, [enabled, selectedChannel, maxMessages, autoReply, autoEmoji, autoDelete]);

  return (
    <section className="relative bg-[#181b25] p-6 rounded-lg max-w-3xl mx-auto mt-6">
      {loading && <PageLoader />}

      <h1 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
        Introduction
        <InfoTooltip text="Configure automatic introductions: set a channel, max messages per user, optional auto-replies, and emoji reactions." />
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

      <ChannelSelect
        label="Select channel for the Introduction"
        value={selectedChannel ?? ""}
        onChange={(value) => setSelectedChannel(value)}
      />

      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">Max messages per user</label>
        <input
          type="number"
          min={1}
          value={maxMessages}
          onChange={(e) => setMaxMessages(Number(e.target.value))}
          className="w-full bg-[#0f1117] border border-gray-700 rounded p-2 text-white"
        />
      </div>

      <ToggleSwitch
        label="Automatic delete introduction when a user leaves the server"
        enabled={autoDelete}
        onChange={(value) => setAutoDelete(value)}
      />

      <SelectInput
        label="Message type"
        value={messageType}
        onChange={setMessageType}
        options={[
          { value: "text", label: "Text"},
          { value: "embed", label: "Embed"}
        ]}
      />

      <div className="mb-6">
        <label className="block text-gray-400 mb-2">Auto reply (optional)</label>
        {messageType === "text" ? (
          <>
            <div className="rounded-lg border border-gray-700 bg-[#1f2330]">
              <MarkdownEditor
                value={autoReply}
                onChange={setAutoReply}
                placeholder=""
              />
            </div>
            <p className="text-sm text-gray-500 mb-4 mt-1">
              You can use <InlineCode text="{user}" /> to mention the user.
            </p>

            <MessagePreview
              username="Orbit"
              message={autoReply.replace("{user}", "@HeapReaper")}
            />
          </>
        ) : (
          <>
            <EmbedBuilder value={embed} onChange={setEmbed} />
            <EmbedPreview embed={embed} />
          </>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">Auto emoji reaction (optional)</label>
        <input
          type="text"
          value={autoEmoji}
          onChange={(e) => setAutoEmoji(e.target.value)}
          placeholder="🎉"
          className="w-full bg-[#0f1117] border border-gray-700 rounded p-2 text-white"
        />
      </div>

      <div className="text-right text-gray-400 text-sm mt-3">
        {isSaving ? "Saving..." : "Auto saved!"}
      </div>

      <SaveButton onClick={() => handleSave(false)} />
    </section>
  );
}
