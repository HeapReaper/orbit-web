import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { validateApiSessionAndGuildAdmin } from "@/app/lib/validateApiSessionAndGuildAdmin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const guildID = searchParams.get("guildId");

  if (!guildID) return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  // Validate authentication by session and if user is guild admin
  const session = await validateApiSessionAndGuildAdmin(guildID);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });

  try {
    const data = await prisma.anti_bot_settings.findUnique({ where: { guild_id: guildID } });

    return NextResponse.json(
      data
        ? {
          guildID: data.guild_id,
          enabled: data.enabled,
          timeWindow: data.time_window,
          channelLimit: data.channel_limit,
          punishment: data.punishment,
          forbiddenWords: data.forbidden_words,
          notificationChannel: data.notification_channel,
          jailRole: data.jailrole,
          excludeAdmins: data.exclude_admins,
          blockInvites: data.block_invites,
        }
        : {
          enabled: false,
          timeWindow: 10,
          channelLimit: 3,
          punishment: "none",
          forbiddenWords: [],
          notificationChannel: null,
          jailRole: null,
          excludeAdmins: false,
          blockInvites: false,
        }
    );
  } catch (err) {
    console.error("GET /api/anti-bot failed:", err);
    return NextResponse.json({ error: "Failed to fetch anti-bot settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const {
    guildID,
    enabled = false,
    timeWindow = 10,
    channelLimit = 3,
    punishment = "none",
    forbiddenWords = [],
    notificationChannel = null,
    jailRole = null,
    excludeAdmins = false,
    blockInvites = false,
  } = data;

  if (!guildID) return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  const session = await validateApiSessionAndGuildAdmin(guildID);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });

  try {
    const updated = await prisma.anti_bot_settings.upsert({
      where: { guild_id: guildID },
      update: {
        enabled,
        time_window: timeWindow,
        channel_limit: channelLimit,
        punishment,
        forbidden_words: forbiddenWords,
        notification_channel: notificationChannel,
        jailrole: jailRole,
        exclude_admins: excludeAdmins,
        block_invites: blockInvites,
      },
      create: {
        guild_id: guildID,
        enabled,
        time_window: timeWindow,
        channel_limit: channelLimit,
        punishment,
        forbidden_words: forbiddenWords,
        notification_channel: notificationChannel,
        jailrole: jailRole,
        exclude_admins: excludeAdmins,
        block_invites: blockInvites,
      },
    });

    return NextResponse.json({
      guildID: updated.guild_id,
      enabled: updated.enabled,
      timeWindow: updated.time_window,
      channelLimit: updated.channel_limit,
      punishment: updated.punishment,
      forbiddenWords: updated.forbidden_words,
      notificationChannel: updated.notification_channel,
      jailRole: updated.jailrole,
      excludeAdmins: updated.exclude_admins,
      blockInvites: updated.block_invites,
    });
  } catch (err) {
    console.error("POST /api/anti-bot failed:", err);
    return NextResponse.json({ error: "Failed to save anti-bot settings" }, { status: 500 });
  }
}
