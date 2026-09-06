export const moderationFilterTypes = [
  "words",
  "patterns",
  "invites",
  "nsfwInvites",
  "links",
  "spam",
  "channelSpam",
  "mentions",
  "capitals",
  "newlines",
  "attachments",
  "duplicates",
  "reactions",
  "zalgo",
  "csam",
  "usernames",
  "accountAge",
  "raid",
] as const;

export type ModerationFilterType = (typeof moderationFilterTypes)[number];

/**
 * Filters that judge a member instead of a message. They run on join and on a
 * name change, so deleting or replying to a message makes no sense for them.
 */
export const memberScopedFilterTypes: ModerationFilterType[] = [
  "usernames",
  "accountAge",
  "raid",
];

export const isMemberScopedFilter = (type: ModerationFilterType): boolean =>
  memberScopedFilterTypes.includes(type);

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

/**
 * `limit` means something different per filter — a percentage for capitals, a
 * count of messages for spam — so a single shared default does not work. A
 * capitals limit of 5 would flag "Hoi ik ben Kelvin" at 14% uppercase.
 */
const filterDefaults: Partial<
  Record<ModerationFilterType, Partial<ModerationFilter>>
> = {
  // Percentage of uppercase letters, only counted from minimumLength up
  capitals: { limit: 70, minimumLength: 10 },
  // Mentions in a single message
  mentions: { limit: 5 },
  // Line breaks in a single message
  newlines: { limit: 10 },
  // Messages per member inside the window
  spam: { limit: 5, window: 10 },
  // Identical messages inside the window
  duplicates: { limit: 3, window: 30 },
  // Attachments per member inside the window
  attachments: { limit: 5, window: 15 },
  // Reactions per member inside the window
  reactions: { limit: 10, window: 10 },
  // Channels a member may spread the same burst over inside the window
  channelSpam: { limit: 3, window: 10 },
  // A single match is already the whole signal, so punish on the first hit
  csam: { thresholdMaximum: 1, hardAction: "ban" },
  patterns: { thresholdMaximum: 1 },
  nsfwInvites: { thresholdMaximum: 1 },
  // Member scoped: no message to delete or reply to
  usernames: { thresholdMaximum: 1, delete: false, alert: false },
  // Minimum account age in days
  accountAge: { limit: 7, thresholdMaximum: 1, delete: false, alert: false },
  // Joins inside the window before the wave counts as a raid
  raid: {
    limit: 5,
    window: 10,
    thresholdMaximum: 1,
    delete: false,
    alert: false,
  },
};

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
  ...filterDefaults[type],
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
