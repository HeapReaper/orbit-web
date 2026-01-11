import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { validateApiSessionAndGuildAdmin } from "@/app/lib/validateApiSessionAndGuildAdmin";
import cleanMessage from "@/app/lib/cleanMessage";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const guildId = searchParams.get("guildId");

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string")
    return NextResponse.json({ error: session }, { status: 403 });
  if (!guildId)
    return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  try {
    const reminders = await prisma.bumpReminderSettings.findFirst({
      where: { guildId },
    });
    return NextResponse.json(reminders);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch reminders" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  const {
    guildId,
    channel,
    messageType,
    message,
    embed,
    interval,
    xpBoost,
    rewardRole,
    boostLeaderboard,
    leaderboardAutoUpdates,
    leaderboardChannel,
    autoLeaderboardInterval,
  } = data;

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string")
    return NextResponse.json({ error: session }, { status: 403 });
  if (!guildId)
    return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  const updated = await prisma.bumpReminderSettings.upsert({
    where: { guildId },
    update: {
      channel,
      messageType,
      message,
      embed,
      interval,
      xpBoost,
      rewardRole,
      boostLeaderboard,
      leaderboardAutoUpdates,
      leaderboardChannel,
      autoLeaderboardInterval,
    },
    create: {
      guildId,
      channel,
      messageType,
      message,
      embed,
      interval,
      xpBoost,
      rewardRole,
      boostLeaderboard,
      leaderboardAutoUpdates,
      leaderboardChannel,
      autoLeaderboardInterval,
    },
  });

  return NextResponse.json(updated);
}
