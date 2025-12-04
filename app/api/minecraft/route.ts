import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { validateApiSessionAndGuildAdmin } from "@/app/lib/validateApiSessionAndGuildAdmin";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const guildId = searchParams.get("guildId");

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });
  if (!guildId) return NextResponse.json({ error: "guild_id is missing" }, { status: 403 });

  try {
    const data = await prisma.minecraft_settings.findUnique({
      where: { guild_id: guildId },
    });

    return NextResponse.json(
      data ?? {
        enabled: false,
        ip: "",
        port: 25565,
        notify_enabled: false,
        channel: null,
        players: [],
        max_players: 0,
        online: false,
      }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch Minecraft settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { guildId, ip, port, enabled, notifyEnabled, channel } = data;

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });
  if (!guildId) return NextResponse.json({ error: "guild_id is missing" }, { status: 403 });

  try {
    const updated = await prisma.minecraft_settings.upsert({
      where: { guild_id: guildId },
      update: { ip, port, enabled, notify_enabled: notifyEnabled, channel },
      create: { guild_id: guildId, ip, port, enabled, notify_enabled: notifyEnabled, channel },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save Minecraft settings" }, { status: 500 });
  }
}