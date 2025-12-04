import { NextRequest, NextResponse } from "next/server";
import { validateApiSessionAndGuildAdmin } from "@/app/lib/validateApiSessionAndGuildAdmin";

const DISCORD_API_BASE = "https://discord.com/api/v10";
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { guildId, count } = data;

    if (!guildId) return NextResponse.json({ error: "Guild ID is missing" }, { status: 400 });
    if (!count) return NextResponse.json({ error: "Count is missing" }, { status: 400 });
    if (!BOT_TOKEN) return NextResponse.json({ error: "Bot token not set" }, { status: 500 });

    const session = await validateApiSessionAndGuildAdmin(guildId);
    if (typeof session === "string") {
      return NextResponse.json({ error: session }, { status: 403 });
    }

    const roles: { id: string; name: string }[] = [];

    for (let i = 1; i <= count; i++) {
      const response = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/roles`, {
        method: "POST",
        headers: {
          "Authorization": `Bot ${BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `Level ${i}`,
          hoist: false,
          mentionable: false,
          reason: "Leveling system",
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        return NextResponse.json({ error: `Failed to create role ${i}: ${text}` }, { status: 500 });
      }

      const roleData = await response.json();
      roles.push({ id: roleData.id, name: roleData.name });
    }

    return NextResponse.json({ roles });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to generate level roles" }, { status: 500 });
  }
}