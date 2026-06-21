import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// 봇 토큰으로 해당 길드에 봇이 실제로 있는지 Discord API에서 확인
async function isBotInGuild(guildId: string): Promise<boolean> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return false;
  try {
    const res = await fetch(`https://discord.com/api/guilds/${guildId}/members/@me`, {
      headers: { Authorization: `Bot ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const { guild_ids } = await req.json();
  if (!Array.isArray(guild_ids) || guild_ids.length === 0) {
    return NextResponse.json([]);
  }

  const supabase = await createClient();

  // DB에서 이미 확인된 것
  const { data: existing } = await supabase
    .from("servers")
    .select("guild_id")
    .in("guild_id", guild_ids)
    .eq("bot_added", true);

  const confirmed = new Set((existing ?? []).map((r) => r.guild_id));

  // DB에 없는 것은 Discord API로 직접 확인 후 upsert
  const unconfirmed = guild_ids.filter((id) => !confirmed.has(id));
  await Promise.all(
    unconfirmed.map(async (id) => {
      const inGuild = await isBotInGuild(id);
      if (inGuild) {
        await supabase.from("servers").upsert(
          { guild_id: id, bot_added: true, bumped_at: new Date().toISOString() },
          { onConflict: "guild_id" }
        );
        confirmed.add(id);
      }
    })
  );

  return NextResponse.json([...confirmed]);
}
