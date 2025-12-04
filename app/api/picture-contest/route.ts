import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { validateApiSessionAndGuildAdmin } from "@/app/lib/validateApiSessionAndGuildAdmin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const guildId = searchParams.get("guildId");

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });
  if (!guildId) return NextResponse.json({ error: "guild_id is missing" }, { status: 403 });

  try {
    let data = await prisma.picture_contest_settings.findUnique({
      where: { guild_id: guildId },
      include: { contests: true },
    });

    if (!data) {
      data = await prisma.picture_contest_settings.create({
        data: { guild_id: guildId },
        include: { contests: true },
      });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to fetch picture contest data:", err);
    return NextResponse.json({ error: "Failed to fetch picture contest data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { guildId, contests } = body;

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });
  if (!guildId) return NextResponse.json({ error: "guild_id is missing" }, { status: 403 });

  try {
    await prisma.picture_contest_settings.upsert({
      where: { guild_id: guildId },
      update: {},
      create: { guild_id: guildId },
    });

    await prisma.picture_contest_item.deleteMany({ where: { guild_id: guildId } });

    if (Array.isArray(contests) && contests.length > 0) {
      await prisma.picture_contest_item.createMany({
        data: contests.map((c: any) => ({
          guild_id: guildId,
          name: c.name || "New Contest",
          contest_channel: c.contestChannel,
          announce_channel: c.announceChannel,
          vote_emoji: c.voteEmoji || "👍",
          vote_type: c.voteType || "highest",
          required_votes: c.voteType === "fixed" ? c.requiredVotes : null,
          schedule: c.schedule || "end_month",
          enabled: c.enabled ?? true,
        })),
      });
    }

    const updated = await prisma.picture_contest_settings.findUnique({
      where: { guild_id: guildId },
      include: { contests: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Failed to save picture contest settings:", err);
    return NextResponse.json({ error: "Failed to save picture contest settings" }, { status: 500 });
  }
}