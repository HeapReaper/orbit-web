import { NextRequest, NextResponse } from "next/server";
import { validateApiSessionAndGuildAdmin } from "@/app/lib/validateApiSessionAndGuildAdmin";

const DISCORD_API = "https://discord.com/api/v10";
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

export async function POST(req: NextRequest) {
  try {
    const { guildId, backup } = await req.json();

    const session = await validateApiSessionAndGuildAdmin(guildId);
    if (typeof session === "string")
      return NextResponse.json({ error: session }, { status: 403 });
    if (!guildId)
      return NextResponse.json(
        { error: "Guild ID is missing" },
        { status: 403 },
      );

    if (!backup)
      return NextResponse.json({ error: "Backup required" }, { status: 400 });

    // Fetch existing roles and channels
    const [existingRolesRes, existingChannelsRes] = await Promise.all([
      fetch(`${DISCORD_API}/guilds/${guildId}/roles`, {
        headers: { Authorization: `Bot ${BOT_TOKEN}` },
      }),
      fetch(`${DISCORD_API}/guilds/${guildId}/channels`, {
        headers: { Authorization: `Bot ${BOT_TOKEN}` },
      }),
    ]);

    const existingRoles = await existingRolesRes.json();
    const existingChannels = await existingChannelsRes.json();

    // Restore roles
    const oldToNewRoleMap: Record<string, string> = {};
    for (const role of backup.roles ?? []) {
      if (role.id === guildId) continue; // skip @everyone

      const existingRole = existingRoles.find((r: any) => r.name === role.name);
      let newRoleId: string;

      if (existingRole) {
        // Update existing role
        await fetch(
          `${DISCORD_API}/guilds/${guildId}/roles/${existingRole.id}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bot ${BOT_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: role.name,
              color: role.color,
              hoist: role.hoist,
              mentionable: role.mentionable,
              permissions: role.permissions,
            }),
          },
        );
        newRoleId = existingRole.id;
      } else {
        // Create new role
        const res = await fetch(`${DISCORD_API}/guilds/${guildId}/roles`, {
          method: "POST",
          headers: {
            Authorization: `Bot ${BOT_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: role.name,
            color: role.color,
            hoist: role.hoist,
            mentionable: role.mentionable,
            permissions: role.permissions,
          }),
        });
        const newRole = await res.json();
        newRoleId = newRole.id;
      }

      oldToNewRoleMap[role.id] = newRoleId;
    }

    // Restore categories
    const categoryMap: Record<string, string> = {};
    const categories = backup.channels?.filter((c: any) => c.type === 4) ?? [];

    for (const cat of categories) {
      const existingCat = existingChannels.find(
        (c: any) => c.type === 4 && c.name === cat.name,
      );
      let newCatId: string;

      if (existingCat) {
        await fetch(
          `${DISCORD_API}/guilds/${guildId}/channels/${existingCat.id}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bot ${BOT_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: cat.name }),
          },
        );
        newCatId = existingCat.id;
      } else {
        const res = await fetch(`${DISCORD_API}/guilds/${guildId}/channels`, {
          method: "POST",
          headers: {
            Authorization: `Bot ${BOT_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: cat.name, type: 4 }),
        });
        const newCat = await res.json();
        newCatId = newCat.id;
      }

      categoryMap[cat.id] = newCatId;
    }

    // Restore text/voice channels
    const otherChannels =
      backup.channels?.filter((c: any) => c.type !== 4) ?? [];

    for (const ch of otherChannels) {
      const parentId = ch.parentId ? categoryMap[ch.parentId] : undefined;
      const permission_overwrites =
        ch.permissionOverwrites?.map((po: any) => ({
          id: po.id === guildId ? guildId : (oldToNewRoleMap[po.id] ?? po.id),
          type: po.type,
          allow: po.allow,
          deny: po.deny,
        })) ?? [];

      const existingChannel = existingChannels.find((c: any) => c.id === ch.id);

      if (existingChannel) {
        await fetch(
          `${DISCORD_API}/guilds/${guildId}/channels/${existingChannel.id}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bot ${BOT_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: ch.name,
              parent_id: parentId,
              permission_overwrites,
            }),
          },
        );
      } else {
        await fetch(`${DISCORD_API}/guilds/${guildId}/channels`, {
          method: "POST",
          headers: {
            Authorization: `Bot ${BOT_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: ch.name,
            type: ch.type,
            parent_id: parentId,
            permission_overwrites,
          }),
        });
      }
    }

    // Restore server settings
    const settings: any = {};
    if (backup.server_settings?.name)
      settings.name = backup.server_settings.name;
    if (backup.server_settings?.iconURL) {
      const iconResponse = await fetch(backup.server_settings.iconURL);
      const iconBuffer = await iconResponse.arrayBuffer();
      const base64Icon = Buffer.from(iconBuffer).toString("base64");
      settings.icon = `data:image/png;base64,${base64Icon}`;
    }

    if (Object.keys(settings).length > 0) {
      await fetch(`${DISCORD_API}/guilds/${guildId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bot ${BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Restore server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
