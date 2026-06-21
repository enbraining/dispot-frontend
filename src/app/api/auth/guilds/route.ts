import { NextRequest, NextResponse } from "next/server";

const MANAGE_GUILD = 0x20;

export async function POST(req: NextRequest) {
  const { access_token } = await req.json();
  if (!access_token) return NextResponse.json({ error: "no token" }, { status: 400 });

  const res = await fetch("https://discord.com/api/users/@me/guilds?with_counts=true", {
    headers: { Authorization: `Bearer ${access_token}` },
    cache: "no-store",
  });

  if (!res.ok) return NextResponse.json({ error: "discord error" }, { status: 502 });

  const guilds: { id: string; name: string; icon: string | null; permissions: string; approximate_member_count?: number }[] = await res.json();

  const managed = guilds
    .filter((g) => (Number(g.permissions) & MANAGE_GUILD) === MANAGE_GUILD)
    .map((g) => ({
      id: g.id,
      name: g.name,
      icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null,
      approximate_member_count: g.approximate_member_count ?? 0,
    }));

  return NextResponse.json(managed);
}
