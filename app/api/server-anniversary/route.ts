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
    const data = await prisma.server_anniversary_settings.findFirst({
      where: { guild_id: guildId },
    });

    return NextResponse.json(
      data ?? { messages: [""], channel: null, enabled: 0, randomize: false }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch server anniversary settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { guildId, messages, channel, time, enabled, randomize } = data;

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });
  if (!guildId) return NextResponse.json({ error: "guild_id is missing" }, { status: 403 });

  try {
    const updated = await prisma.server_anniversary_settings.upsert({
      where: { guild_id: guildId },
      update: { messages, channel, time, enabled, randomize },
      create: { guild_id: guildId, messages, channel, time, enabled, randomize },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update server anniversary settings" }, { status: 500 });
  }
}