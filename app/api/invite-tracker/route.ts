import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getRedisClient } from "@/app/lib/redis";
import { validateApiSessionAndGuildAdmin } from "@/app/lib/validateApiSessionAndGuildAdmin";

const redis = getRedisClient();

export async function GET(req: NextRequest) {
  const guildId = req.nextUrl.searchParams.get("guildId");
  if (!guildId) return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });

  const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
  if (!DISCORD_BOT_TOKEN) return NextResponse.json({ error: "Missing bot token" }, { status: 500 });

  const cacheKey = `invite_tracker:${guildId}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return NextResponse.json(JSON.parse(cached));

    const discordRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/invites`, {
      headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
    });

    if (!discordRes.ok) {
      const text = await discordRes.text();
      return NextResponse.json({ error: `Discord API error: ${text}` }, { status: discordRes.status });
    }

    const discordInvites = await discordRes.json();

    const dbInvites = await prisma.invite_tracker_invite.findMany({
      where: { guild_id: guildId },
    });

    const merged = discordInvites.map((inv: any) => {
      const db = dbInvites.find((d) => d.invite_code === inv.code);
      return {
        code: inv.code,
        url: `https://discord.gg/${inv.code}`,
        uses: inv.uses,
        inviter: inv.inviter?.username ?? "Unknown",
        channel: inv.channel?.name ?? "Unknown",
        type: db?.invite_type ?? "",
        expiresAt: inv.expiresAt ?? null,
      };
    });

    const settings = await prisma.guild_invite_settings.findUnique({ where: { guild_id: guildId } });

    const result = { enabled: settings?.enabled ?? false, invites: merged };

    await redis.set(cacheKey, JSON.stringify(result), "EX", 180);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Error fetching invites:", err);
    return NextResponse.json({ error: "Failed to fetch invites" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { guildId, enabled, invites } = body;
  if (!guildId) return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });

  try {
    await prisma.guild_invite_settings.upsert({
      where: { guild_id: guildId },
      update: { enabled },
      create: { guild_id: guildId, enabled },
    });

    await prisma.invite_tracker_invite.deleteMany({ where: { guild_id: guildId } });
    await prisma.invite_tracker_invite.createMany({
      data: invites.map((i: any) => ({
        guild_id: guildId,
        invite_code: i.code,
        invite_type: i.type ?? null,
      })),
    });

    const cacheKey = `invite_tracker:${guildId}`;
    await redis.del(cacheKey);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update invites" }, { status: 500 });
  }
}