import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("servers")
    .select("id")
    .eq("bot_added", true)
    .neq("description", "");

  if (!data || data.length === 0) return NextResponse.json({ id: null });
  const random = data[Math.floor(Math.random() * data.length)];
  return NextResponse.json({ id: random.id });
}
