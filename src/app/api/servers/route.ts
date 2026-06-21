import { NextRequest, NextResponse } from "next/server";
import { getServers } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const result = await getServers({
      search: searchParams.get("search") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      sort: (searchParams.get("sort") as "bump" | "member" | "new") ?? "bump",
      page: Number(searchParams.get("page") ?? 0),
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
