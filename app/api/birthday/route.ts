import { NextRequest, NextResponse } from "next/server";
import { rateLimitApi } from "@/app/lib/rateLimitApi";
import { prisma } from "@/app/lib/prisma";
import { validateApiSessionAndGuildAdmin } from "@/app/lib/validateApiSessionAndGuildAdmin";

export async function GET(req: NextRequest) {
  const guildId = req.nextUrl.searchParams.get("guildId");

  if (!guildId) return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });

  const rateLimitResp = await rateLimitApi(`${session.user.id}:getRequest`, guildId, 10, 60);
  if (rateLimitResp) return rateLimitResp;

  try {
    const data = await prisma.birthday_settings.findFirst({
      where: { guild_id: guildId },
    });

    const response = data
      ? {
        guildId: data.guild_id,
        channel: data.channel,
        message: data.message,
        time: data.time,
        enabled: data.enabled,
        createdAt: data.created_at,
      }
      : { guildId, channel: null, message: null, time: null, enabled: false };

    return NextResponse.json(response);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch birthday settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { guildId, channel, message, time, enabled } = data;

  if (!guildId) return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });

  const rateLimitResp = await rateLimitApi(`${session.user.id}:postRequest`, guildId, 10, 60);
  if (rateLimitResp) return rateLimitResp;

  try {
    const updated = await prisma.birthday_settings.upsert({
      where: { guild_id: guildId },
      update: { channel, message, time, enabled },
      create: { guild_id: guildId, channel, message, time, enabled },
    });

    const response = {
      guildId: updated.guild_id,
      channel: updated.channel,
      message: updated.message,
      time: updated.time,
      enabled: updated.enabled,
      createdAt: updated.created_at,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update birthday settings" }, { status: 500 });
  }
}