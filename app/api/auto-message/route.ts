import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { validateApiSessionAndGuildAdmin } from "@/app/lib/validateApiSessionAndGuildAdmin";

export async function GET(req: NextRequest) {
  const guildId = req.nextUrl.searchParams.get("guildId");

  if (!guildId) return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });

  const autoMessages = await prisma.auto_message.findMany({
    where: { guild_id: guildId },
    orderBy: { id: "asc" },
  });

  // Map snake_case → camelCase voor response
  const response = autoMessages.map((msg) => ({
    id: msg.id,
    guildId: msg.guild_id,
    message: msg.message,
    channel: msg.channel,
    time: msg.time,
    days: msg.days,
    enabled: msg.enabled,
    createdAt: msg.created_at,
    updatedAt: msg.updated_at,
  }));

  return NextResponse.json(response);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { guildId, autoMessages } = body;

  if (!guildId) return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  const validation = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof validation === "string") return NextResponse.json({ error: validation }, { status: 403 });

  try {
    await prisma.auto_message.deleteMany({ where: { guild_id: guildId } });

    const createData = autoMessages.map((msg: any) => ({
      guild_id: guildId,
      message: msg.message,
      channel: msg.channel,
      time: msg.time,
      days: msg.days ?? [],
      enabled: msg.enabled,
    }));

    await prisma.auto_message.createMany({ data: createData });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
