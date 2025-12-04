import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import isUserGuildAdmin from "@/app/lib/isGuildAdmin";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  const guildId = req.nextUrl.searchParams.get("guildId");
  const session = await getServerSession(authOptions);

  if (!session) return NextResponse.json({ error: "Please authenticate first" }, { status: 401 });
  if (!guildId) return NextResponse.json({ error: "guildId is required" }, { status: 400 });

  // @ts-ignore
  if (!(await isUserGuildAdmin(session.user.id, guildId)))
    return NextResponse.json({ error: "You must be a guild admin" }, { status: 403 });

  try {
    const data = await prisma.leveling_settings.findUnique({ where: { guild_id: guildId } });

    return NextResponse.json(
      data ?? {
        enabled: false,
        channel: null,
        level_roles: [],
        xp_rate: 1,
        xp_per_message: 10,
        xp_per_voice: 5,
        curve_exponent: 2.65,
        xp_message_gainspeed: "oneTimeAMinute",
        xp_voice_gainspeed: "everyMinute",
      }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch leveling settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const session = await getServerSession(authOptions);

  if (!session) return NextResponse.json({ error: "Please authenticate first" }, { status: 401 });
  if (!data.guildId) return NextResponse.json({ error: "guildId is required" }, { status: 400 });

  // @ts-ignore
  if (!(await isUserGuildAdmin(session.user.id, data.guildId)))
    return NextResponse.json({ error: "You must be a guild admin" }, { status: 403 });

  const {
    guildId,
    channel,
    levelRoles,
    xpRate,
    enabled,
    xpPerMessage,
    xpPerVoice,
    curveExponent,
    xpMessageGainSpeed,
    xpVoiceGainSpeed,
  } = data;

  try {
    const updated = await prisma.leveling_settings.upsert({
      where: { guild_id: guildId },
      update: {
        channel,
        level_roles: levelRoles,
        xp_rate: xpRate,
        enabled,
        xp_per_message: xpPerMessage,
        xp_pervoice: xpPerVoice,
        curve_exponent: curveExponent,
        xp_message_gainspeed: xpMessageGainSpeed,
        xp_voice_gainspeed: xpVoiceGainSpeed,
      },
      create: {
        guild_id: guildId,
        channel,
        level_roles: levelRoles,
        xp_rate: xpRate,
        enabled,
        xp_per_message: xpPerMessage,
        xp_pervoice: xpPerVoice,
        curve_exponent: curveExponent,
        xp_message_gainspeed: xpMessageGainSpeed,
        xp_voice_gainspeed: xpVoiceGainSpeed,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save leveling settings" }, { status: 500 });
  }
}