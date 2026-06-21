import { createClient } from "./supabase-server";

export type Category =
  | "게임"
  | "커뮤니티"
  | "기술"
  | "음악"
  | "교육"
  | "애니"
  | "스포츠"
  | "아트"
  | "기타";

export const CATEGORIES: Category[] = [
  "게임", "커뮤니티", "기술", "음악", "교육", "애니", "스포츠", "아트", "기타",
];

export interface Server {
  id: string;
  name: string;
  description: string;
  invite_url: string;
  icon_url: string | null;
  category: Category;
  tags: string[];
  member_count: number;
  bump_count: number;
  bumped_at: string;
  created_at: string;
  owner_id: string | null;
  nsfw: boolean;
}

export async function getServers({
  category,
  tag,
  search,
  sort = "bump",
  page = 0,
  limit = 20,
}: {
  category?: string;
  tag?: string;
  search?: string;
  sort?: "bump" | "member" | "new";
  page?: number;
  limit?: number;
} = {}): Promise<{ servers: Server[]; total: number }> {
  const supabase = await createClient();
  let q = supabase.from("servers").select("*", { count: "exact" });

  if (category && category !== "all") q = q.eq("category", category);
  if (tag) q = q.contains("tags", [tag]);
  if (search) q = q.ilike("name", `%${search}%`);

  if (sort === "bump") q = q.order("bumped_at", { ascending: false });
  else if (sort === "member") q = q.order("member_count", { ascending: false });
  else q = q.order("created_at", { ascending: false });

  q = q.range(page * limit, (page + 1) * limit - 1);

  const { data, count, error } = await q;
  if (error) throw error;
  return { servers: (data ?? []) as Server[], total: count ?? 0 };
}

export async function getServer(id: string): Promise<Server | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("servers").select("*").eq("id", id).single();
  return data as Server | null;
}

export async function bumpServer(id: string) {
  const supabase = await createClient();
  await supabase.rpc("bump_server", { server_id: id });
}
