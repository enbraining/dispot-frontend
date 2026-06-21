import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// 봇이 참여 중인 서버 ID 목록
async function getBotGuildIds(): Promise<Set<string>> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return new Set();
  const res = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bot ${token}` },
    next: { revalidate: 60 }, // 1분 캐시
  });
  if (!res.ok) return new Set();
  const guilds: { id: string }[] = await res.json();
  return new Set(guilds.map((g) => g.id));
}

export async function POST(req: NextRequest) {
  const { guild_ids } = await req.json();
  if (!Array.isArray(guild_ids) || guild_ids.length === 0) {
    return NextResponse.json([]);
  }

  const botGuildIds = await getBotGuildIds();
  const matched = (guild_ids as string[]).filter((id) => botGuildIds.has(id));

  // bot_added 동기화
  if (matched.length > 0) {
    const supabase = await createClient();
    await supabase.from("servers").upsert(
      matched.map((id) => ({ guild_id: id, bot_added: true, bumped_at: new Date().toISOString() })),
      { onConflict: "guild_id" }
    );
  }

  return NextResponse.json(matched);
}
