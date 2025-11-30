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
    const data = await prisma.streakSettings.findFirst({
      where: {
        guildId: guildId,
      },
    });

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Could not fetch ticket settings data" });
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { guildId, channel, role, enabled } = data;

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });
  if (!guildId) return NextResponse.json({ error: "Guild ID is missing"}, { status: 403 });

  const updated = await prisma.streakSettings.upsert({
    where: {
      guildId: guildId
    },
    update: { channel, role, enabled },
    create: { guildId, channel, role, enabled }
  })

  return NextResponse.json(updated);
}