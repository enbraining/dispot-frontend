import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.NEXT_PUBLIC_BASE_URL!;
const COOKIE_OPTS = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 7 };

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(`${BASE}/`);

  try {
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code,
        redirect_uri: `${BASE}/api/auth/discord/callback`,
      }),
    });
    const token = await tokenRes.json();
    if (!token.access_token) throw new Error("token exchange failed");

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const user: DiscordUser = await userRes.json();

    const avatarUrl = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
      : `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator ?? "0") % 5}.png`;

    const res = NextResponse.redirect(`${BASE}/`);
    res.cookies.set("dispot_token", token.access_token, COOKIE_OPTS);
    res.cookies.set("dispot_user", JSON.stringify({ avatar: avatarUrl, username: user.global_name ?? user.username }), {
      ...COOKIE_OPTS,
      httpOnly: false, // 클라이언트에서 읽어야 함
    });
    return res;
  } catch (e) {
    console.error("[discord callback]", e);
    return NextResponse.redirect(`${BASE}/`);
  }
}

interface DiscordUser {
  id: string;
  username: string;
  global_name?: string | null;
  avatar: string | null;
  discriminator?: string;
}
