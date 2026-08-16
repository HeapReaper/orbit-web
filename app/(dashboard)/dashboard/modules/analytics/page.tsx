"use client";

import { useEffect, useState } from "react";
import CommandUsageChart from "@/app/(dashboard)/dashboard/components/charts/CommandUsageChart";
import JoinsOverTimeChart from "@/app/(dashboard)/dashboard/components/charts/JoinsOverTime";
import MessageFlowChart from "@/app/(dashboard)/dashboard/components/charts/MessageFlowOverTime";
import TopChannelsChart from "@/app/(dashboard)/dashboard/components/charts/MostActiveChannels";
import MostActiveUsersChart from "@/app/(dashboard)/dashboard/components/charts/MostActiveUsers";
import TopVoiceUsersChart from "@/app/(dashboard)/dashboard/components/charts/TopVoiceUsers";
import TotalMessagesChart from "@/app/(dashboard)/dashboard/components/charts/TotalMessagesOverTime";
import PageLoader from "@/app/(dashboard)/dashboard/components/PageLoader";
import InfoTooltip from "@/app/(dashboard)/dashboard/components/ui/InfoToolTip";
import { useGuild } from "@/app/context/GuildContext";

const TIME_RANGES = [
  "last_week",
  "last_month",
  "last_year",
  "last_5_years",
] as const;

type TimeRange = (typeof TIME_RANGES)[number];

// Matches the aggregateWindow granularity picked server-side per range
function formatPeriodLabel(range: TimeRange, iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;

  switch (range) {
    case "last_week":
      return date.toLocaleString(undefined, {
        weekday: "short",
        hour: "2-digit",
      });
    case "last_month":
    case "last_year":
      return date.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
      });
    case "last_5_years":
      return date.toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      });
  }
}

export default function Page() {
  const [loading, setLoading] = useState<boolean>(false);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("last_week");
  const { selectedGuild, currentGuild } = useGuild();

  const [totals, setTotals] = useState({
    messages: 0,
    commands: 0,
    joins: 0,
    leaves: 0,
    voiceMinutes: 0,
  });
  const [messagesByHour, setMessagesByHour] = useState<any[]>([]);
  const [messagesOverTime, setMessagesOverTime] = useState<any[]>([]);
  const [commandsOverTime, setCommandsOverTime] = useState<any[]>([]);
  const [topChannels, setTopChannels] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [topVoiceUsers, setTopVoiceUsers] = useState<any[]>([]);
  const [memberGrowth, setMemberGrowth] = useState<any[]>([]);

  const allowedTimeRanges: TimeRange[] = isPremium
    ? [...TIME_RANGES]
    : ["last_week"];

  useEffect(() => {
    document.title = "Analytics";

    if (!selectedGuild) return;

    setLoading(true);

    const fetchData = async () => {
      const premiumRes = await fetch(`/api/premium?guildId=${selectedGuild}`);
      const premiumData = await premiumRes.json();
      setIsPremium(premiumData?.premium ?? false);

      const res = await fetch(
        `/api/analytics?guildId=${selectedGuild}&range=${timeRange}`,
      );
      const data = await res.json();

      setTotals(
        data.totals ?? {
          messages: 0,
          commands: 0,
          joins: 0,
          leaves: 0,
          voiceMinutes: 0,
        },
      );

      setMessagesByHour(data.messagesByHour ?? []);

      setMessagesOverTime(
        (data.messagesOverTime ?? []).map((row: any) => ({
          period_start: formatPeriodLabel(timeRange, row.period_start),
          message_count: row.message_count,
        })),
      );

      setCommandsOverTime(
        (data.commandsOverTime ?? []).map((row: any) => ({
          date: formatPeriodLabel(timeRange, row.date),
          commands: row.commands,
        })),
      );

      setTopChannels(
        (data.topChannels ?? []).map((row: any) => ({
          name:
            currentGuild?.channels.find((c) => c.id === row.name)?.name ??
            row.name,
          message_count: row.message_count,
        })),
      );

      setTopUsers(data.topUsers ?? []);
      setTopVoiceUsers(data.topVoiceUsers ?? []);

      setMemberGrowth(
        (data.memberGrowth ?? []).map((row: any) => ({
          date: formatPeriodLabel(timeRange, row.date),
          count: row.count,
        })),
      );

      setLoading(false);
    };

    void fetchData();
  }, [selectedGuild, timeRange, currentGuild]);

  return (
    <section className="relative bg-[#181b25] p-6 rounded-lg max-w-3xl mx-auto mt-6">
      {loading && <PageLoader />}

      <h1 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
        Analytics
        <InfoTooltip text="Display your analytics like message flow and most active channels. Premium servers can also select LAST MONTH, LAST YEAR and LAST 5 YEARS" />
      </h1>

      <div className="flex gap-2 mb-6">
        {allowedTimeRanges.map((range) => (
          <button
            key={range}
            type="button"
            onClick={() => setTimeRange(range)}
            className="px-3 py-1 rounded text-white transition-colors"
            style={{
              backgroundColor:
                timeRange === range ? "var(--primary-color)" : undefined,
            }}
            onMouseEnter={(e) => {
              if (timeRange !== range)
                e.currentTarget.style.backgroundColor = "var(--hover-color)";
            }}
            onMouseLeave={(e) => {
              if (timeRange !== range)
                e.currentTarget.style.backgroundColor = "";
            }}
          >
            {range.replace(/_/g, " ").toUpperCase()}
          </button>
        ))}
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {[
          { label: "Messages", value: totals.messages },
          { label: "Commands", value: totals.commands },
          { label: "Joins", value: totals.joins },
          { label: "Leaves", value: totals.leaves },
          { label: "Voice minutes", value: totals.voiceMinutes },
        ].map((tile) => (
          <div
            key={tile.label}
            className="bg-[#1f2333] border border-[#2a2f45] rounded-lg p-3 text-center"
          >
            <p className="text-xl font-semibold text-white">
              {tile.value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">{tile.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-1">Messages per hour</h3>
        <p className="text-gray-400 mb-3">
          Shows the total messages sent for each hour of the day (UTC)
        </p>
        <MessageFlowChart data={messagesByHour} />
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-1">Messages over time</h3>
        <p className="text-gray-400 mb-3">
          Shows the total messages sent for each period over time
        </p>
        <TotalMessagesChart data={messagesOverTime} />
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-1">Commands used</h3>
        <p className="text-gray-400 mb-3">
          Shows how many commands were used for each period over time
        </p>
        <CommandUsageChart data={commandsOverTime} />
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-1">Top channels</h3>
        <p className="text-gray-400 mb-3">
          Shows the top 5 channels where the most messages were sent
        </p>
        <TopChannelsChart data={topChannels} />
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-1">Most active users</h3>
        <p className="text-gray-400 mb-2">
          Shows the top 5 users who have sent the most messages
        </p>
        <MostActiveUsersChart data={topUsers} />
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-1">Most active in voice</h3>
        <p className="text-gray-400 mb-2">
          Shows the top 5 users who spent the most time in voice channels
        </p>
        <TopVoiceUsersChart data={topVoiceUsers} />
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-1">Member growth</h3>
        <p className="text-gray-400 mb-2">
          Shows the net member change (joins minus leaves) over time
        </p>
        <JoinsOverTimeChart data={memberGrowth} />
      </div>
    </section>
  );
}
