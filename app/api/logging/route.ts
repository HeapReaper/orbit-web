import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { validateApiSessionAndGuildAdmin } from "@/app/lib/validateApiSessionAndGuildAdmin";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const guildId = req.nextUrl.searchParams.get("guildId");

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });
  if (!guildId) return NextResponse.json({ error: "guild_id is missing" }, { status: 403 });

  try {
    const data = await prisma.logging_settings.findUnique({ where: { guild_id: guildId } });
    return NextResponse.json(data ?? { enabled: false, channel: null, events: [] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch logging settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { guildId, channel, events, enabled } = data;

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });
  if (!guildId) return NextResponse.json({ error: "guild_id is missing" }, { status: 403 });

  try {
    const updated = await prisma.logging_settings.upsert({
      where: { guild_id: guildId },
      update: { channel, events, enabled },
      create: { guild_id: guildId, channel, events, enabled },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save logging settings" }, { status: 500 });
  }
}