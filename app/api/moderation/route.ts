import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { rateLimitApi } from "@/app/lib/rateLimitApi";
import { validateApiSessionAndGuildAdmin } from "@/app/lib/validateApiSessionAndGuildAdmin";
import {
  defaultModerationFilter,
  defaultModerationSettings,
  type ModerationEscalation,
  type ModerationFilterType,
  moderationFilterTypes,
} from "@/app/types/moderation";
import { moderationSettingsSchema } from "@/app/zod/moderationSettings";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const guildId = searchParams.get("guildId");

  // Validate authentication by session and if user is guild admin
  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string")
    return NextResponse.json({ error: session }, { status: 403 });
  if (!guildId)
    return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  try {
    const data = await prisma.moderationSettings.findUnique({
      where: { guildId },
      include: { filters: true },
    });

    if (!data) return NextResponse.json(defaultModerationSettings());

    // Every filter the guild never touched falls back to its defaults, so the
    // dashboard always receives the complete list.
    const filters = moderationFilterTypes.map((type) => {
      const stored = data.filters.find((f) => f.type === type);
      if (!stored) return defaultModerationFilter(type);

      return {
        type,
        enabled: stored.enabled,
        alert: stored.alert,
        log: stored.log,
        delete: stored.delete,
        hardAction: stored.hardAction,
        hardActionDuration: stored.hardActionDuration,
        thresholdMaximum: stored.thresholdMaximum,
        thresholdDuration: stored.thresholdDuration,
        limit: stored.limit,
        window: stored.window,
        minimumLength: stored.minimumLength,
        entries: stored.entries,
        entriesMode: stored.entriesMode,
        ignoredChannels: stored.ignoredChannels,
        ignoredRoles: stored.ignoredRoles,
      };
    });

    return NextResponse.json({
      enabled: data.enabled,
      logChannel: data.logChannel,
      muteRole: data.muteRole,
      dmOnPunishment: data.dmOnPunishment,
      dmMessage: data.dmMessage,
      ignoreAdmins: data.ignoreAdmins,
      ignoreBots: data.ignoreBots,
      immuneRoles: data.immuneRoles,
      ignoredChannels: data.ignoredChannels,
      deleteMessageDays: data.deleteMessageDays,
      defaultMuteDuration: data.defaultMuteDuration,
      warnExpiryDays: data.warnExpiryDays,
      escalations: (data.escalations ??
        []) as unknown as ModerationEscalation[],
      filters,
    });
  } catch (err) {
    console.error("GET /api/moderation failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch moderation settings" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const guildId = body?.guildId;

  // Validate authentication by session and if user is guild admin
  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string")
    return NextResponse.json({ error: session }, { status: 403 });
  if (!guildId)
    return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  // Rate limit
  const rateLimitResp = await rateLimitApi(session.user.id, guildId, 30, 60);
  if (rateLimitResp) return rateLimitResp;

  const parsed = moderationSettingsSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid form data", issues: parsed.error.issues },
      { status: 400 },
    );

  const { filters, escalations, ...settings } = parsed.data;

  // A mute or timeout punishment is useless without a role to apply
  if (!settings.muteRole) {
    const needsMuteRole =
      filters.some((f) => f.enabled && f.hardAction === "mute") ||
      escalations.some((e) => e.action === "mute");

    if (needsMuteRole)
      return NextResponse.json(
        { error: "A mute role is required when muting members" },
        { status: 400 },
      );
  }

  const payload = {
    enabled: settings.enabled,
    logChannel: settings.logChannel,
    muteRole: settings.muteRole,
    dmOnPunishment: settings.dmOnPunishment,
    dmMessage: settings.dmMessage,
    ignoreAdmins: settings.ignoreAdmins,
    ignoreBots: settings.ignoreBots,
    immuneRoles: settings.immuneRoles,
    ignoredChannels: settings.ignoredChannels,
    deleteMessageDays: settings.deleteMessageDays,
    defaultMuteDuration: settings.defaultMuteDuration,
    warnExpiryDays: settings.warnExpiryDays,
    escalations: [...escalations].sort((a, b) => a.warnings - b.warnings),
  };

  try {
    await prisma.$transaction([
      prisma.moderationSettings.upsert({
        where: { guildId },
        update: payload,
        create: { guildId, ...payload },
      }),
      ...filters.map((filter) => {
        const { type, entries, ...rest } = filter;
        const data = {
          ...rest,
          // Drop empty rows the dashboard keeps around for editing
          entries: entries.map((e) => e.trim()).filter((e) => e !== ""),
        };

        return prisma.moderationFilter.upsert({
          where: { guildId_type: { guildId, type } },
          update: data,
          create: { guildId, type, ...data },
        });
      }),
    ]);

    return NextResponse.json({ ...parsed.data, ...payload, filters });
  } catch (err) {
    console.error("POST /api/moderation failed:", err);
    return NextResponse.json(
      { error: "Failed to save moderation settings" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const guildId = searchParams.get("guildId");
  const type = searchParams.get("type") as ModerationFilterType | null;

  // Validate authentication by session and if user is guild admin
  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string")
    return NextResponse.json({ error: session }, { status: 403 });
  if (!guildId)
    return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });
  if (!type || !moderationFilterTypes.includes(type))
    return NextResponse.json({ error: "Unknown filter" }, { status: 400 });

  try {
    await prisma.moderationFilter.deleteMany({ where: { guildId, type } });
    return NextResponse.json(defaultModerationFilter(type));
  } catch (err) {
    console.error("DELETE /api/moderation failed:", err);
    return NextResponse.json(
      { error: "Failed to reset filter" },
      { status: 500 },
    );
  }
}
