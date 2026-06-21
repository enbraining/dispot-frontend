import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("servers").select("*").eq("id", id).single();
  if (error || !data) return NextResponse.json({ error: "서버를 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { description, tags, nsfw } = await req.json();

  if (!description || description.length < 50) {
    return NextResponse.json({ error: "소개는 50자 이상 입력해주세요." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("servers")
    .update({ description, tags: tags ?? [], nsfw: nsfw ?? false })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
