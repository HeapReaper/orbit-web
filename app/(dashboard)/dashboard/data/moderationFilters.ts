import type { ModerationFilterType } from "@/app/types/moderation";

/** Filters are shown per group so the long list stays scannable. */
export const moderationFilterGroups = [
  { id: "content", label: "Content" },
  { id: "spam", label: "Spam & Flooding" },
  { id: "members", label: "Members & Raids" },
] as const;

export type ModerationFilterGroup =
  (typeof moderationFilterGroups)[number]["id"];

export interface ModerationFilterDefinition {
  type: ModerationFilterType;
  name: string;
  description: string;
  group: ModerationFilterGroup;
  /**
   * Member scoped filters judge the member, not a message, so the message
   * actions and the channel exceptions are hidden for them.
   */
  memberScoped?: boolean;
  /** Filter specific maximum, rendered only when a label is given. */
  limitLabel?: string;
  limitHint?: string;
  /** Time window in seconds, rendered only when a label is given. */
  windowLabel?: string;
  /** Minimum message length before checking, rendered only when a label is given. */
  minimumLengthLabel?: string;
  /** Word or domain list, rendered only when a label is given. */
  entriesLabel?: string;
  entriesPlaceholder?: string;
  /** Lets the list act as an allow list instead of a block list. */
  entriesModeSelectable?: boolean;
  /** Shown under the entry list, for lists that need an explanation. */
  entriesHint?: string;
  /** Entries are regular expressions and get validated as such. */
  entriesAreRegex?: boolean;
}

const moderationFilters: ModerationFilterDefinition[] = [
  {
    type: "words",
    group: "content",
    name: "Word Filter",
    description:
      "Blocks messages containing words or phrases you do not want in your server.",
    entriesLabel: "Blocked words",
    entriesPlaceholder: "Example: badword",
  },
  {
    type: "patterns",
    group: "content",
    name: "Custom Patterns",
    description:
      "Blocks messages matching your own regular expressions, for everything a plain word list cannot catch.",
    entriesLabel: "Patterns",
    entriesPlaceholder: "Example: (free|gratis)\\s*nitro",
    entriesHint:
      "Case insensitive regular expressions. An invalid pattern is skipped instead of blocking every message.",
    entriesAreRegex: true,
  },
  {
    type: "invites",
    group: "content",
    name: "Invite Links",
    description:
      "Blocks Discord invite links so members cannot advertise other servers.",
    entriesLabel: "Allowed server IDs",
    entriesPlaceholder: "Example: 123456789012345678",
  },
  {
    type: "nsfwInvites",
    group: "content",
    name: "NSFW Invite Links",
    description:
      "Blocks invites to age restricted servers, even when regular invites are allowed.",
    entriesLabel: "Extra keywords",
    entriesPlaceholder: "Example: onlyfans",
    entriesHint:
      "Checked against the invited server's name and description, on top of Discord's own age rating and a built-in keyword list.",
  },
  {
    type: "links",
    group: "content",
    name: "Links",
    description:
      "Blocks links posted in your server. Use the list to allow or block specific domains.",
    entriesLabel: "Domains",
    entriesPlaceholder: "Example: youtube.com",
    entriesModeSelectable: true,
  },
  {
    type: "spam",
    group: "spam",
    name: "Message Spam",
    description:
      "Triggers when a member sends too many messages in a short amount of time.",
    limitLabel: "Max messages",
    limitHint: "Amount of messages allowed inside the time window.",
    windowLabel: "Time window (seconds)",
  },
  {
    type: "channelSpam",
    group: "spam",
    name: "Cross-channel Spam",
    description:
      "Triggers when a member posts the same burst across several channels, the classic spam bot pattern.",
    limitLabel: "Max channels",
    limitHint: "Amount of different channels allowed inside the time window.",
    windowLabel: "Time window (seconds)",
  },
  {
    type: "mentions",
    group: "spam",
    name: "Mention Spam",
    description:
      "Triggers on messages with too many mentions, including @everyone and @here.",
    limitLabel: "Max mentions per message",
  },
  {
    type: "capitals",
    group: "content",
    name: "Capital Letters",
    description:
      "Blocks messages that are shouting, based on the percentage of uppercase characters.",
    limitLabel: "Max capitals (%)",
    limitHint:
      "Messages above this percentage of uppercase letters are flagged.",
    minimumLengthLabel: "Minimum message length",
  },
  {
    type: "newlines",
    group: "content",
    name: "New Lines",
    description:
      "Blocks messages that stretch the chat by using too many line breaks.",
    limitLabel: "Max new lines",
  },
  {
    type: "attachments",
    group: "spam",
    name: "Attachments",
    description:
      "Triggers when a member uploads too many attachments in a short amount of time.",
    limitLabel: "Max attachments",
    windowLabel: "Time window (seconds)",
  },
  {
    type: "duplicates",
    group: "spam",
    name: "Message Duplication",
    description:
      "Triggers when a member repeats the same message, the classic copy-paste spam.",
    limitLabel: "Max duplicates",
    windowLabel: "Time window (seconds)",
  },
  {
    type: "reactions",
    group: "spam",
    name: "Reaction Spam",
    description:
      "Triggers when a member adds too many reactions in a short amount of time.",
    limitLabel: "Max reactions",
    windowLabel: "Time window (seconds)",
  },
  {
    type: "zalgo",
    group: "content",
    name: "Zalgo & Unicode Abuse",
    description:
      "Blocks messages filled with combining unicode characters that distort the chat.",
  },
  {
    type: "csam",
    group: "content",
    name: "Child Safety Spam",
    description:
      "Detects the known wording of child sexual abuse material spam waves and acts on the first hit.",
    entriesLabel: "Extra patterns",
    entriesPlaceholder: "Example: telegram\\s*channel",
    entriesHint:
      "Optional regular expressions checked on top of the built-in list. Leave empty to only use the built-in list.",
    entriesAreRegex: true,
  },
  {
    type: "usernames",
    group: "members",
    name: "Forbidden Usernames",
    description:
      "Checks the username and nickname on join and on every name change, and acts when one of these words appears in it.",
    memberScoped: true,
    entriesLabel: "Forbidden words",
    entriesPlaceholder: "Example: free-nitro",
    entriesHint:
      'Matched anywhere inside the name, so "nitro" also catches "free-nitro-gift".',
  },
  {
    type: "accountAge",
    group: "members",
    name: "New Account Protection",
    description:
      "Flags members whose Discord account was created very recently, a strong signal for throwaway bot accounts.",
    memberScoped: true,
    limitLabel: "Minimum account age (days)",
    limitHint: "Accounts younger than this are flagged when they join.",
  },
  {
    type: "raid",
    group: "members",
    name: "Raid Protection",
    description:
      "Triggers when a burst of members joins at once, and acts on every member of that wave.",
    memberScoped: true,
    limitLabel: "Joins before it counts as a raid",
    windowLabel: "Time window (seconds)",
  },
];

export default moderationFilters;
