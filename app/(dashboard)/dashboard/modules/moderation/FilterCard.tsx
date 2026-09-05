"use client";

import { ChevronRight, Plus, RotateCcw } from "lucide-react";
import { useState } from "react";
import DeleteButton from "@/app/(dashboard)/dashboard/components/buttons/Delete";
import CheckList from "@/app/(dashboard)/dashboard/components/inputs/CheckList";
import NumberInput from "@/app/(dashboard)/dashboard/components/inputs/Number";
import SelectInput from "@/app/(dashboard)/dashboard/components/inputs/Select";
import ToggleSwitch from "@/app/(dashboard)/dashboard/components/inputs/Switch";
import InfoTooltip from "@/app/(dashboard)/dashboard/components/ui/InfoToolTip";
import InlineCode from "@/app/(dashboard)/dashboard/components/ui/InlineCode";
import type { ModerationFilterDefinition } from "@/app/(dashboard)/dashboard/data/moderationFilters";
import { useGuild } from "@/app/context/GuildContext";
import type { ModerationFilter } from "@/app/types/moderation";

interface Props {
  definition: ModerationFilterDefinition;
  filter: ModerationFilter;
  onChange: (patch: Partial<ModerationFilter>) => void;
  onReset: () => void;
}

const actionOptions = [
  { value: "none", label: "Nothing (only the actions above)" },
  { value: "warn", label: "Warn" },
  { value: "mute", label: "Mute" },
  { value: "timeout", label: "Timeout" },
  { value: "kick", label: "Kick" },
  { value: "softban", label: "Softban (ban + unban)" },
  { value: "ban", label: "Ban" },
];

const temporaryActions = ["mute", "timeout"];

export default function FilterCard({
  definition,
  filter,
  onChange,
  onReset,
}: Props) {
  const [open, setOpen] = useState(false);
  const { roles, channels } = useGuild();

  const textChannels = channels.filter((c) => c.type === 0 || c.type === 5);

  // The list always keeps one empty row so members can start typing right away
  const entries = filter.entries.length ? filter.entries : [""];

  const updateEntry = (index: number, value: string) => {
    const updated = [...entries];
    updated[index] = value;
    onChange({ entries: updated });
  };

  const removeEntry = (index: number) => {
    const updated = [...entries];
    updated.splice(index, 1);
    onChange({ entries: updated });
  };

  const toggleIn = (list: string[], id: string) =>
    list.includes(id) ? list.filter((v) => v !== id) : [...list, id];

  return (
    <div className="bg-[#14171f] border border-gray-800 rounded-lg mb-3">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 flex-1 text-left cursor-pointer"
        >
          <ChevronRight
            className={`w-5 h-5 text-gray-500 shrink-0 transition-transform ${
              open ? "rotate-90" : ""
            }`}
          />
          <span>
            <span className="block text-white font-semibold">
              {definition.name}
            </span>
            <span className="block text-sm text-gray-400">
              {definition.description}
            </span>
          </span>
        </button>

        <span
          className={`hidden sm:inline whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium ${
            filter.enabled
              ? "bg-green-500 text-black"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          {filter.enabled ? "Enabled" : "Disabled"}
        </span>

        <button
          type="button"
          onClick={() => onChange({ enabled: !filter.enabled })}
          className={`relative inline-flex items-center h-6 w-12 shrink-0 rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
            filter.enabled ? "bg-[var(--primary-color)]" : "bg-gray-700"
          }`}
          aria-label={`Toggle ${definition.name}`}
        >
          <span
            className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform duration-200 ${
              filter.enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-800 p-4">
          {/* Filter specific limits */}
          {(definition.limitLabel ||
            definition.windowLabel ||
            definition.minimumLengthLabel) && (
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-3 uppercase font-semibold tracking-wide">
                Detection
              </p>

              {definition.limitLabel && (
                <>
                  <NumberInput
                    label={definition.limitLabel}
                    value={filter.limit}
                    onChange={(val) => onChange({ limit: Number(val) })}
                    min={1}
                  />
                  {definition.limitHint && (
                    <p className="text-sm text-gray-500 -mt-3 mb-4">
                      {definition.limitHint}
                    </p>
                  )}
                </>
              )}

              {definition.windowLabel && (
                <NumberInput
                  label={definition.windowLabel}
                  value={filter.window}
                  onChange={(val) => onChange({ window: Number(val) })}
                  min={1}
                />
              )}

              {definition.minimumLengthLabel && (
                <NumberInput
                  label={definition.minimumLengthLabel}
                  value={filter.minimumLength}
                  onChange={(val) => onChange({ minimumLength: Number(val) })}
                  min={0}
                  tooltip="Shorter messages are ignored by this filter."
                />
              )}
            </div>
          )}

          {/* Word / domain list */}
          {definition.entriesLabel && (
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-3 uppercase font-semibold tracking-wide">
                {definition.entriesLabel}
              </p>

              {definition.entriesModeSelectable && (
                <SelectInput
                  label="List behaviour"
                  value={filter.entriesMode}
                  onChange={(value) =>
                    onChange({
                      entriesMode:
                        value === "whitelist" ? "whitelist" : "blacklist",
                    })
                  }
                  options={[
                    { value: "blacklist", label: "Block only these domains" },
                    { value: "whitelist", label: "Allow only these domains" },
                  ]}
                />
              )}

              {entries.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={entry}
                    onChange={(e) => updateEntry(index, e.target.value)}
                    placeholder={definition.entriesPlaceholder}
                    className="w-full bg-[#0d0f13] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  />
                  <DeleteButton onClick={() => removeEntry(index)} />
                </div>
              ))}

              <button
                type="button"
                onClick={() => onChange({ entries: [...entries, ""] })}
                className="flex items-center gap-1 text-sm cursor-pointer text-[var(--primary-color)] hover:text-[var(--hover-color)]"
              >
                <Plus size={16} />
                Add entry
              </button>
            </div>
          )}

          {/* Immediate actions */}
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-3 uppercase font-semibold tracking-wide">
              When this filter triggers
            </p>

            <div className="mb-2">
              <ToggleSwitch
                enabled={filter.delete}
                onChange={(value) => onChange({ delete: value })}
                label="Delete the message"
              />
            </div>
            <div className="mb-2">
              <ToggleSwitch
                enabled={filter.alert}
                onChange={(value) => onChange({ alert: value })}
                label="Alert the member in the channel"
                tooltip="Sends a short reply telling the member why their message was removed."
              />
            </div>
            <div className="mb-2">
              <ToggleSwitch
                enabled={filter.log}
                onChange={(value) => onChange({ log: value })}
                label="Send an entry to the moderation log"
              />
            </div>
          </div>

          {/* Punishment */}
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-3 uppercase font-semibold tracking-wide">
              Punishment
            </p>

            <SelectInput
              label="Action on repeated offences"
              value={filter.hardAction}
              onChange={(value) =>
                onChange({
                  hardAction: value as ModerationFilter["hardAction"],
                })
              }
              options={actionOptions}
            />

            {filter.hardAction !== "none" && (
              <>
                <NumberInput
                  label="Offences before punishing"
                  value={filter.thresholdMaximum}
                  onChange={(val) =>
                    onChange({ thresholdMaximum: Number(val) })
                  }
                  min={1}
                />
                <NumberInput
                  label="Offences are counted for (seconds)"
                  value={filter.thresholdDuration}
                  onChange={(val) =>
                    onChange({ thresholdDuration: Number(val) })
                  }
                  min={1}
                />
                <p className="text-sm text-gray-500 -mt-2 mb-4">
                  A member is punished after{" "}
                  <InlineCode text={filter.thresholdMaximum.toString()} />{" "}
                  offences within{" "}
                  <InlineCode text={`${filter.thresholdDuration}s`} />.
                </p>

                {temporaryActions.includes(filter.hardAction) && (
                  <>
                    <NumberInput
                      label="Punishment duration (minutes)"
                      value={filter.hardActionDuration}
                      onChange={(val) =>
                        onChange({ hardActionDuration: Number(val) })
                      }
                      min={0}
                    />
                    <p className="text-sm text-gray-500 -mt-2 mb-4">
                      Use <InlineCode text="0" /> for a permanent punishment.
                    </p>
                  </>
                )}
              </>
            )}
          </div>

          {/* Exceptions */}
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-3 uppercase font-semibold tracking-wide flex items-center gap-2">
              Exceptions
              <InfoTooltip text="Channels and roles listed here are skipped by this filter only. Server wide exceptions live on the General tab." />
            </p>

            <CheckList
              label="Ignored channels"
              items={textChannels.map((c) => ({ id: c.id, name: c.name }))}
              selectedIds={filter.ignoredChannels}
              onToggle={(id) =>
                onChange({
                  ignoredChannels: toggleIn(filter.ignoredChannels, id),
                })
              }
              placeholder="Search channels..."
            />

            <CheckList
              label="Ignored roles"
              items={roles.map((r) => ({ id: r.id, name: r.name }))}
              selectedIds={filter.ignoredRoles}
              onToggle={(id) =>
                onChange({ ignoredRoles: toggleIn(filter.ignoredRoles, id) })
              }
              placeholder="Search roles..."
            />
          </div>

          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-sm cursor-pointer text-gray-400 hover:text-white"
          >
            <RotateCcw size={16} />
            Reset this filter
          </button>
        </div>
      )}
    </div>
  );
}
