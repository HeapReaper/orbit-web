import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { validateApiSessionAndGuildAdmin } from "@/app/lib/validateApiSessionAndGuildAdmin";
import { botSettingsSchema } from "@/app/zod/botSettings";
import { rateLimitApi } from "@/app/lib/rateLimitApi";

export async function GET(req: NextRequest) {
  const guildId = req.nextUrl.searchParams.get("guildId");
  if (!guildId) return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });

  const rateLimitResp = await rateLimitApi(session.user.id, guildId, 10, 60);
  if (rateLimitResp) return rateLimitResp;

  try {
    const data = await prisma.bot_settings.findFirst({
      where: { guild_id: guildId },
    });

    if (!data) return NextResponse.json(null);

    return NextResponse.json({
      guildId: data.guild_id,
      nickname: data.nickname,
      language: data.language,
      updatesChannel: data.updates_channel,
      timezone: data.timezone,
      primaryColor: data.primary_color,
      secondaryColor: data.secondary_color,
      showInGuildList: data.show_in_guild_list,
      createdAt: data.created_at,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch bot settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { guildId, nickname, language, updatesChannel, timezone, primaryColor, secondaryColor, showInGuildList } = data;

  if (!botSettingsSchema.safeParse(data)) return NextResponse.json({ error: "Invalid form data" });

  if (!guildId) return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  const validation = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof validation === "string") return NextResponse.json({ error: validation }, { status: 403 });

  const updated = await prisma.bot_settings.upsert({
    where: { guild_id: guildId },
    update: {
      nickname,
      language,
      updates_channel: updatesChannel,
      timezone,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      show_in_guild_list: showInGuildList,
    },
    create: {
      guild_id: guildId,
      nickname,
      language,
      updates_channel: updatesChannel,
      timezone,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      show_in_guild_list: showInGuildList,
    },
  });

  return NextResponse.json({
    guildId: updated.guild_id,
    nickname: updated.nickname,
    language: updated.language,
    updatesChannel: updated.updates_channel,
    timezone: updated.timezone,
    primaryColor: updated.primary_color,
    secondaryColor: updated.secondary_color,
    showInGuildList: updated.show_in_guild_list,
    createdAt: updated.created_at,
  });
}