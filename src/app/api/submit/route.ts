import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { guild_id, description, tags, nsfw } = body;

    if (!guild_id || !description) {
      return NextResponse.json({ error: "필수 항목을 입력해주세요." }, { status: 400 });
    }

    const supabase = await createClient();

    // 기존 서버가 있으면 description/tags/nsfw만 업데이트
    const { data, error } = await supabase
      .from("servers")
      .upsert({
        guild_id,
        description,
        tags: tags ?? [],
        nsfw: nsfw ?? false,
      }, { onConflict: "guild_id" })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ id: data.id });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
