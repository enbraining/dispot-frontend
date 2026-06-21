import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("servers").select("tags");
    if (error) throw error;

    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      for (const tag of row.tags ?? []) {
        if (tag) counts[tag] = (counts[tag] ?? 0) + 1;
      }
    }

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));

    return NextResponse.json(sorted);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
