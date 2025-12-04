import { NextRequest, NextResponse } from "next/server";
import { rateLimitApi } from "@/app/lib/rateLimitApi";
import { prisma } from "@/app/lib/prisma";
import { validateApiSessionAndGuildAdmin } from "@/app/lib/validateApiSessionAndGuildAdmin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const guildId = searchParams.get("guildId");

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });
  if (!guildId) return NextResponse.json({ error: "guild_id is missing" }, { status: 403 });

  const rateLimitResp = await rateLimitApi(`${session.user.id}:getRequest`, guildId, 10, 60);
  if (rateLimitResp) return rateLimitResp;

  try {
    const data = await prisma.message_report_settings.findFirst({
      where: { guild_id: guildId },
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { guildId, enabled, channel } = data;

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });
  if (!guildId) return NextResponse.json({ error: "guild_id is missing" }, { status: 403 });

  const rateLimitResp = await rateLimitApi(`${session.user.id}:postRequest`, guildId, 10, 60);
  if (rateLimitResp) return rateLimitResp;

  try {
    const updated = await prisma.message_report_settings.upsert({
      where: { guild_id: guildId },
      update: { enabled, channel },
      create: { guild_id: guildId, enabled, channel },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update message report settings" }, { status: 500 });
  }
}