import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getRedisClient } from "@/app/lib/redis";

const redis = getRedisClient();

export async function GET(req: NextRequest) {
  try {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const botId = process.env.DISCORD_BOT_ID;
    if (!botToken || !botId) {
      return NextResponse.json({ error: "Bot token or ID is missing" }, { status: 500 });
    }

    // Fetch all guilds the bot is in
    const discordRes = await fetch("https://discord.com/api/v10/users/@me/guilds", {
      headers: { Authorization: `Bot ${botToken}` },
    });

    if (!discordRes.ok) {
      const text = await discordRes.text();
      console.error("Discord API error:", text);
      return NextResponse.json({ error: "Failed to fetch guilds from Discord" }, { status: 500 });
    }

    const guilds = await discordRes.json();

    const guildsWithDetails = await Promise.all(
      guilds.map(async (guild: any) => {
        const guildId = guild.id;

        // Skip guilds where showInGuildList = false
        const botSettings = await prisma.bot_settings.findUnique({ where: { guild_id: guildId } });
        if (botSettings?.show_in_guild_list === false) return null;

        // Fetch full guild info (optional)
        let description = "No description";
        try {
          const guildDetailRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
            headers: { Authorization: `Bot ${botToken}` },
          });
          if (guildDetailRes.ok) {
            const fullGuild = await guildDetailRes.json();
            description = (fullGuild.description || "No description").slice(0, 300);
          }
        } catch {
          // ignore fetch errors
        }

        // Check premium status from Redis
        const cacheKey = `premium_guild:${guildId}`;
        const premiumData = await redis.get(cacheKey);
        const premium = premiumData ? JSON.parse(premiumData)?.premium ?? false : false;

        // Generate invite link
        let inviteLink = `https://discord.com/oauth2/authorize?client_id=${botId}&scope=bot&permissions=8&guild_id=${guildId}`;
        try {
          const channelsRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
            headers: { Authorization: `Bot ${botToken}` },
          });
          if (channelsRes.ok) {
            const channels = await channelsRes.json();
            const textChannel = channels.find((c: any) => c.type === 0);
            if (textChannel) {
              const inviteRes = await fetch(
                `https://discord.com/api/v10/channels/${textChannel.id}/invites`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bot ${botToken}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ max_age: 86400, max_uses: 0, temporary: false }),
                }
              );
              if (inviteRes.ok) {
                const inviteData = await inviteRes.json();
                inviteLink = `https://discord.gg/${inviteData.code}`;
              }
            }
          }
        } catch {
          // ignore invite creation errors
        }

        return {
          id: guildId,
          name: guild.name,
          icon: guild.icon ? `https://cdn.discordapp.com/icons/${guildId}/${guild.icon}.png` : null,
          description,
          premium,
          inviteLink,
        };
      })
    );

    return NextResponse.json(guildsWithDetails.filter(Boolean));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}