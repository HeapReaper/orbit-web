import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { validateApiSessionAndGuildAdmin } from "@/app/lib/validateApiSessionAndGuildAdmin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const guildId = searchParams.get("guildId");

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string")
    return NextResponse.json({ error: session }, { status: 403 });
  if (!guildId)
    return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  try {
    const data = await prisma.youtubeWatcher.findUnique({
      where: { guildId },
      include: { channels: true },
    });

    return NextResponse.json({
      enabled: data?.enabled ?? false,
      channels: data?.channels ?? [],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch Youtube watcher" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { guildId, enabled, channels } = body as {
    guildId: string;
    enabled: boolean;
    channels: { youtubeChannel: string; discordChannel: string }[];
  };

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string")
    return NextResponse.json({ error: session }, { status: 403 });
  if (!guildId)
    return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  const validChannels = (Array.isArray(channels) ? channels : []).filter(
    (c) => c.youtubeChannel?.trim(),
  );

  try {
    const watcher = await prisma.youtubeWatcher.upsert({
      where: { guildId },
      update: { enabled },
      create: { guildId, enabled },
    });

    await prisma.youtubeWatcherChannel.deleteMany({
      where: { watcherId: watcher.id },
    });

    if (validChannels.length > 0) {
      await prisma.youtubeWatcherChannel.createMany({
        data: validChannels.map((c) => ({
          watcherId: watcher.id,
          youtubeChannel: c.youtubeChannel.trim(),
          discordChannel: c.discordChannel ?? "",
        })),
      });
    }

    const updated = await prisma.youtubeWatcher.findUnique({
      where: { guildId },
      include: { channels: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to save Youtube watcher" },
      { status: 500 },
    );
  }
}