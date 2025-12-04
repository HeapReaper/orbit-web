import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { validateApiSessionAndGuildAdmin } from "@/app/lib/validateApiSessionAndGuildAdmin";

export async function GET(req: NextRequest) {
  const guildId = req.nextUrl.searchParams.get("guildId");
  if (!guildId) return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });

  try {
    const reminders = await prisma.bump_reminder_settings.findFirst({
      where: { guild_id: guildId },
    });

    if (!reminders) return NextResponse.json(null);

    return NextResponse.json({
      guildId: reminders.guild_id,
      channel: reminders.channel,
      message: reminders.message,
      interval: reminders.interval,
      enabled: reminders.enabled,
      createdAt: reminders.created_at,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { guildId, channel, message, interval, enabled } = data;

  if (!guildId) return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });

  const updated = await prisma.bump_reminder_settings.upsert({
    where: { guild_id: guildId },
    update: { channel, message, interval, enabled },
    create: { guild_id: guildId, channel, message, interval, enabled },
  });

  return NextResponse.json({
    guildId: updated.guild_id,
    channel: updated.channel,
    message: updated.message,
    interval: updated.interval,
    enabled: updated.enabled,
    createdAt: updated.created_at,
  });
}