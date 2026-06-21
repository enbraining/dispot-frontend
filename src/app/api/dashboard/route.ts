import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const { guild_ids } = await req.json();
  if (!Array.isArray(guild_ids) || guild_ids.length === 0) {
    return NextResponse.json([]);
  }
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("servers")
    .select("*")
    .in("guild_id", guild_ids)
    .order("created_at", { ascending: false });

  return NextResponse.json(data ?? []);
}
