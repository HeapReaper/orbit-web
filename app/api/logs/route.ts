import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { validateApiSessionAndGuildAdmin } from "@/app/lib/validateApiSessionAndGuildAdmin";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { guildId, type, time_range } = data;

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });
  if (!guildId) return NextResponse.json({ error: "guild_id is missing" }, { status: 403 });

  let startDate: Date | undefined;
  const now = new Date();

  if (time_range === "1w") {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (time_range === "1m") {
    startDate = new Date();
    startDate.setMonth(now.getMonth() - 1);
  }

  const whereClause: any = { guild_id: guildId };
  if (startDate) whereClause.timestamp = { gte: startDate };

  if (type === "guild") {
    const logs = await prisma.guild_log.findMany({
      where: whereClause,
      orderBy: { timestamp: "desc" },
    });

    return NextResponse.json(logs);
  }

  if (type === "dashboard") {
    const logs = await prisma.dashboard_log.findMany({
      where: whereClause,
      orderBy: { timestamp: "desc" },
    });

    return NextResponse.json(logs);
  }

  return NextResponse.json({ error: "Invalid log type" });
}