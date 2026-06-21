import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const { guild_ids } = await req.json();
  if (!Array.isArray(guild_ids) || guild_ids.length === 0) {
    return NextResponse.json([]);
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("servers")
    .select("guild_id")
    .in("guild_id", guild_ids)
    .eq("bot_added", true);

  const botAdded = new Set((data ?? []).map((r) => r.guild_id));
  return NextResponse.json([...botAdded]);
}
