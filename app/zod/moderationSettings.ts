import { z } from "zod";
import {
  moderationActions,
  moderationFilterTypes,
} from "@/app/types/moderation";

const snowflake = z.string().regex(/^\d{17,22}$/, "Invalid Discord ID");

/** Filters whose entries are regular expressions instead of literal words. */
const regexEntryFilters: string[] = ["patterns", "csam"];

export const moderationFilterSchema = z
  .object({
    type: z.enum(moderationFilterTypes),
    enabled: z.boolean(),
    alert: z.boolean(),
    log: z.boolean(),
    delete: z.boolean(),
    hardAction: z.enum(moderationActions),
    hardActionDuration: z.number().int().min(0).max(525600),
    thresholdMaximum: z.number().int().min(1).max(100),
    thresholdDuration: z.number().int().min(1).max(86400),
    limit: z.number().int().min(1).max(1000),
    window: z.number().int().min(1).max(3600),
    minimumLength: z.number().int().min(0).max(4000),
    entries: z.array(z.string().min(1).max(200)).max(500),
    entriesMode: z.enum(["blacklist", "whitelist"]),
    ignoredChannels: z.array(snowflake).max(100),
    ignoredRoles: z.array(snowflake).max(100),
  })
  .superRefine((filter, ctx) => {
    // A pattern that does not compile is silently skipped by the bot, so reject
    // it here instead of letting the guild believe it is protected.
    if (!regexEntryFilters.includes(filter.type)) return;

    filter.entries.forEach((entry, index) => {
      try {
        new RegExp(entry);
      } catch {
        ctx.addIssue({
          code: "custom",
          path: ["entries", index],
          message: `"${entry}" is not a valid regular expression`,
        });
      }
    });
  });

export const moderationEscalationSchema = z.object({
  warnings: z.number().int().min(1).max(100),
  action: z.enum(moderationActions),
  duration: z.number().int().min(0).max(525600),
});

export const moderationSettingsSchema = z.object({
  guildId: snowflake,
  enabled: z.boolean(),
  logChannel: snowflake.nullable(),
  muteRole: snowflake.nullable(),
  dmOnPunishment: z.boolean(),
  dmMessage: z.string().max(2000).nullable(),
  ignoreAdmins: z.boolean(),
  ignoreBots: z.boolean(),
  immuneRoles: z.array(snowflake).max(100),
  ignoredChannels: z.array(snowflake).max(100),
  deleteMessageDays: z.number().int().min(0).max(7),
  defaultMuteDuration: z.number().int().min(1).max(525600),
  warnExpiryDays: z.number().int().min(0).max(365),
  escalations: z.array(moderationEscalationSchema).max(20),
  filters: z.array(moderationFilterSchema).max(moderationFilterTypes.length),
});
