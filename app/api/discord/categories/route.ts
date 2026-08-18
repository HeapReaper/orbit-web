import { NextResponse } from "next/server";
import { getRedisClient } from "@/app/lib/redis";

const redis = getRedisClient();
const CACHE_TTL: number = 120; // 2 minutes

export async function GET(req: Request) {
  const url = new URL(req.url);
  const guildId = url.searchParams.get("guildId");

  if (!guildId) {
    return NextResponse.json({ error: "Missing guildId" }, { status: 400 });
  }

  const cacheKey = `guild:${guildId}:categories`;

  // First try Redis
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log(`Returning cached categories for guild ${guildId}`);
    return NextResponse.json(JSON.parse(cached));
  }

  try {
    const res = await fetch(
      `${process.env.API_URL}/api/expose-guild-categories`,
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch categories" },
        { status: res.status },
      );
    }

    const data = await res.json();

    const guild = data.guilds?.find((g: any) => g.id === guildId);

    const categories = (guild?.categories ?? [])
      .slice()
      .sort((a: any, b: any) => a.position - b.position)
      .map((c: any) => ({
        id: c.id,
        name: c.name,
      }));

    // Store in Redis
    await redis.set(cacheKey, JSON.stringify(categories), "EX", CACHE_TTL);

    console.log("Fetching categories for guild:", guildId);
    return NextResponse.json(categories);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
