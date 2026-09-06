"use client";

import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import DeleteButton from "@/app/(dashboard)/dashboard/components/buttons/Delete";
import SaveButton from "@/app/(dashboard)/dashboard/components/buttons/Save";
import ChannelSelect from "@/app/(dashboard)/dashboard/components/inputs/ChannelSelect";
import CheckList from "@/app/(dashboard)/dashboard/components/inputs/CheckList";
import NumberInput from "@/app/(dashboard)/dashboard/components/inputs/Number";
import SelectInput from "@/app/(dashboard)/dashboard/components/inputs/Select";
import ToggleSwitch from "@/app/(dashboard)/dashboard/components/inputs/Switch";
import PageLoader from "@/app/(dashboard)/dashboard/components/PageLoader";
import InfoTooltip from "@/app/(dashboard)/dashboard/components/ui/InfoToolTip";
import InlineCode from "@/app/(dashboard)/dashboard/components/ui/InlineCode";
import moderationFilters, {
  moderationFilterGroups,
} from "@/app/(dashboard)/dashboard/data/moderationFilters";
import FilterCard from "@/app/(dashboard)/dashboard/modules/moderation/FilterCard";
import { useGuild } from "@/app/context/GuildContext";
import { useNotification } from "@/app/context/NotificationContext";
import { addDashboardLog } from "@/app/lib/addDashboardLog";
import {
  defaultModerationFilter,
  defaultModerationSettings,
  type ModerationAction,
  type ModerationEscalation,
  type ModerationFilter,
  type ModerationFilterType,
  type ModerationSettings,
} from "@/app/types/moderation";

const tabs = [
  { id: "general", label: "General" },
  { id: "filters", label: "Auto-Moderation" },
  { id: "punishments", label: "Punishments" },
] as const;

type Tab = (typeof tabs)[number]["id"];

const escalationActions = [
  { value: "mute", label: "Mute" },
  { value: "timeout", label: "Timeout" },
  { value: "kick", label: "Kick" },
  { value: "softban", label: "Softban (ban + unban)" },
  { value: "ban", label: "Ban" },
];

// Strip empty rows and blank selections so the payload passes validation
const toPayload = (guildId: string, settings: ModerationSettings) => ({
  guildId,
  ...settings,
  logChannel: settings.logChannel || null,
  muteRole: settings.muteRole || null,
  dmMessage: settings.dmMessage?.trim() ? settings.dmMessage : null,
  escalations: [...settings.escalations].sort(
    (a, b) => a.warnings - b.warnings,
  ),
  filters: settings.filters.map((filter) => ({
    ...filter,
    entries: filter.entries.map((e) => e.trim()).filter((e) => e !== ""),
  })),
});

export default function ModerationPage() {
  const [settings, setSettings] = useState<ModerationSettings>(
    defaultModerationSettings(),
  );
  const [tab, setTab] = useState<Tab>("general");
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { selectedGuild, roles, channels } = useGuild();
  const { notify } = useNotification();
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastSaved = useRef<string>("");

  const textChannels = channels.filter((c) => c.type === 0 || c.type === 5);

  useEffect(() => {
    document.title = "Moderation Settings";
    if (!selectedGuild) return;

    const fetchData = async () => {
      setLoading(true);

      try {
        const res = await fetch(`/api/moderation?guildId=${selectedGuild}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (!res.ok || data?.error) {
          setSettings(defaultModerationSettings());
          return;
        }

        const loaded: ModerationSettings = {
          ...defaultModerationSettings(),
          ...data,
          escalations: data.escalations ?? [],
          filters: defaultModerationSettings().filters.map(
            (fallback) =>
              data.filters?.find(
                (f: ModerationFilter) => f.type === fallback.type,
              ) ?? fallback,
          ),
        };

        setSettings(loaded);
        lastSaved.current = JSON.stringify(loaded);
      } catch (err) {
        console.error("Failed to fetch moderation data:", err);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [selectedGuild]);

  const handleSave = async (auto = false) => {
    if (!selectedGuild) return;
    setIsSaving(true);

    const snapshot = JSON.stringify(settings);

    try {
      const res = await fetch("/api/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(selectedGuild, settings)),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        notify("Failed to save settings", data?.error ?? "", "error");
      } else {
        lastSaved.current = snapshot;
        void addDashboardLog(
          selectedGuild,
          "INFO",
          "Updated Moderation settings",
        );
        if (!auto) notify("Saved!", "", "success");
      }
    } catch (err) {
      if (!auto) notify("Error saving settings", String(err), "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save, skipped while nothing changed since the last successful save
  useEffect(() => {
    if (!selectedGuild || loading) return;
    if (JSON.stringify(settings) === lastSaved.current) return;

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      void handleSave(true);
    }, 1500);

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [settings, selectedGuild, loading]);

  const update = (patch: Partial<ModerationSettings>) =>
    setSettings((prev) => ({ ...prev, ...patch }));

  const updateFilter = (
    type: ModerationFilterType,
    patch: Partial<ModerationFilter>,
  ) =>
    setSettings((prev) => ({
      ...prev,
      filters: prev.filters.map((f) =>
        f.type === type ? { ...f, ...patch } : f,
      ),
    }));

  const resetFilter = async (type: ModerationFilterType) => {
    const next: ModerationSettings = {
      ...settings,
      filters: settings.filters.map((f) =>
        f.type === type ? defaultModerationFilter(type) : f,
      ),
    };

    setSettings(next);
    lastSaved.current = JSON.stringify(next);

    if (!selectedGuild) return;

    try {
      await fetch(`/api/moderation?guildId=${selectedGuild}&type=${type}`, {
        method: "DELETE",
      });
      notify("Filter reset", "", "success");
    } catch (err) {
      notify("Could not reset filter", String(err), "error");
    }
  };

  const updateEscalation = (
    index: number,
    patch: Partial<ModerationEscalation>,
  ) =>
    setSettings((prev) => ({
      ...prev,
      escalations: prev.escalations.map((e, i) =>
        i === index ? { ...e, ...patch } : e,
      ),
    }));

  const toggleIn = (list: string[], id: string) =>
    list.includes(id) ? list.filter((v) => v !== id) : [...list, id];

  const enabledFilters = settings.filters.filter((f) => f.enabled).length;

  // Without a mute role the bot falls back to a Discord timeout, which is worth
  // pointing out because a timeout behaves differently and cannot be permanent.
  const usesTimeoutFallback =
    !settings.muteRole &&
    (settings.filters.some((f) => f.enabled && f.hardAction === "mute") ||
      settings.escalations.some((e) => e.action === "mute"));

  return (
    <section className="relative bg-[#181b25] p-6 rounded-lg max-w-3xl mx-auto mt-6">
      {loading && <PageLoader />}

      <h1 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
        Moderation
        <InfoTooltip text="Configure auto-moderation filters, punishments and the moderation log for your server." />
      </h1>

      {/* Master switch */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-gray-400">Enable Moderation</span>
        <button
          type="button"
          onClick={() => update({ enabled: !settings.enabled })}
          className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
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

      {usesTimeoutFallback && (
        <div className="mb-6 p-3 rounded-lg border border-sky-800 bg-sky-900/20 text-sm text-sky-200">
          No mute role is selected, so muted members get Discord&apos;s built-in
          timeout instead. A timeout silences them everywhere and lasts at most{" "}
          <InlineCode text="28 days" />. Pick a mute role under{" "}
          <InlineCode text="General" /> if you want per-channel control or
          permanent mutes.
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-800 mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm cursor-pointer border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? "border-[var(--primary-color)] text-white font-semibold"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            {t.label}
            {t.id === "filters" && enabledFilters > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-[var(--primary-color)] text-white text-xs">
                {enabledFilters}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* General */}
      {tab === "general" && (
        <div>
          <ChannelSelect
            label="Moderation log channel"
            value={settings.logChannel ?? ""}
            onChange={(value) => update({ logChannel: value })}
            tooltip="Every moderation action and filter hit is posted here."
          />

          <SelectInput
            label="Mute role"
            value={settings.muteRole ?? ""}
            onChange={(value) => update({ muteRole: value })}
            tooltip="The role given to muted members. Required for the mute punishment."
            options={roles.map((r) => ({ value: r.id, label: r.name }))}
          />

          <NumberInput
            label="Default mute duration (minutes)"
            value={settings.defaultMuteDuration}
            onChange={(val) => update({ defaultMuteDuration: Number(val) })}
            min={1}
            tooltip="Used whenever a mute is issued without an explicit duration."
          />

          <NumberInput
            label="Delete messages on ban (days)"
            value={settings.deleteMessageDays}
            onChange={(val) =>
              update({
                deleteMessageDays: Math.min(7, Math.max(0, Number(val))),
              })
            }
            min={0}
            max={7}
          />
          <p className="text-sm text-gray-500 -mt-2 mb-4">
            Discord allows deleting up to <InlineCode text="7 days" /> of
            message history when banning.
          </p>

          <div className="mt-6 mb-1">
            <h2 className="text-sm text-gray-300 mb-3">
              <p className="font-bold text-xl">Notifications</p>
            </h2>

            <div className="mb-2">
              <ToggleSwitch
                enabled={settings.dmOnPunishment}
                onChange={(value) => update({ dmOnPunishment: value })}
                label="DM members when they are punished"
              />
            </div>

            {settings.dmOnPunishment && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-gray-400">Direct message</label>
                  <InfoTooltip
                    text="Use {user}, {server}, {action}, {reason} and {duration} as placeholders."
                    size={16}
                  />
                </div>
                <textarea
                  value={settings.dmMessage ?? ""}
                  onChange={(e) => update({ dmMessage: e.target.value })}
                  rows={3}
                  placeholder="You received a {action} in {server}. Reason: {reason}"
                  className="w-full bg-[#0d0f13] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                />
              </div>
            )}
          </div>

          <div className="mt-6 mb-1">
            <h2 className="text-sm text-gray-300 mb-3 flex items-center gap-2">
              <p className="font-bold text-xl">Exceptions</p>
              <InfoTooltip text="These are skipped by every filter. Each filter can add its own exceptions on top." />
            </h2>

            <div className="mb-2">
              <ToggleSwitch
                enabled={settings.ignoreAdmins}
                onChange={(value) => update({ ignoreAdmins: value })}
                label="Ignore administrators"
              />
            </div>
            <div className="mb-2">
              <ToggleSwitch
                enabled={settings.ignoreBots}
                onChange={(value) => update({ ignoreBots: value })}
                label="Ignore bots"
              />
            </div>

            <CheckList
              label="Immune roles"
              toolTip="Members with one of these roles are never moderated."
              items={roles.map((r) => ({ id: r.id, name: r.name }))}
              selectedIds={settings.immuneRoles}
              onToggle={(id) =>
                update({ immuneRoles: toggleIn(settings.immuneRoles, id) })
              }
              placeholder="Search roles..."
            />

            <CheckList
              label="Ignored channels"
              items={textChannels.map((c) => ({ id: c.id, name: c.name }))}
              selectedIds={settings.ignoredChannels}
              onToggle={(id) =>
                update({
                  ignoredChannels: toggleIn(settings.ignoredChannels, id),
                })
              }
              placeholder="Search channels..."
            />
          </div>
        </div>
      )}

      {/* Auto-Moderation */}
      {tab === "filters" && (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            Every filter has its own detection limits, immediate actions and
            punishment. Open a filter to configure it.
          </p>

          {moderationFilterGroups.map((group) => (
            <div key={group.id} className="mb-6">
              <h2 className="text-xs text-gray-400 mb-3 uppercase font-semibold tracking-wide">
                {group.label}
              </h2>

              {moderationFilters
                .filter((definition) => definition.group === group.id)
                .map((definition) => {
                  const filter =
                    settings.filters.find((f) => f.type === definition.type) ??
                    defaultModerationFilter(definition.type);

                  return (
                    <FilterCard
                      key={definition.type}
                      definition={definition}
                      filter={filter}
                      onChange={(patch) => updateFilter(definition.type, patch)}
                      onReset={() => void resetFilter(definition.type)}
                    />
                  );
                })}
            </div>
          ))}
        </div>
      )}

      {/* Punishments */}
      {tab === "punishments" && (
        <div>
          <h2 className="text-sm text-gray-300 mb-3 flex items-center gap-2">
            <p className="font-bold text-xl">Warning escalation</p>
            <InfoTooltip text="Automatically punish members once they collect a number of active warnings." />
          </h2>

          <NumberInput
            label="Warnings expire after (days)"
            value={settings.warnExpiryDays}
            onChange={(val) => update({ warnExpiryDays: Number(val) })}
            min={0}
            tooltip="Use 0 to keep warnings forever."
          />

          {settings.escalations.length === 0 && (
            <p className="text-sm text-gray-500 mb-4">
              No escalations yet. Warnings are only logged.
            </p>
          )}

          {settings.escalations.map((escalation, index) => (
            <div
              key={index}
              className="bg-[#14171f] border border-gray-800 rounded-lg p-4 mb-3"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-white font-semibold mb-2">
                  Step {index + 1}
                </p>
                <DeleteButton
                  onClick={() =>
                    update({
                      escalations: settings.escalations.filter(
                        (_, i) => i !== index,
                      ),
                    })
                  }
                />
              </div>

              <NumberInput
                label="Active warnings"
                value={escalation.warnings}
                onChange={(val) =>
                  updateEscalation(index, { warnings: Number(val) })
                }
                min={1}
              />

              <SelectInput
                label="Action"
                value={escalation.action}
                onChange={(value) =>
                  updateEscalation(index, { action: value as ModerationAction })
                }
                options={escalationActions}
              />

              {(escalation.action === "mute" ||
                escalation.action === "timeout") && (
                <>
                  <NumberInput
                    label="Duration (minutes)"
                    value={escalation.duration}
                    onChange={(val) =>
                      updateEscalation(index, { duration: Number(val) })
                    }
                    min={0}
                  />
                  <p className="text-sm text-gray-500 -mt-2 mb-2">
                    Use <InlineCode text="0" /> for a permanent punishment.
                  </p>
                </>
              )}

              <p className="text-sm text-gray-500">
                At <InlineCode text={`${escalation.warnings} warnings`} /> the
                member gets a <InlineCode text={escalation.action} />.
              </p>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              update({
                escalations: [
                  ...settings.escalations,
                  {
                    warnings: settings.escalations.length + 3,
                    action: "mute",
                    duration: 60,
                  },
                ],
              })
            }
            className="flex items-center gap-1 text-sm cursor-pointer text-[var(--primary-color)] hover:text-[var(--hover-color)]"
          >
            <Plus size={16} />
            Add escalation step
          </button>
        </div>
      )}

      <div className="text-right text-gray-400 text-sm mt-6">
        {isSaving ? "Saving..." : "Auto saved!"}
      </div>

      <SaveButton onClick={() => handleSave(false)} loading={isSaving} />
    </section>
  );
}
