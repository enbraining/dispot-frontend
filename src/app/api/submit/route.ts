import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, invite_url, icon_url, tags, member_count, nsfw } = body;

    if (!name || !description || !invite_url) {
      return NextResponse.json({ error: "필수 항목을 입력해주세요." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.from("servers").insert({
      name,
      description,
      invite_url,
      icon_url: icon_url ?? null,
      tags: tags ?? [],
      member_count: member_count ?? 0,
      nsfw: nsfw ?? false,
      bump_count: 0,
      bumped_at: new Date().toISOString(),
    }).select().single();

    if (error) throw error;
    return NextResponse.json({ id: data.id });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
