import { prisma } from "@/app/lib/prisma";
import modules from "@/app/(dashboard)/dashboard/data/modules";

export async function getStatsFromDatabaseAndBot(botData: { totalGuilds: number, totalUsers: number }) {
  const premiumGuilds = await prisma.premiumGuild.findMany({ where: { premium: true } });
  const enabledModulesCount = modules.filter((mod) => mod.enabled).length;

  return {
    premiumGuilds: premiumGuilds.length,
    enabledModules: enabledModulesCount,
    totalGuilds: botData.totalGuilds,
    totalUsers: botData.totalUsers,
  };
}