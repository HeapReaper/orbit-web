import type { ModerationFilterType } from "@/app/types/moderation";

export interface ModerationFilterDefinition {
  type: ModerationFilterType;
  name: string;
  description: string;
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
}

const moderationFilters: ModerationFilterDefinition[] = [
  {
    type: "words",
    name: "Word Filter",
    description:
      "Blocks messages containing words or phrases you do not want in your server.",
    entriesLabel: "Blocked words",
    entriesPlaceholder: "Example: badword",
  },
  {
    type: "invites",
    name: "Invite Links",
    description:
      "Blocks Discord invite links so members cannot advertise other servers.",
    entriesLabel: "Allowed server IDs",
    entriesPlaceholder: "Example: 123456789012345678",
  },
  {
    type: "links",
    name: "Links",
    description:
      "Blocks links posted in your server. Use the list to allow or block specific domains.",
    entriesLabel: "Domains",
    entriesPlaceholder: "Example: youtube.com",
    entriesModeSelectable: true,
  },
  {
    type: "spam",
    name: "Message Spam",
    description:
      "Triggers when a member sends too many messages in a short amount of time.",
    limitLabel: "Max messages",
    limitHint: "Amount of messages allowed inside the time window.",
    windowLabel: "Time window (seconds)",
  },
  {
    type: "mentions",
    name: "Mention Spam",
    description:
      "Triggers on messages with too many mentions, including @everyone and @here.",
    limitLabel: "Max mentions per message",
  },
  {
    type: "capitals",
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
    name: "New Lines",
    description:
      "Blocks messages that stretch the chat by using too many line breaks.",
    limitLabel: "Max new lines",
  },
  {
    type: "attachments",
    name: "Attachments",
    description:
      "Triggers when a member uploads too many attachments in a short amount of time.",
    limitLabel: "Max attachments",
    windowLabel: "Time window (seconds)",
  },
  {
    type: "duplicates",
    name: "Message Duplication",
    description:
      "Triggers when a member repeats the same message, the classic copy-paste spam.",
    limitLabel: "Max duplicates",
    windowLabel: "Time window (seconds)",
  },
  {
    type: "reactions",
    name: "Reaction Spam",
    description:
      "Triggers when a member adds too many reactions in a short amount of time.",
    limitLabel: "Max reactions",
    windowLabel: "Time window (seconds)",
  },
  {
    type: "zalgo",
    name: "Zalgo & Unicode Abuse",
    description:
      "Blocks messages filled with combining unicode characters that distort the chat.",
  },
];

export default moderationFilters;
