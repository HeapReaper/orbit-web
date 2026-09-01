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

  const enabledModulesCount = modules.filter((mod) => mod.enabled).length;

  const stats = {
    enabledModules: enabledModulesCount,
    totalGuilds: botData.totalGuilds,
    totalUsers: botData.totalUsers,
  };

  await redis.set(cacheKey, JSON.stringify(stats), "EX", 60);

  return stats;
}
