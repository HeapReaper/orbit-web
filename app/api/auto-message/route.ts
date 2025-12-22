import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { validateApiSessionAndGuildAdmin } from "@/app/lib/validateApiSessionAndGuildAdmin";

export async function GET(req: NextRequest) {
  const guildId = req.nextUrl.searchParams.get("guildId");

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string")
    return NextResponse.json({ error: session }, { status: 403 });

  if (!guildId)
    return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  const autoMessages = await prisma.autoMessage.findMany({
    where: { guildId },
    orderBy: { id: "asc" },
  });

  return NextResponse.json(autoMessages);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { guildId, autoMessages } = body;

  const validation = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof validation === "string")
    return NextResponse.json({ error: validation }, { status: 403 });

  if (!guildId)
    return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  try {
    await Promise.all(
      autoMessages.map((msg: { id: any; messageType: string; message: any; embed: any; channel: any; time: any; days: any; scheduleType: any; enabled: any; }) => prisma.autoMessage.upsert({
        where: { id: msg.id },
        update: {
          messageType: msg.messageType,
          message: msg.message,
          embed: msg.messageType === "embed" ? msg.embed : null,
          channel: msg.channel,
          time: msg.time,
          days: msg.days ?? [],
          scheduleType: msg.scheduleType,
          enabled: msg.enabled
        },
        create: {
          guildId,
          messageType: msg.messageType,
          message: msg.message,
          embed: msg.messageType === "embed" ? msg.embed : null,
          channel: msg.channel,
          time: msg.time,
          days: msg.days ?? [],
          scheduleType: msg.scheduleType,
          enabled: msg.enabled
        }
      }))
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}