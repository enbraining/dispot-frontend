import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

async function getBotGuildIds(): Promise<Set<string>> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return new Set();
  const res = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bot ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return new Set();
  const guilds: { id: string }[] = await res.json();
  return new Set(guilds.map((g) => g.id));
}

// { available: string[], registered: string[] }
// available = 봇 있고 아직 미등록 (description 없음)
// registered = 봇 있고 이미 등록됨 (description 있음)
export async function POST(req: NextRequest) {
  const { guild_ids } = await req.json();
  if (!Array.isArray(guild_ids) || guild_ids.length === 0) {
    return NextResponse.json({ available: [], registered: [] });
  }

  const botGuildIds = await getBotGuildIds();
  const matched = (guild_ids as string[]).filter((id) => botGuildIds.has(id));

  if (matched.length === 0) {
    return NextResponse.json({ available: [], registered: [] });
  }

  const supabase = createAdminClient();

  // 이미 DB에 있는 서버 조회
  const { data: existing } = await supabase
    .from("servers")
    .select("guild_id, description")
    .in("guild_id", matched);

  const existingMap = new Map((existing ?? []).map((r) => [r.guild_id, r.description]));

  const available: string[] = [];
  const registered: string[] = [];

  for (const id of matched) {
    const desc = existingMap.get(id);
    if (desc && desc.length > 0) registered.push(id);
    else available.push(id);
  }

  return NextResponse.json({ available, registered });
}
