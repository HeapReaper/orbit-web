import { prisma } from "@/app/lib/prisma";
import modules from "@/app/(dashboard)/dashboard/data/modules";
import { getRedisClient } from "@/app/lib/redis";

const redis = getRedisClient();

export async function getStatsFromDatabaseAndBot(botData: {
  totalGuilds: number;
  totalUsers: number;
}) {
  const cacheKey = "dashboard:stats";

  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const premiumGuilds = await prisma.premiumGuild.findMany({
    where: {
      premium: true,
      trialEndsAt: null,
    },
  });

  const enabledModulesCount = modules.filter((mod) => mod.enabled).length;

  const stats = {
    premiumGuilds: premiumGuilds.length,
    enabledModules: enabledModulesCount,
    totalGuilds: botData.totalGuilds,
    totalUsers: botData.totalUsers,
  };

  await redis.set(cacheKey, JSON.stringify(stats), "EX", 60);

  return stats;
}
