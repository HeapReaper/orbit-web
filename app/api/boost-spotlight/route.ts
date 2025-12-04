import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { validateApiSessionAndGuildAdmin } from "@/app/lib/validateApiSessionAndGuildAdmin";

export async function GET(req: NextRequest) {
  const guildId = req.nextUrl.searchParams.get("guildId");

  if (!guildId) return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });

  try {
    const data = await prisma.boost_spotlight_settings.findFirst({
      where: { guild_id: guildId },
    });

    const response = data
      ? {
        guildId: data.guild_id,
        messages: data.messages,
        channel: data.channel,
        enabled: data.enabled,
        randomize: data.randomize,
        createdAt: data.created_at,
      }
      : { guildId, messages: [""], channel: null, enabled: false, randomize: false };

    return NextResponse.json(response);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch boost spotlight settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { guildId, messages, channel, enabled, randomize } = data;

  if (!guildId) return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });

  try {
    const updated = await prisma.boost_spotlight_settings.upsert({
      where: { guild_id: guildId },
      update: { messages, channel, enabled, randomize },
      create: { guild_id: guildId, messages, channel, enabled, randomize },
    });

    const response = {
      guildId: updated.guild_id,
      messages: updated.messages,
      channel: updated.channel,
      enabled: updated.enabled,
      randomize: updated.randomize,
      createdAt: updated.created_at,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update boost spotlight settings" }, { status: 500 });
  }
}