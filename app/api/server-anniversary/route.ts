import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { validateApiSessionAndGuildAdmin } from "@/app/lib/validateApiSessionAndGuildAdmin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const guildId = searchParams.get("guildId");

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });
  if (!guildId) return NextResponse.json({ error: "Guild ID is missing"}, { status: 403 });

  try {
    const data = await prisma.serverAnniversarySettings.findFirst({
      where: { guildId },
    });
    return NextResponse.json(
      data || { messages: [""], channel: null, enabled: 0, randomize: false }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch welcome_message_settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const {
    guildId,
    messageType,
    message,
    embed,
    channel,
    time,
    enabled,
    randomize
  } = await req.json();

  console.log(messageType);
  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });
  if (!guildId) return NextResponse.json({ error: "Guild ID is missing"}, { status: 403 });

  try {
    const updated = await prisma.serverAnniversarySettings.upsert({
      where: { guildId },
      update: {
        messageType,
        message,
        embed,
        channel,
        time,
        enabled,
        randomize,
      },
      create: {
        guildId,
        messageType,
        message,
        embed,
        channel,
        time,
        enabled,
        randomize,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update welcome_message_settings" }, { status: 500 });
  }
}