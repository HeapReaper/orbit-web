import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/app/lib/prisma";
import { getRedisClient } from "@/app/lib/redis";
import pLimit from "p-limit";

const redis = getRedisClient();
const limit = pLimit(2);

const DISCORD_API = "https://discord.com/api";
const ADMINISTRATOR = 0x00000008;

// In seconds
const USER_GUILDS_TTL = 120;
const BOT_GUILDS_TTL = 120;
const GUILD_DETAILS_TTL = 360;

export async function GET() {
  const session = await getServerSession(authOptions);

  // @ts-ignore
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const userGuildsCacheKey = `guilds:user:${userId}`;

  // Try user guild cache
  const cachedUserGuilds = await redis.get(userGuildsCacheKey);
  if (cachedUserGuilds) {
    return NextResponse.json(JSON.parse(cachedUserGuilds));
  }

  try {
    // Fetch user guilds
    const userRes = await fetch(`${DISCORD_API}/users/@me/guilds`, {
      // @ts-ignore
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });

    if (!userRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch user guilds" },
        { status: userRes.status },
      );
    }

    const userGuilds: any[] = await userRes.json();

    // Fetch bot guilds (cached)
    let botGuildsRaw = await redis.get("guilds:bot");

    if (!botGuildsRaw) {
      const botRes = await fetch(`${DISCORD_API}/users/@me/guilds`, {
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
      });

      if (!botRes.ok) {
        return NextResponse.json(
          { error: "Failed to fetch bot guilds" },
          { status: 500 },
        );
      }

      botGuildsRaw = JSON.stringify(await botRes.json());
      await redis.set("guilds:bot", botGuildsRaw, "EX", BOT_GUILDS_TTL);
    }

    const botGuildIds = new Set(JSON.parse(botGuildsRaw).map((g: any) => g.id));

    // Filter manageable guilds
    const manageableGuilds = userGuilds.filter((g: any) => {
      const hasAdmin =
        g.owner ||
        (parseInt(g.permissions, 10) & ADMINISTRATOR) === ADMINISTRATOR;

      return hasAdmin && botGuildIds.has(g.id);
    });

    // Premium lookup
    const premiumGuilds = await prisma.premiumGuild.findMany({
      where: {
        guildId: { in: manageableGuilds.map((g) => g.id) },
      },
    });

    const premiumMap = new Map(
      premiumGuilds.map((p) => [p.guildId, p.premium]),
    );

    // Fetch guild details (rate-limited)
    const detailedGuilds = await Promise.all(
      manageableGuilds.map((g: any) =>
        limit(async () => {
          const guildCacheKey = `guild:${g.id}:details`;

          try {
            const cachedGuild = await redis.get(guildCacheKey);
            if (cachedGuild) return JSON.parse(cachedGuild);

            const [channelsRes, rolesRes] = await Promise.all([
              fetch(`${DISCORD_API}/guilds/${g.id}/channels`, {
                headers: {
                  Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                },
              }),
              fetch(`${DISCORD_API}/guilds/${g.id}/roles`, {
                headers: {
                  Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                },
              }),
            ]);

            if (!channelsRes.ok || !rolesRes.ok) return null;

            const [channels, roles] = await Promise.all([
              channelsRes.json(),
              rolesRes.json(),
            ]);

            const guildDetails = {
              id: g.id,
              name: g.name,
              icon: g.icon,
              owner: g.owner,
              isAdmin: true,
              channels,
              roles,
              isPremium: premiumMap.get(g.id) ?? false,
            };

            await redis.set(
              guildCacheKey,
              JSON.stringify(guildDetails),
              "EX",
              GUILD_DETAILS_TTL,
            );

            return guildDetails;
          } catch (err) {
            console.warn(`Skipping guild ${g.id}`, err);
            return null;
          }
        }),
      ),
    );

    const validGuilds = detailedGuilds.filter(Boolean);
    const response = { guilds: validGuilds };

    //Cache final response
    await redis.set(
      userGuildsCacheKey,
      JSON.stringify(response),
      "EX",
      USER_GUILDS_TTL,
    );

    return NextResponse.json(response);
  } catch (err) {
    console.error("Guild API error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
