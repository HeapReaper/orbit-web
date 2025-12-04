import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { validateApiSessionAndGuildAdmin } from "@/app/lib/validateApiSessionAndGuildAdmin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const guildId = searchParams.get("guildId");

    if (!guildId) return NextResponse.json({ error: "guild_id is missing" }, { status: 400 });

    const session = await validateApiSessionAndGuildAdmin(guildId);
    if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });

    const settings = await prisma.server_backup_settings.findFirst({
      where: { guild_id: guildId },
      include: {
        backups: {
          orderBy: { created_at: "desc" },
        },
      },
    });

    return NextResponse.json({
      enabled: settings?.enabled ?? false,
      channel: settings?.channel ?? "",
      frequency: settings?.frequency ?? "weekly",
      time: settings?.time ?? "00:00",
      content: settings?.content ?? [],
      backups: settings?.backups ?? [],
    });
  } catch (err) {
    console.error("GET backups error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { guildId, backupContent } = await req.json();

    if (!guildId) return NextResponse.json({ error: "guild_id is missing" }, { status: 400 });

    const session = await validateApiSessionAndGuildAdmin(guildId);
    if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });

    const backupData = backupContent ?? {
      roles: ["Admin", "Moderator", "Member"],
      channels: ["general", "rules"],
      emojis: ["🔥", "🎉"],
      timestamp: new Date().toISOString(),
    };

    const backup = await prisma.server_backups.create({
      data: { guild_id: guildId, backup: backupData },
    });

    return NextResponse.json({ success: true, backup });
  } catch (err) {
    console.error("POST backup error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { guildId, channel, frequency, time, content, enabled } = await req.json();

    if (!guildId) return NextResponse.json({ error: "guild_id is missing" }, { status: 400 });

    const session = await validateApiSessionAndGuildAdmin(guildId);
    if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });

    const updatedSettings = await prisma.server_backup_settings.upsert({
      where: { guild_id: guildId },
      update: {
        channel,
        frequency,
        time,
        content,
        enabled,
      },
      create: {
        guild_id: guildId,
        channel,
        frequency,
        time,
        content,
        enabled,
      },
    });

    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (err) {
    console.error("PUT settings error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { backupId, guildId } = await req.json();

    if (!guildId) return NextResponse.json({ error: "guild_id is missing" }, { status: 400 });
    if (!backupId) return NextResponse.json({ error: "Missing backup_id" }, { status: 400 });

    const session = await validateApiSessionAndGuildAdmin(guildId);
    if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });

    await prisma.server_backups.delete({
      where: { id: parseInt(backupId, 10) },
    });

    return NextResponse.json({ success: true, deletedBackupId: backupId });
  } catch (err) {
    console.error("DELETE backup error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}