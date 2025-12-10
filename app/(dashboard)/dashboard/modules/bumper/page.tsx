"use client";

import { useEffect, useState, useRef } from "react";
import SaveButton from "@/app/(dashboard)/dashboard/components/buttons/Save";
import { useNotification } from "@/app/context/NotificationContext";
import NumberInput from "@/app/(dashboard)/dashboard/components/inputs/Number";
import { useGuild } from "@/app/context/GuildContext";
import MarkdownEditor from "@/app/(dashboard)/dashboard/components/MarkdownEditor";
import MessagePreview from "@/app/(dashboard)/dashboard/components/previews/Message";
import PageLoader from "@/app/(dashboard)/dashboard/components/PageLoader";
import cleanMessage from "@/app/lib/cleanMessage";
import { addDashboardLog } from "@/app/lib/addDashboardLog";
import InfoTooltip from "@/app/(dashboard)/dashboard/components/ui/InfoToolTip";
import ChannelSelect from "@/app/(dashboard)/dashboard/components/inputs/ChannelSelect";
import InlineCode from "@/app/(dashboard)/dashboard/components/ui/InlineCode";
import RolesInput from "@/app/(dashboard)/dashboard/components/inputs/Role";
import ToggleSwitch from "@/app/(dashboard)/dashboard/components/inputs/Switch";
import SelectInput from "@/app/(dashboard)/dashboard/components/inputs/Select";
import EmbedBuilder from "@/app/(dashboard)/dashboard/components/EmbedEditor";
import EmbedPreview from "@/app/(dashboard)/dashboard/components/previews/Embed";
import {EmbedData} from "@/app/types/embed";

export default function BumpReminderPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [enabled, setEnabled] = useState(false);

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

  const [intervalHours, setIntervalHours] = useState<number>(2);
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [xpBoost, setXpBoost] = useState<number>(0);
  const [rewardRole, setRewardRole] = useState<string | null>(null);
  const [boostLeaderboard, setBoostLeaderboard] = useState<boolean>(false);
  const [leaderboardAutoUpdates, setLeaderboardAutoUpdates] = useState<boolean>(false);
  const [leaderboardChannel, setLeaderboardChannel] = useState<string>("");
  const [autoLeaderboardInterval, setAutoLeaderboardInterval] = useState<string>("");

  const { selectedGuild, channels, roles } = useGuild();
  const { notify } = useNotification();
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.title = "Bumper settings";
    if (!selectedGuild) return;

    const fetchGuildData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/bumper?guildId=${selectedGuild}`);
        const data = await res.json();

        setMessageType(data.messageType);
        setEmbed(data.embed);
        setMessage(data.message ?? "");

        setIntervalHours(data.interval ?? 2);
        setSelectedChannel(data.channel ?? "");
        setXpBoost(data.xpBoost ?? 0);
        setRewardRole(data.rewardRole ?? "");
        setBoostLeaderboard(data.boostLeaderboard ?? false);
        setLeaderboardAutoUpdates(data.leaderboardAutoUpdates ?? false);
        setLeaderboardChannel(data.leaderboardChannel ?? "");
        setAutoLeaderboardInterval(data.autoLeaderboardInterval ?? "");
        setEnabled(data.enabled ?? false);
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
      const resp = await fetch("/api/bumper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guildId: selectedGuild,
          channel: selectedChannel,
          message: cleanMessage(message),
          messageType,
          embed,
          interval: 2,
          xpBoost,
          rewardRole,
          boostLeaderboard,
          leaderboardAutoUpdates,
          leaderboardChannel,
          autoLeaderboardInterval,
          enabled: enabled ? 1 : 0,
        }),
      });

      if (!resp.ok) {
        if (!auto) notify("Oeps", "Could not save settings", "error");
      } else {
        void addDashboardLog(selectedGuild, "INFO", "Updated the bump reminder settings");
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
  }, [message, intervalHours, enabled, selectedChannel, messageType, embed]);

  return (
    <section className="relative bg-[#181b25] p-6 rounded-lg max-w-3xl mx-auto mt-6">
      {loading && <PageLoader/>}

      <h1 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
        Bumper
        <InfoTooltip text="Receive reminders when it’s time to bump your server and reward members who bump"/>
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

      <h2 className="text-xl font-semibold text-white mt-8">Reminders</h2>
      <div className="h-px w-full bg-white/10 my-3 mt-2"></div>

      <div className="mb-6">
        <label className="block text-gray-400 mb-2">Bump Message</label>

        <SelectInput
          label="Message type"
          value={messageType}
          onChange={setMessageType}
          options={[
            { value: "text", label: "Text"},
            { value: "embed", label: "Embed"}
          ]}
          />

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
              message={message.replace("{xpBoost}", xpBoost.toString())}
              channels={Object.fromEntries(channels.map(channel => [channel.id, channel.name]))}
            />
          </>
        ) : (
          <>
            <EmbedBuilder value={embed} onChange={setEmbed} />
            <EmbedPreview embed={embed} />
          </>
        )}
      </div>

      <ChannelSelect
        label="Select channel for the bump reminder notification"
        value={selectedChannel ?? ""}
        onChange={(value) => setSelectedChannel(value)}
      />

      <h2 className="text-xl font-semibold text-white mt-8">Rewards</h2>
      <div className="h-px w-full bg-white/10 my-3 mt-2"></div>

      <NumberInput
        tooltip="Xp will be added on each bump. For this Leveling needs to be enabled."
        label="Leveling XP boost"
        value={xpBoost}
        onChange={setXpBoost}
      />

      <RolesInput
        toolTip="This reward role will be active for 24 hours since the last bump"
        label="Reward role"
        roles={roles}
        selectedRoles={rewardRole ? [rewardRole] : []}
        onToggle={(roleId) => {
          (rewardRole === roleId) ? setRewardRole(null) : setRewardRole(roleId);
        }}
      />

      <ToggleSwitch
        label="Enable boost leaderboard"
        enabled={boostLeaderboard}
        onChange={() => setBoostLeaderboard(!boostLeaderboard)}
      />

      <div className="relative">
        <ToggleSwitch
          label="Enable automatic leaderboard updates"
          enabled={leaderboardAutoUpdates}
          onChange={() => setLeaderboardAutoUpdates(!leaderboardAutoUpdates)}
        />
      </div>

      {leaderboardAutoUpdates && (
        <>
          <ChannelSelect
            label="Channel to send the automatic leaderboard"
            value={leaderboardChannel}
            onChange={setLeaderboardChannel}
          />

          <SelectInput
            label="When to send the automatic leaderboard"
            value={autoLeaderboardInterval}
            onChange={(v) => setAutoLeaderboardInterval(v as string)}
            options={[
              { value: "each_monday", label: "Each Monday" },
              { value: "each_wednesday", label: "Each Wednesday" },
              { value: "each_sunday", label: "Each Sunday" },
              { value: "first_day_month", label: "First day of each month" },
              { value: "last_day_month", label: "Last day of each month" },
            ]}
          />
        </>
      )}

      <div className="text-right text-gray-400 text-sm mt-3">
        {isSaving ? "Saving..." : "Auto saved!"}
      </div>

      <SaveButton onClick={() => handleSave(false)}/>
    </section>
  );
}