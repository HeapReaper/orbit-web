// app/api/api-settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { encrypt, decrypt } from "@/app/lib/crypto";
import { rateLimitApi } from "@/app/lib/rateLimitApi";
import { validateApiSessionAndGuildAdmin } from "@/app/lib/validateApiSessionAndGuildAdmin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const guildId = searchParams.get("guildId");

  if (!guildId) return NextResponse.json({ error: "Guild ID is missing" }, { status: 400 });

  // Validate session + guild admin
  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string")
    return NextResponse.json({ error: session }, { status: 403 });

  const rateLimitResp = await rateLimitApi(`${session.user.id}:getApiSettings`, guildId, 10, 60);
  if (rateLimitResp) return rateLimitResp;

  try {
    const settings = await prisma.guildApiSettings.findUnique({
      where: { guildId },
    });

    if (!settings) return NextResponse.json({ enabled: false, apiKey: "" });

    const apiKey = decrypt(settings.apiKey);

    return NextResponse.json({ enabled: settings.enabled, apiKey });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch API settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { guildId, enabled, apiKey } = data;

  console.log(apiKey);
  if (!guildId) return NextResponse.json({ error: "Guild ID is missing" }, { status: 400 });

  const session = await validateApiSessionAndGuildAdmin(guildId);
  if (typeof session === "string")
    return NextResponse.json({ error: session }, { status: 403 });

  const rateLimitResp = await rateLimitApi(`${session.user.id}:postApiSettings`, guildId, 10, 60);
  if (rateLimitResp) return rateLimitResp;

  try {
    const encryptedKey = apiKey ? encrypt(apiKey) : undefined;

    console.log(encryptedKey);
    const updated = await prisma.guildApiSettings.upsert({
      where: { guildId },
      update: {
        enabled,
        ...(encryptedKey ? { apiKey: encryptedKey } : {}),
      },
      create: {
        guildId,
        enabled,
        apiKey: encryptedKey ?? "",
      },
    });

    return NextResponse.json({ enabled: updated.enabled, apiKey });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update API settings" }, { status: 500 });
  }
}