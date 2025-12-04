import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { validateApiSessionAndGuildAdmin } from "@/app/lib/validateApiSessionAndGuildAdmin";

export async function GET(req: NextRequest) {
  const guildId = req.nextUrl.searchParams.get("guildId");
  if (!guildId) return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });

  try {
    const data = await prisma.leave_message_settings.findFirst({ where: { guild_id: guildId } });
    return NextResponse.json(
      data || { messages: [""], channel: null, enabled: 0, randomize: false }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch leave message settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { guildId, messages, channel, enabled, randomize } = body;
  if (!guildId) return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });

  try {
    const updated = await prisma.leave_message_settings.upsert({
      where: { guild_id: guildId },
      update: { messages, channel, enabled, randomize },
      create: { guild_id: guildId, messages, channel, enabled, randomize },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update leave message settings" }, { status: 500 });
  }
}