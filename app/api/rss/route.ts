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
    const settings = await prisma.rssSettings.findUnique({
      where: { guildId },
      include: { Rss: true },
    });

    return NextResponse.json({
      enabled: settings?.enabled ?? false,
      channelId: settings?.channelId ?? "",
      urls: settings?.Rss.map((r) => r.url) ?? [],
    });
  } catch (err) {
    console.error("Error fetching RSS settings:", err);
    return NextResponse.json(
      { error: "Failed to fetch RSS settings" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { guildId, enabled, channelId, urls } = body;

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string")
    return NextResponse.json({ error: session }, { status: 403 });
  if (!guildId)
    return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  try {
    await prisma.rssSettings.upsert({
      where: { guildId },
      update: { enabled, channelId: channelId || null },
      create: { guildId, enabled, channelId: channelId || null },
    });

    await prisma.rss.deleteMany({ where: { guildId } });

    if (urls && urls.length > 0) {
      await prisma.rss.createMany({
        data: urls.map((url: string) => ({ guildId, url })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error saving RSS settings:", err);
    return NextResponse.json(
      { error: "Failed to save RSS settings" },
      { status: 500 },
    );
  }
}