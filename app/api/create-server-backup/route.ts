import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { validateApiSessionAndGuildAdmin } from "@/app/lib/validateApiSessionAndGuildAdmin";

export async function POST(req: Request) {
  try {
    const { guildId } = await req.json();
    if (!guildId) return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

    const session = await validateApiSessionAndGuildAdmin(guildId);
    if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });

    const dummyBackup = {
      roles: ["Admin", "Moderator", "Member"],
      channels: ["general", "rules"],
      emojis: ["🔥", "🎉"],
      timestamp: new Date().toISOString(),
    };

    const backup = await prisma.server_backups.create({
      data: {
        guild_id: guildId,
        backup: dummyBackup,
      },
    });

    return NextResponse.json({
      success: true,
      backup: {
        id: backup.id,
        guildId: backup.guild_id,
        backup: backup.backup,
        createdAt: backup.created_at,
      },
    });
  } catch (err) {
    console.error("Backup error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}