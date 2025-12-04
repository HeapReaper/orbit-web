import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { validateApiSessionAndGuildAdmin } from "@/app/lib/validateApiSessionAndGuildAdmin";
import { rateLimitApi } from "@/app/lib/rateLimitApi";

export async function GET(req: NextRequest) {
  const guildId = req.nextUrl.searchParams.get("guildId");
  if (!guildId) return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });

  const rateLimitResp = await rateLimitApi(`${session.user.id}:getRequest`, guildId, 10, 60);
  if (rateLimitResp) return rateLimitResp;

  try {
    const data = await prisma.channel_of_fame.findUnique({
      where: { guild_id: guildId },
    });

    return NextResponse.json(
      data ?? { enabled: false, channel: null, emoji: "", amount: 0 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch Channel of Fame settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { guildId, channel, emoji, amount, enabled } = data;
  if (!guildId) return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });

  const rateLimitResp = await rateLimitApi(`${session.user.id}:postRequest`, guildId, 10, 60);
  if (rateLimitResp) return rateLimitResp;

  try {
    const updated = await prisma.channel_of_fame.upsert({
      where: { guild_id: guildId },
      update: { channel, emoji, amount, enabled },
      create: { guild_id: guildId, channel, emoji, amount, enabled },
    });

    return NextResponse.json({
      guildId: updated.guild_id,
      channel: updated.channel,
      emoji: updated.emoji,
      amount: updated.amount,
      enabled: updated.enabled,
      createdAt: updated.created_at,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save Channel of Fame settings" }, { status: 500 });
  }
}