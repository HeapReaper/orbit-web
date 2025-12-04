import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { validateApiSessionAndGuildAdmin } from "@/app/lib/validateApiSessionAndGuildAdmin";

export async function GET(req: NextRequest) {
  const guildId = req.nextUrl.searchParams.get("guildId");
  if (!guildId) return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });

  try {
    const data = await prisma.introduction_settings.findFirst({ where: { guild_id: guildId } });
    if (!data) return NextResponse.json({
      guildId,
      enabled: false,
      channel: null,
      maxMessages: 1,
      autoReply: null,
      autoEmoji: null,
      autoDelete: false
    });
    return NextResponse.json({
      guildId: data.guild_id,
      enabled: data.enabled,
      channel: data.channel,
      maxMessages: data.max_messages,
      autoReply: data.auto_reply,
      autoEmoji: data.auto_emoji,
      autoDelete: data.auto_delete,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch introduction settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { guildId, channel, enabled, maxMessages, autoReply, autoEmoji, autoDelete } = body;
  if (!guildId) return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });

  try {
    const updated = await prisma.introduction_settings.upsert({
      where: { guild_id: guildId },
      update: {
        channel,
        enabled,
        max_messages: maxMessages,
        auto_reply: autoReply,
        auto_emoji: autoEmoji,
        auto_delete: autoDelete,
      },
      create: {
        guild_id: guildId,
        channel,
        enabled,
        max_messages: maxMessages,
        auto_reply: autoReply,
        auto_emoji: autoEmoji,
        auto_delete: autoDelete,
      },
    });

    return NextResponse.json({
      guildId: updated.guild_id,
      enabled: updated.enabled,
      channel: updated.channel,
      maxMessages: updated.max_messages,
      autoReply: updated.auto_reply,
      autoEmoji: updated.auto_emoji,
      autoDelete: updated.auto_delete,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save introduction settings" }, { status: 500 });
  }
}