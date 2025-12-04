import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import isUserGuildAdmin from "@/app/lib/isGuildAdmin";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const session = await getServerSession(authOptions);

  if (!session) return NextResponse.json({ error: "please_authenticate_first" });
  if (!data.guild_id) return NextResponse.json({ error: "guild_id_is_required" });
  if (!data.type) return NextResponse.json({ error: "type_is_required" });
  if (!data.message) return NextResponse.json({ error: "message_is_required" });

  const { guild_id, type, message } = data;

  // @ts-ignore
  const is_admin = await isUserGuildAdmin(session.user.id, guild_id);
  if (!is_admin) return NextResponse.json({ error: "you_must_be_a_guild_admin_to_access_this" });

  await prisma.dashboard_log.create({
    data: {
      guild_id,
      type,
      message,
    },
  });

  return NextResponse.json({ success: true });
}
