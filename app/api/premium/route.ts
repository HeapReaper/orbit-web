import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import isUserGuildAdmin from "@/app/lib/isGuildAdmin";
import { PrismaClient } from "@prisma/client";
import { getRedisClient } from "@/app/lib/redis";

const prisma = new PrismaClient();
const redis = getRedisClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const guildId = searchParams.get("guildId");

  const session = await getServerSession(authOptions);

  if (!session)
    return NextResponse.json({ error: "Please authenticate first" }, { status: 401 });
  if (!guildId)
    return NextResponse.json({ error: "guildId is required" }, { status: 400 });

  if (!(await isUserGuildAdmin(session.user.id, guildId))) {
    return NextResponse.json({ error: "You must be a guild admin to access this" }, { status: 403 });
  }

  try {
    const cacheKey = `premium_guild:${guildId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    let premiumGuild = await prisma.premiumGuild.findFirst({
      where: { guildId },
    });

    if (!premiumGuild) {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 30);

      premiumGuild = await prisma.premiumGuild.create({
        data: {
          guildId,
          premium: true,
          trialEndsAt,
        },
      });
    }

    await redis.set(cacheKey, JSON.stringify(premiumGuild), "EX", 180);

    return NextResponse.json(premiumGuild);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not fetch guild data" }, { status: 500 });
  }
}