import { type NextRequest, NextResponse } from "next/server";
import { influxBucket, influxQueryApi } from "@/app/lib/influxdb";
import { rateLimitApi } from "@/app/lib/rateLimitApi";
import { getRedisClient } from "@/app/lib/redis";
import { validateApiSessionAndGuildAdmin } from "@/app/lib/validateApiSessionAndGuildAdmin";

const redis = getRedisClient();

const TIME_RANGES = {
  last_week: { start: "-7d", every: "1h" },
  last_month: { start: "-30d", every: "1d" },
  last_year: { start: "-365d", every: "1w" },
  last_5_years: { start: "-5y", every: "1mo" },
} as const;

type TimeRangeKey = keyof typeof TIME_RANGES;

// Escapes a value that gets interpolated into a Flux string literal.
function escapeFlux(value: string): string {
  return value.replace(/[\\"]/g, "\\$&");
}

async function resolveDiscordUserName(
  guildId: string,
  userId: string,
): Promise<string> {
  const cacheKey = `discord_member_name:${guildId}:${userId}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return cached;
  } catch {
    // Cache miss/unavailable, fall through to the API call
  }

  try {
    const res = await fetch(
      `https://discord.com/api/guilds/${guildId}/members/${userId}`,
      { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } },
    );
    if (!res.ok) throw new Error(`Discord API returned ${res.status}`);

    const data = await res.json();
    const name: string =
      data.nick || data.user?.global_name || data.user?.username || userId;

    await redis.set(cacheKey, name, "EX", 3600);
    return name;
  } catch {
    return userId;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const guildId = searchParams.get("guildId");
  const rangeParam = searchParams.get("range") as TimeRangeKey | null;
  const rangeKey: TimeRangeKey =
    rangeParam && rangeParam in TIME_RANGES ? rangeParam : "last_week";

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string")
    return NextResponse.json({ error: session }, { status: 403 });
  if (!guildId)
    return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  const rateLimitResp = await rateLimitApi(
    `${session.user.id}:getAnalytics`,
    guildId,
    10,
    60,
  );
  if (rateLimitResp) return rateLimitResp;

  const { start, every } = TIME_RANGES[rangeKey];
  const g = escapeFlux(guildId);

  try {
    const [
      messagesOverTime,
      messagesByHour,
      topChannelsRaw,
      topUsersRaw,
      memberGrowth,
      membershipTotalsRaw,
      topVoiceRaw,
      commandsOverTime,
    ] = await Promise.all([
      // Total messages sent, bucketed over the selected range
      influxQueryApi.collectRows<any>(`
        from(bucket: "${influxBucket}")
          |> range(start: ${start})
          |> filter(fn: (r) => r._measurement == "discord_messages")
          |> filter(fn: (r) => r._field == "value")
          |> filter(fn: (r) => r.guild_id == "${g}")
          |> group()
          |> aggregateWindow(every: ${every}, fn: sum, createEmpty: true)
          |> fill(value: 0)
          |> sort(columns: ["_time"])
      `),
      // Total messages per hour of day (0-23), across the whole range
      influxQueryApi.collectRows<any>(`
        import "date"

        from(bucket: "${influxBucket}")
          |> range(start: ${start})
          |> filter(fn: (r) => r._measurement == "discord_messages")
          |> filter(fn: (r) => r._field == "value")
          |> filter(fn: (r) => r.guild_id == "${g}")
          |> map(fn: (r) => ({ r with hour: date.hour(t: r._time) }))
          |> group(columns: ["hour"])
          |> sum(column: "_value")
          |> group()
      `),
      // Top 5 channels by message count
      influxQueryApi.collectRows<any>(`
        from(bucket: "${influxBucket}")
          |> range(start: ${start})
          |> filter(fn: (r) => r._measurement == "discord_messages")
          |> filter(fn: (r) => r._field == "value")
          |> filter(fn: (r) => r.guild_id == "${g}")
          |> group(columns: ["channel_id"])
          |> sum(column: "_value")
          |> group()
          |> sort(columns: ["_value"], desc: true)
          |> limit(n: 5)
      `),
      // Top 5 users by message count
      influxQueryApi.collectRows<any>(`
        from(bucket: "${influxBucket}")
          |> range(start: ${start})
          |> filter(fn: (r) => r._measurement == "discord_messages")
          |> filter(fn: (r) => r._field == "value")
          |> filter(fn: (r) => r.guild_id == "${g}")
          |> group(columns: ["user_id"])
          |> sum(column: "_value")
          |> group()
          |> sort(columns: ["_value"], desc: true)
          |> limit(n: 5)
      `),
      // Net member growth (joins - leaves), cumulative over the range
      influxQueryApi.collectRows<any>(`
        from(bucket: "${influxBucket}")
          |> range(start: ${start})
          |> filter(fn: (r) => r._measurement == "discord_membership")
          |> filter(fn: (r) => r._field == "value")
          |> filter(fn: (r) => r.guild_id == "${g}")
          |> map(fn: (r) => ({ _time: r._time, _value: if r.event == "leave" then -r._value else r._value }))
          |> group()
          |> aggregateWindow(every: ${every}, fn: sum, createEmpty: true)
          |> fill(value: 0)
          |> sort(columns: ["_time"])
          |> cumulativeSum(columns: ["_value"])
      `),
      // Total joins vs leaves for the range
      influxQueryApi.collectRows<any>(`
        from(bucket: "${influxBucket}")
          |> range(start: ${start})
          |> filter(fn: (r) => r._measurement == "discord_membership")
          |> filter(fn: (r) => r._field == "value")
          |> filter(fn: (r) => r.guild_id == "${g}")
          |> group(columns: ["event"])
          |> sum(column: "_value")
          |> group()
      `),
      // Top 5 users by voice activity duration
      influxQueryApi.collectRows<any>(`
        from(bucket: "${influxBucket}")
          |> range(start: ${start})
          |> filter(fn: (r) => r._measurement == "discord_voice_activity")
          |> filter(fn: (r) => r._field == "duration")
          |> filter(fn: (r) => r.guild_id == "${g}")
          |> group(columns: ["user_id"])
          |> sum(column: "_value")
          |> group()
          |> sort(columns: ["_value"], desc: true)
          |> limit(n: 5)
      `),
      // Commands used, bucketed over the selected range
      influxQueryApi.collectRows<any>(`
        from(bucket: "${influxBucket}")
          |> range(start: ${start})
          |> filter(fn: (r) => r._measurement == "discord_messages")
          |> filter(fn: (r) => r._field == "is_command")
          |> filter(fn: (r) => r.guild_id == "${g}")
          |> filter(fn: (r) => r._value == true)
          |> group()
          |> aggregateWindow(every: ${every}, fn: count, createEmpty: true)
          |> fill(value: 0)
          |> sort(columns: ["_time"])
      `),
    ]);

    // Resolve display names for the (small, capped) lists of user IDs
    const userIds = Array.from(
      new Set([
        ...topUsersRaw.map((r) => r.user_id as string),
        ...topVoiceRaw.map((r) => r.user_id as string),
      ]),
    );
    const nameEntries = await Promise.all(
      userIds.map(
        async (id) => [id, await resolveDiscordUserName(guildId, id)] as const,
      ),
    );
    const nameMap = new Map(nameEntries);

    const hourBuckets = new Map<number, number>();
    for (const row of messagesByHour)
      hourBuckets.set(row.hour, row._value ?? 0);

    const membershipTotals = { joins: 0, leaves: 0 };
    for (const row of membershipTotalsRaw) {
      if (row.event === "join") membershipTotals.joins = row._value ?? 0;
      if (row.event === "leave") membershipTotals.leaves = row._value ?? 0;
    }

    const totalMessages = messagesOverTime.reduce(
      (sum, row) => sum + (row._value ?? 0),
      0,
    );
    const totalVoiceSeconds = topVoiceRaw.reduce(
      (sum, row) => sum + (row._value ?? 0),
      0,
    );
    const totalCommands = commandsOverTime.reduce(
      (sum, row) => sum + (row._value ?? 0),
      0,
    );

    return NextResponse.json({
      totals: {
        messages: totalMessages,
        commands: totalCommands,
        joins: membershipTotals.joins,
        leaves: membershipTotals.leaves,
        voiceMinutes: Math.round(totalVoiceSeconds / 60),
      },
      messagesOverTime: messagesOverTime.map((r) => ({
        period_start: r._time,
        message_count: r._value ?? 0,
      })),
      messagesByHour: Array.from({ length: 24 }, (_, hour) => ({
        hour: hour.toString(),
        messages: hourBuckets.get(hour) ?? 0,
      })),
      commandsOverTime: commandsOverTime.map((r) => ({
        date: r._time,
        commands: r._value ?? 0,
      })),
      topChannels: topChannelsRaw.map((r) => ({
        name: r.channel_id as string,
        message_count: r._value ?? 0,
      })),
      topUsers: topUsersRaw.map((r) => ({
        name: nameMap.get(r.user_id) ?? r.user_id,
        message_count: r._value ?? 0,
      })),
      topVoiceUsers: topVoiceRaw.map((r) => ({
        name: nameMap.get(r.user_id) ?? r.user_id,
        minutes: Math.round((r._value ?? 0) / 60),
      })),
      memberGrowth: memberGrowth.map((r) => ({
        date: r._time,
        count: r._value ?? 0,
      })),
    });
  } catch (err) {
    console.error("Error fetching analytics from InfluxDB:", err);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
