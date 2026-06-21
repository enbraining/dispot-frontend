"use server";

import { createClient } from "./supabase-server";

export interface Server {
  id: string;
  guild_id: string | null;
  name: string;
  description: string;
  invite_url: string | null;
  icon_url: string | null;
  tags: string[];
  member_count: number;
  online_count: number;
  bumped_at: string;
  created_at: string;
  owner_id: string | null;
  nsfw: boolean;
  bot_added: boolean;
}

export async function getServers({
  tag,
  search,
  sort = "bump",
  page = 0,
  limit = 20,
}: {
  tag?: string;
  search?: string;
  sort?: "bump" | "member" | "new";
  page?: number;
  limit?: number;
} = {}): Promise<{ servers: Server[]; total: number }> {
  const supabase = await createClient();
  let q = supabase
    .from("servers")
    .select("*", { count: "exact" })
    .eq("bot_added", true); // 봇이 추가된 서버만

  if (tag) q = q.contains("tags", [tag]);
  if (search) q = q.ilike("name", `%${search}%`);

  if (sort === "bump") q = q.order("bumped_at", { ascending: false });
  else if (sort === "member") q = q.order("member_count", { ascending: false });
  else q = q.order("created_at", { ascending: false });

  q = q.range(page * limit, (page + 1) * limit - 1);

  const { data, count, error } = await q;
  if (error) {
    console.error("[getServers] Supabase error:", error);
    throw error;
  }
  return { servers: (data ?? []) as Server[], total: count ?? 0 };
}

export async function getServer(id: string): Promise<Server | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("servers").select("*").eq("id", id).single();
  return data as Server | null;
}

