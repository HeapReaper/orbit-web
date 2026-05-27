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

  const settings = await prisma.qotdSettings.findUnique({
    where: { guildId },
  });

  return NextResponse.json(settings ?? {});
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { guildId, channel, time, scheduleType, days, monthlyDate, enabled, aiPrompt } = body;

  const validation = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof validation === "string")
    return NextResponse.json({ error: validation }, { status: 403 });

  if (!guildId)
    return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  try {
    await prisma.qotdSettings.upsert({
      where: { guildId },
      update: {
        channel: channel || null,
        time: time || "12:00",
        scheduleType: scheduleType || "daily",
        days: days ?? [],
        monthlyDate: monthlyDate ?? null,
        enabled,
        aiPrompt: aiPrompt || "",
      },
      create: {
        guildId,
        channel: channel || null,
        time: time || "12:00",
        scheduleType: scheduleType || "daily",
        days: days ?? [],
        monthlyDate: monthlyDate ?? null,
        enabled,
        aiPrompt: aiPrompt || "",
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}