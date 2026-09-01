"use client";

import { useState, useEffect, useRef } from "react";
import SaveButton from "@/app/(dashboard)/dashboard/components/buttons/Save";
import { useNotification } from "@/app/context/NotificationContext";
import NumberInput from "@/app/(dashboard)/dashboard/components/inputs/Number";
import SelectInput from "@/app/(dashboard)/dashboard/components/inputs/Select";
import InlineCode from "@/app/(dashboard)/dashboard/components/ui/InlineCode";
import DeleteButton from "@/app/(dashboard)/dashboard/components/buttons/Delete";
import { addDashboardLog } from "@/app/lib/addDashboardLog";
import { useGuild } from "@/app/context/GuildContext";
import PageLoader from "@/app/(dashboard)/dashboard/components/PageLoader";
import InfoTooltip from "@/app/(dashboard)/dashboard/components/ui/InfoToolTip";
import ToggleSwitch from "@/app/(dashboard)/dashboard/components/inputs/Switch";
import ChannelSelect from "@/app/(dashboard)/dashboard/components/inputs/ChannelSelect";

export default function AntiBotPage() {
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [timeWindow, setTimeWindow] = useState(10);
  const [channelLimit, setChannelLimit] = useState(3);
  const [punishment, setPunishment] = useState("");
  const [forbiddenWords, setForbiddenWords] = useState<string[]>([""]);
  const [forbiddenUsernames, setForbiddenUsernames] = useState<string[]>([""]);
  const [forbiddenPatterns, setForbiddenPatterns] = useState<string[]>([""]);
  const [notificationChannel, setNotificationChannel] = useState("");
  const [jailRole, setJailRole] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [excludeAdmins, setExcludeAdmins] = useState(false);
  const [blockInvites, setBlockInvites] = useState(false);
  const [blockNSFWInvites, setBlockNSFWInvites] = useState(false);

  const [messageLimit, setMessageLimit] = useState(8);
  const [mentionLimit, setMentionLimit] = useState(5);
  const [minAccountAgeDays, setMinAccountAgeDays] = useState(7);
  const [raidThreshold, setRaidThreshold] = useState(5);
  const [newAccountAction, setNewAccountAction] = useState("none");
  const [blockZalgo, setBlockZalgo] = useState(true);
  const [blockDuplicates, setBlockDuplicates] = useState(true);
  const [deleteMessagesOnKick, setDeleteMessagesOnKick] = useState(false);
  const [deleteMessagesOnBan, setDeleteMessagesOnBan] = useState(false);
  const [deleteMessagesDays, setDeleteMessagesDays] = useState(1);
  const [csamProtection, setCsamProtection] = useState(true);

  const { selectedGuild, roles, channels } = useGuild();
  const { notify } = useNotification();
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.title = "Anti-Bot Settings";
    if (!selectedGuild) return;

    const fetchGuildData = async () => {
      setLoading(true);

      try {
        const res = await fetch(`/api/anti-bot?guildId=${selectedGuild}`);
        const data = await res.json();

        setEnabled(data?.enabled ?? false);
        setTimeWindow(data?.timeWindow ?? 10);
        setChannelLimit(data?.channelLimit ?? 3);
        setPunishment(data?.punishment ?? "");
        setForbiddenWords(
          data?.forbiddenWords?.length ? data.forbiddenWords : [""],
        );
        setForbiddenUsernames(
          data?.forbiddenUsernames?.length ? data.forbiddenUsernames : [""],
        );
        setForbiddenPatterns(
          data?.forbiddenPatterns?.length ? data.forbiddenPatterns : [""],
        );
        setNotificationChannel(data?.notificationChannel ?? "");
        setJailRole(data?.jailRole ?? "");
        setExcludeAdmins(data?.excludeAdmins ?? false);
        setBlockInvites(data?.blockInvites ?? false);
        setBlockNSFWInvites(data?.blockNSFWInvites ?? false);

        // New fields
        setMessageLimit(data?.messageLimit ?? 8);
        setMentionLimit(data?.mentionLimit ?? 5);
        setMinAccountAgeDays(data?.minAccountAgeDays ?? 7);
        setRaidThreshold(data?.raidThreshold ?? 5);
        setNewAccountAction(data?.newAccountAction ?? "none");
        setBlockZalgo(data?.blockZalgo ?? true);
        setBlockDuplicates(data?.blockDuplicates ?? true);
        setDeleteMessagesOnKick(data?.deleteMessagesOnKick ?? false);
        setDeleteMessagesOnBan(data?.deleteMessagesOnBan ?? false);
        setDeleteMessagesDays(data?.deleteMessagesDays ?? 1);
        setCsamProtection(data?.csamProtection ?? true);
      } catch (err) {
        console.error("Failed to fetch anti-bot data:", err);
      } finally {
        setLoading(false);
      }
    };

    void fetchGuildData();
  }, [selectedGuild]);

  // Auto-save
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
      const res = await fetch("/api/anti-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guildId: selectedGuild,
          enabled,
          timeWindow,
          channelLimit,
          punishment,
          forbiddenWords: forbiddenWords.filter((w) => w.trim() !== ""),
          forbiddenUsernames: forbiddenUsernames.filter((w) => w.trim() !== ""),
          forbiddenPatterns: forbiddenPatterns.filter((p) => p.trim() !== ""),
          notificationChannel,
          jailRole: punishment === "jail" ? jailRole : null,
          excludeAdmins,
          blockInvites,
          blockNSFWInvites,
          // New fields
          messageLimit,
          mentionLimit,
          minAccountAgeDays,
          raidThreshold,
          newAccountAction,
          blockZalgo,
          blockDuplicates,
          deleteMessagesOnKick,
          deleteMessagesOnBan,
          deleteMessagesDays,
          csamProtection,
        }),
      });

      if (!res.ok) {
        if (!auto) notify("Failed to save settings", "", "error");
      } else {
        void addDashboardLog(
          selectedGuild,
          "INFO",
          "Updated Anti-Bot settings",
        );
        if (!auto) notify("Saved!", "", "success");
      }
    } catch (err) {
      if (!auto) notify("Error saving settings", String(err), "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger auto save
  useEffect(() => {
    if (!selectedGuild) return;
    triggerAutoSave();
  }, [
    enabled,
    timeWindow,
    channelLimit,
    punishment,
    forbiddenWords,
    notificationChannel,
    jailRole,
    excludeAdmins,
    blockInvites,
    blockNSFWInvites,
    messageLimit,
    mentionLimit,
    minAccountAgeDays,
    raidThreshold,
    newAccountAction,
    blockZalgo,
    blockDuplicates,
    deleteMessagesOnKick,
    deleteMessagesOnBan,
    deleteMessagesDays,
  ]);

  // Manage forbidden words
  const addForbiddenWord = () => setForbiddenWords([...forbiddenWords, ""]);

  const updateForbiddenWord = (index: number, value: string) => {
    const updated = [...forbiddenWords];
    updated[index] = value;
    setForbiddenWords(updated);
  };

  const removeForbiddenWord = (index: number) => {
    const updated = [...forbiddenWords];
    updated.splice(index, 1);
    setForbiddenWords(updated);
  };

  // Manage forbidden usernames
  const addForbiddenUsername = () =>
    setForbiddenUsernames([...forbiddenUsernames, ""]);

  const updateForbiddenUsernames = (index: number, value: string) => {
    const updated = [...forbiddenUsernames];
    updated[index] = value;
    setForbiddenUsernames(updated);
  };

  const removeForbiddenUsernames = (index: number) => {
    const updated = [...forbiddenUsernames];
    updated.splice(index, 1);
    setForbiddenUsernames(updated);
  };

  return (
    <section className="relative bg-[#181b25] p-6 rounded-lg max-w-3xl mx-auto mt-6">
      {loading && <PageLoader />}

      <h1 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
        Anti Bot
        <InfoTooltip text="Configure automated protection against bot accounts: message rate limits, punishments, forbidden words, notifications, and admin exemptions." />
      </h1>

      {/* Enable */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-gray-400">Enable Anti Bot</span>
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
        label="Select channel for notifications"
        value={notificationChannel ?? ""}
        onChange={(value) => setNotificationChannel(value)}
      />

      {/* Channel Spam */}
      <div className="mt-6 mb-1">
        <h2 className="text-sm text-gray-300 mb-3">
          <p className="font-bold text-xl">Channel Spam</p>
        </h2>
        <div className="mb-4">
          <NumberInput
            label="Time window (seconds)"
            value={timeWindow}
            onChange={(val) => setTimeWindow(Number(val))}
            placeholder="Example: 10"
          />
          <p className="text-sm text-gray-500 mt-1">
            Users cannot send messages in more than{" "}
            <InlineCode text={channelLimit.toString()} /> channels within{" "}
            <InlineCode text={timeWindow.toString()} /> seconds.
          </p>
        </div>

        <div className="mb-4">
          <NumberInput
            label="Channel limit"
            value={channelLimit}
            onChange={(val) => setChannelLimit(Number(val))}
            placeholder="Example: 3"
          />
        </div>
      </div>

      {/* Message Flood */}
      <div className="mt-6 mb-1">
        <h2 className="text-sm text-gray-300  mb-3 flex items-center gap-2">
          <p className="font-bold text-xl">Message Flood</p>
          <InfoTooltip text="Triggers when a user sends too many messages in the same channel within the time window above." />
        </h2>
        <div className="mb-4">
          <NumberInput
            label="Max messages per time window"
            value={messageLimit}
            onChange={(val) => setMessageLimit(Number(val))}
            placeholder="Example: 8"
          />
          <p className="text-sm text-gray-500 mt-1">
            If a user sends more than{" "}
            <InlineCode text={messageLimit.toString()} /> messages within{" "}
            <InlineCode text={timeWindow.toString()} /> seconds in the same
            channel, they will be punished.
          </p>
        </div>
      </div>

      {/* Mention Spam */}
      <div className="mt-6 mb-1">
        <h2 className="text-sm text-gray-300 mb-3 flex items-center gap-2">
          <p className="font-bold text-xl">Mention Spam</p>

          <InfoTooltip text="Detects @everyone, @here and mass user-mentions in a single message." />
        </h2>
        <div className="mb-4">
          <NumberInput
            label="Max mentions per message"
            value={mentionLimit}
            onChange={(val) => setMentionLimit(Number(val))}
            placeholder="Example: 5"
          />
          <p className="text-sm text-gray-500 mt-1">
            Messages containing more than{" "}
            <InlineCode text={mentionLimit.toString()} /> mentions (including{" "}
            <InlineCode text="@everyone" /> / <InlineCode text="@here" />) will
            be flagged.
          </p>
        </div>
      </div>

      {/* Punishment */}
      <div className="mt-6 mb-1">
        <h2 className="text-sm text-gray-300 mb-3">
          <p className="font-bold text-xl">Punishment</p>

        </h2>
        <div className="mb-4">
          <SelectInput
            label="Punishment"
            value={punishment}
            onChange={setPunishment}
            options={[
              { value: "mute", label: "Mute" },
              { value: "kick", label: "Kick" },
              { value: "ban", label: "Ban" },
              { value: "jail", label: "Jail" },
            ]}
          />
        </div>

        {punishment === "jail" && (
          <div className="mb-4">
            <SelectInput
              label="Jail Role"
              value={jailRole}
              onChange={setJailRole}
              options={[
                { value: "", label: "Select a role..." },
                ...(roles?.map((r) => ({ value: r.id, label: r.name })) ?? []),
              ]}
            />
          </div>
        )}

        {/* Delete messages on kick */}
        {(punishment === "kick" || punishment === "ban") && (
          <div className="mb-3 p-3 bg-[#1f2330] rounded-lg border border-gray-700">
            <p className="text-xs text-gray-400 mb-3 uppercase font-semibold tracking-wide">
              Message deletion on punishment
            </p>

            {punishment === "kick" && (
              <div className="mb-2">
                <ToggleSwitch
                  enabled={deleteMessagesOnKick}
                  onChange={() => setDeleteMessagesOnKick(!deleteMessagesOnKick)}
                  label="Delete recent messages on kick"
                  tooltip="Deletes the messages that triggered the kick punishment"
                />
              </div>
            )}

            {punishment === "ban" && (
              <>
                <div className="mb-2">
                  <ToggleSwitch
                    enabled={deleteMessagesOnBan}
                    onChange={() => setDeleteMessagesOnBan(!deleteMessagesOnBan)}
                    label="Delete messages history on ban"
                    tooltip="Uses Discord's built-in message deletion on ban"
                  />
                </div>
                {deleteMessagesOnBan && (
                  <div className="mt-3">
                    <NumberInput
                      label="Delete messages from past X days (0–7)"
                      value={deleteMessagesDays}
                      onChange={(val) =>
                        setDeleteMessagesDays(
                          Math.min(7, Math.max(0, Number(val))),
                        )
                      }
                      placeholder="1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Discord allows deleting up to{" "}
                      <InlineCode text="7 days" /> of message history when
                      banning.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Account Age Check */}
      <div className="mt-6 mb-1">
        <h2 className="text-sm text-gray-300  mb-3 flex items-center gap-2">
          <p className="font-bold text-xl">New Account Protection</p>

          <InfoTooltip text="Newly created accounts that immediately join and message are a very strong bot signal." />
        </h2>
        <div className="mb-4">
          <NumberInput
            label="Minimum account age (days)"
            value={minAccountAgeDays}
            onChange={(val) => setMinAccountAgeDays(Number(val))}
            placeholder="Example: 7"
          />
          <p className="text-sm text-gray-500 mt-1">
            Accounts younger than{" "}
            <InlineCode text={`${minAccountAgeDays} days`} /> will be flagged
            when they interact in the server.
          </p>
        </div>
        <div className="mb-4">
          <SelectInput
            label="Action for new accounts"
            value={newAccountAction}
            onChange={setNewAccountAction}
            options={[
              { value: "none", label: "None (notify only)" },
              { value: "jail", label: "Jail" },
              { value: "kick", label: "Kick" },
              { value: "ban", label: "Ban" },
            ]}
          />
        </div>
      </div>

      {/* Raid Detection */}
      <div className="mt-6 mb-1">
        <h2 className="text-sm text-gray-300 mb-3 flex items-center gap-2">
          <p className="font-bold text-xl">Raid Protection</p>

          <InfoTooltip text="Detects when multiple accounts join the server within a short time window — a classic raid pattern." />
        </h2>
        <div className="mb-4">
          <NumberInput
            label="Raid threshold (joins in 10 seconds)"
            value={raidThreshold}
            onChange={(val) => setRaidThreshold(Number(val))}
            placeholder="Example: 5"
          />
          <p className="text-sm text-gray-500 mt-1">
            If <InlineCode text={`${raidThreshold}+`} /> accounts join within
            10 seconds, those accounts will get the punishment
          </p>
        </div>
      </div>

      {/* Content Filters */}
      <div className="mt-6 mb-1">
        <h2 className="text-sm text-gray-300 mb-3">
          <p className="font-bold text-xl">Content Filters</p>
        </h2>

        <div className="mb-2">
          <ToggleSwitch
            enabled={blockDuplicates}
            onChange={() => setBlockDuplicates(!blockDuplicates)}
            label="Block duplicate / copy-paste spam"
            tooltip="Detects users repeatedly sending the same message (copy-paste spam)"
          />
        </div>

        <div className="mb-2">
          <ToggleSwitch
            enabled={blockZalgo}
            onChange={() => setBlockZalgo(!blockZalgo)}
            label="Block Zalgo / unicode abuse"
            tooltip="Blocks messages filled with combining unicode characters that distort text rendering"
          />
        </div>

        <div className="mb-2">
          <ToggleSwitch
            enabled={csamProtection}
            onChange={() => setEnabled(!csamProtection)}
            label="Detect csam"
            tooltip="Detects messages filled with underage sexual spam messages"
          />
        </div>
      </div>

      {/* Forbidden Words */}
      <div className="mt-6 mb-4">
        <h2 className="text-sm text-gray-300 mb-3">
          <p className="font-bold text-xl">Forbidden Words &amp; Sentences</p>
        </h2>
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto border border-gray-700 p-2 rounded bg-[#1f2330]">
          {forbiddenWords.map((word, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={word}
                onChange={(e) => updateForbiddenWord(index, e.target.value)}
                placeholder="Enter forbidden word or sentence"
                className="flex-1 bg-[#0f1117] border border-gray-700 rounded p-2 text-white"
              />
              {forbiddenWords.length > 1 && (
                <DeleteButton onClick={() => removeForbiddenWord(index)} />
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addForbiddenWord}
          className="mt-2 px-3 py-1 bg-[var(--primary-color)] rounded hover:brightness-90 text-white"
        >
          Add Word/Sentence
        </button>
      </div>

      {/* Forbidden Usernames */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">
          <span className="inline-flex items-center gap-1">
            Forbidden Usernames
            <InfoTooltip text="On server join, if one of these words are in the username, then the user will get the punishment" />
          </span>
        </label>

        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto border border-gray-700 p-2 rounded bg-[#1f2330]">
          {forbiddenUsernames.map((username, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={username}
                onChange={(e) =>
                  updateForbiddenUsernames(index, e.target.value)
                }
                placeholder="Enter forbidden word or sentence"
                className="flex-1 bg-[#0f1117] border border-gray-700 rounded p-2 text-white"
              />
              {forbiddenUsernames.length > 1 && (
                <DeleteButton
                  onClick={() => removeForbiddenUsernames(index)}
                />
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addForbiddenUsername}
          className="mt-2 px-3 py-1 bg-[var(--primary-color)] rounded hover:brightness-90 text-white"
        >
          Add Word/Sentence
        </button>
      </div>

      {/* General Toggles*/}
      <div className="mt-6 mb-1">
        <h2 className="text-sm text-gray-300 mb-3">
          <p className="font-bold text-xl">Discord Invites & Exclude Admins</p>
        </h2>

        <div className="mb-2">
          <ToggleSwitch
            enabled={excludeAdmins}
            onChange={() => setExcludeAdmins(!excludeAdmins)}
            label="Exclude Admins"
          />
        </div>

        <div className="mb-2">
          <ToggleSwitch
            enabled={blockInvites}
            onChange={() => setBlockInvites(!blockInvites)}
            label="Block Discord invites"
            tooltip="This does not block Discord invites from admin users"
          />
        </div>

        <div className="mb-2">
          <ToggleSwitch
            enabled={blockNSFWInvites}
            onChange={() => setBlockNSFWInvites(!blockNSFWInvites)}
            label="Block NSFW Discord invites"
            tooltip="This does not block NSFW Discord invites from admin users"
          />
        </div>
      </div>

      <div className="text-right text-gray-400 text-sm mt-3">
        {isSaving ? "Saving..." : "Auto saved!"}
      </div>

      <SaveButton onClick={() => void handleSave(false)} />
    </section>
  );
}
