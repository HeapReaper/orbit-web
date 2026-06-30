import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { validateApiSessionAndGuildAdmin } from "@/app/lib/validateApiSessionAndGuildAdmin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const guildId = searchParams.get("guildId");

  // Validate authentication by session and if user is guild admin
  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string")
    return NextResponse.json({ error: session }, { status: 403 });
  if (!guildId)
    return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  try {
    const data = await prisma.wheelSpinSettings.findFirst({
      where: { guildId },
    });
    console.log(data);
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch giveaway settings" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { guildId, allowMembers, enabled } = data;

  console.log(data)
  // Validate authentication by session and if user is guild admin
  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string")
    return NextResponse.json({ error: session }, { status: 403 });
  if (!guildId)
    return NextResponse.json({ error: "Guild ID is missing" }, { status: 403 });

  try {
    const updated = await prisma.wheelSpinSettings.upsert({
      where: { guildId },
      update: {
        permissionMembers: allowMembers,
        enabled
      },
      create: {
        guildId,
        permissionMembers: allowMembers,
        enabled
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to save giveaway settings" },
      { status: 500 },
    );
  }
}
