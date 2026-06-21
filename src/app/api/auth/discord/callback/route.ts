import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/?error=cancelled`);
  }

  try {
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/discord/callback`,
      }),
    });
    const token = await tokenRes.json();
    if (!token.access_token) throw new Error("token exchange failed");

    // 유저 프로필 + 관리 길드 목록 병렬 fetch
    const [userRes, guildsRes] = await Promise.all([
      fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${token.access_token}` },
      }),
      fetch("https://discord.com/api/users/@me/guilds?with_counts=true", {
        headers: { Authorization: `Bearer ${token.access_token}` },
      }),
    ]);
    const user: DiscordUser = await userRes.json();
    const guilds: DiscordGuild[] = await guildsRes.json();

    const avatarUrl = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
      : `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator ?? "0") % 5}.png`;

    const MANAGE_GUILD = 0x20;
    const managed = guilds
      .filter((g) => (Number(g.permissions) & MANAGE_GUILD) === MANAGE_GUILD)
      .map((g) => ({
        id: g.id,
        name: g.name,
        icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null,
        approximate_member_count: g.approximate_member_count ?? 0,
      }));

    const encodedGuilds = Buffer.from(JSON.stringify(managed)).toString("base64url");
    const encodedUser = Buffer.from(JSON.stringify({ avatar: avatarUrl, username: user.global_name ?? user.username })).toString("base64url");
    const encodedToken = Buffer.from(token.access_token).toString("base64url");

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/?guilds=${encodedGuilds}&user=${encodedUser}&token=${encodedToken}`
    );
  } catch (e) {
    console.error("[discord callback]", e);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/?error=failed`
    );
  }
}

interface DiscordUser {
  id: string;
  username: string;
  global_name?: string | null;
  avatar: string | null;
  discriminator?: string;
}

interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  permissions: string;
  approximate_member_count?: number;
}

