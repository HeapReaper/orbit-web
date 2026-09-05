export const moderationFilterTypes = [
  "words",
  "invites",
  "links",
  "spam",
  "mentions",
  "capitals",
  "newlines",
  "attachments",
  "duplicates",
  "reactions",
  "zalgo",
] as const;

export type ModerationFilterType = (typeof moderationFilterTypes)[number];

export const moderationActions = [
  "none",
  "warn",
  "mute",
  "timeout",
  "kick",
  "softban",
  "ban",
] as const;

export type ModerationAction = (typeof moderationActions)[number];

export interface ModerationFilter {
  type: ModerationFilterType;
  enabled: boolean;
  /** Reply to the member in the channel when the filter triggers. */
  alert: boolean;
  /** Send an entry to the moderation log channel. */
  log: boolean;
  /** Delete the offending message. */
  delete: boolean;
  /** Punishment applied once the threshold is reached. */
  hardAction: ModerationAction;
  /** Duration of the punishment in minutes, 0 means permanent. */
  hardActionDuration: number;
  /** Amount of infractions before the punishment is applied. */
  thresholdMaximum: number;
  /** Time window in seconds in which infractions are counted. */
  thresholdDuration: number;
  /** Filter specific maximum, for example max mentions or max capitals percentage. */
  limit: number;
  /** Filter specific time window in seconds, used by the spam-like filters. */
  window: number;
  /** Minimum message length before the filter starts checking. */
  minimumLength: number;
  /** Blocked words or domains, depending on the filter. */
  entries: string[];
  entriesMode: "blacklist" | "whitelist";
  ignoredChannels: string[];
  ignoredRoles: string[];
}

export interface ModerationEscalation {
  /** Amount of active warnings needed to trigger this step. */
  warnings: number;
  action: ModerationAction;
  /** Duration in minutes, 0 means permanent. */
  duration: number;
}

export interface ModerationSettings {
  enabled: boolean;
  logChannel: string | null;
  muteRole: string | null;
  dmOnPunishment: boolean;
  dmMessage: string | null;
  ignoreAdmins: boolean;
  ignoreBots: boolean;
  immuneRoles: string[];
  ignoredChannels: string[];
  deleteMessageDays: number;
  defaultMuteDuration: number;
  warnExpiryDays: number;
  escalations: ModerationEscalation[];
  filters: ModerationFilter[];
}

export const defaultModerationFilter = (
  type: ModerationFilterType,
): ModerationFilter => ({
  type,
  enabled: false,
  alert: false,
  log: true,
  delete: true,
  hardAction: "none",
  hardActionDuration: 0,
  thresholdMaximum: 3,
  thresholdDuration: 60,
  limit: 5,
  window: 10,
  minimumLength: 10,
  entries: [],
  entriesMode: "blacklist",
  ignoredChannels: [],
  ignoredRoles: [],
});

export const defaultModerationSettings = (): ModerationSettings => ({
  enabled: false,
  logChannel: null,
  muteRole: null,
  dmOnPunishment: true,
  dmMessage: null,
  ignoreAdmins: true,
  ignoreBots: true,
  immuneRoles: [],
  ignoredChannels: [],
  deleteMessageDays: 1,
  defaultMuteDuration: 60,
  warnExpiryDays: 30,
  escalations: [],
  filters: moderationFilterTypes.map(defaultModerationFilter),
});
