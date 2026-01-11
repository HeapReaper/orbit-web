import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getRedisClient } from "@/app/lib/redis";

const redis = getRedisClient();

export async function GET(req: NextRequest) {
  try {
    // Fetch all guilds the bot is in via Bot Token
    const discordRes = await fetch(
      "https://discord.com/api/v10/users/@me/guilds",
      {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
      },
    );

    if (!discordRes.ok) {
      console.error("Discord API error:", await discordRes.text());
      return NextResponse.json(
        { error: "Failed to fetch guilds from Discord" },
        { status: 500 },
      );
    }

    const guilds = await discordRes.json();

    const guildsWithDetails = await Promise.all(
      guilds.map(async (guild: any) => {
        const guildId = guild.id;

        // Check if guild is allowed to be shown in the list
        const botSettings = await prisma.botSettings.findUnique({
          where: { guildId },
        });

        if (botSettings && botSettings.showInGuildList === false) {
          return null; // Skip this guild
        }

        // Fetch full guild details
        let fullGuild: any = {};
        try {
          const guildDetailRes = await fetch(
            `https://discord.com/api/v10/guilds/${guildId}`,
            {
              headers: {
                Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
              },
            },
          );

          if (guildDetailRes.ok) {
            fullGuild = await guildDetailRes.json();
          }
        } catch (err) {
          console.warn(`Failed to fetch guild details for ${guildId}`, err);
        }

        // Check premium status in Redis (optional)
        const cacheKey = `premium_guild:${guildId}`;
        let premiumData = await redis.get(cacheKey);
        let premium = false;
        if (premiumData) {
          premium = JSON.parse(premiumData)?.premium || false;
        }

        // Build invite link
        let inviteLink = `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_BOT_ID}&scope=bot&permissions=8&guild_id=${guildId}`;
        try {
          // Fetch channels in the guild
          const channelsRes = await fetch(
            `https://discord.com/api/v10/guilds/${guildId}/channels`,
            {
              headers: {
                Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
              },
            },
          );

          if (channelsRes.ok) {
            const channels = await channelsRes.json();
            // Pick the first text channel
            const textChannel = channels.find((c: any) => c.type === 0); // type 0 = text channel
            if (textChannel) {
              const inviteRes = await fetch(
                `https://discord.com/api/v10/channels/${textChannel.id}/invites`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    max_age: 86400,
                    max_uses: 0,
                    temporary: false,
                  }),
                },
              );
              if (inviteRes.ok) {
                const inviteData = await inviteRes.json();
                inviteLink = `https://discord.gg/${inviteData.code}`;
              }
            }
          }
        } catch (err) {
          console.warn(`Failed to create invite for guild ${guildId}`, err);
        }

        return {
          id: guildId,
          name: guild.name,
          icon: guild.icon
            ? `https://cdn.discordapp.com/icons/${guildId}/${guild.icon}.png`
            : null,
          description: (fullGuild.description || "No description").slice(
            0,
            300,
          ),
          premium,
          inviteLink,
        };
      }),
    );

    // Filter out nulls (guilds with showInGuildList = false)
    return NextResponse.json(guildsWithDetails.filter(Boolean));
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
