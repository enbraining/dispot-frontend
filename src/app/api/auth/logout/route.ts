import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("dispot_token");
  res.cookies.delete("dispot_user");
  return res;
}
