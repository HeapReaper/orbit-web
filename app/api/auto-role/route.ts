import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { validateApiSessionAndGuildAdmin } from "@/app/lib/validateApiSessionAndGuildAdmin";
import { rateLimitApi } from "@/app/lib/rateLimitApi";

export async function GET(req: NextRequest) {
  const guildId = req.nextUrl.searchParams.get("guildId");

  if (!guildId) return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });

  const rateLimitResp = await rateLimitApi(`${session.user.id}:getRequest`, guildId, 10, 60);
  if (rateLimitResp) return rateLimitResp;

  try {
    const data = await prisma.auto_role_settings.findUnique({ where: { guild_id: guildId } });

    const response = data
      ? {
        guildId: data.guild_id,
        autoRoles: data.auto_roles,
        enabled: data.enabled,
      }
      : { guildId, autoRoles: [], enabled: false };

    return NextResponse.json(response);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch Auto Role settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { guildId, autoRoles, enabled } = data;

  if (!guildId) return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string") return NextResponse.json({ error: session }, { status: 403 });

  const rateLimitResp = await rateLimitApi(`${session.user.id}:postRequest`, guildId, 10, 60);
  if (rateLimitResp) return rateLimitResp;

  try {
    const updated = await prisma.auto_role_settings.upsert({
      where: { guild_id: guildId },
      update: { auto_roles: autoRoles, enabled },
      create: { guild_id: guildId, auto_roles: autoRoles, enabled },
    });

    const response = {
      guildId: updated.guild_id,
      autoRoles: updated.auto_roles,
      enabled: updated.enabled,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save Auto Role settings" }, { status: 500 });
  }
}