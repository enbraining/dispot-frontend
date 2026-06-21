import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { guild_id, description, tags, nsfw } = body;

    if (!guild_id || !description) {
      return NextResponse.json({ error: "필수 항목을 입력해주세요." }, { status: 400 });
    }
    if (description.length < 50) {
      return NextResponse.json({ error: "소개는 50자 이상 입력해주세요." }, { status: 400 });
    }

    const supabase = createAdminClient();

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

    if (error) {
      console.error("[submit] supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ id: data.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : JSON.stringify(e);
    console.error("[submit] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
