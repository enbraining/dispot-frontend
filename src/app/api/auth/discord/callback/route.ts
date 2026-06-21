import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/submit?error=cancelled`);
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

    // 봇이 추가된 길드 (bot 스코프 사용 시 token.guild 포함)
    const botGuild: BotGuild | null = token.guild ?? null;

    // 봇이 추가된 서버가 있으면 DB에 bot_added = true로 upsert
    if (botGuild) {
      const supabase = await createClient();
      const icon = botGuild.icon
        ? `https://cdn.discordapp.com/icons/${botGuild.id}/${botGuild.icon}.png`
        : null;

      await supabase.from("servers")
        .upsert({
          guild_id: botGuild.id,
          name: botGuild.name,
          icon_url: icon,
          bot_added: true,
          bumped_at: new Date().toISOString(),
        }, { onConflict: "guild_id", ignoreDuplicates: false })
        .select();
    }

    // 관리자 권한 있는 길드 목록 (approximate_member_count 포함)
    const guildsRes = await fetch(
      "https://discord.com/api/users/@me/guilds?with_counts=true",
      { headers: { Authorization: `Bearer ${token.access_token}` } }
    );
    const guilds: DiscordGuild[] = await guildsRes.json();

    const MANAGE_GUILD = 0x20;
    const managed = guilds
      .filter((g) => (Number(g.permissions) & MANAGE_GUILD) === MANAGE_GUILD)
      .map((g) => ({
        id: g.id,
        name: g.name,
        icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null,
        approximate_member_count: g.approximate_member_count ?? 0,
      }));

    const encoded = Buffer.from(JSON.stringify(managed)).toString("base64url");
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/submit?guilds=${encoded}`
    );
  } catch (e) {
    console.error("[discord callback]", e);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/submit?error=failed`
    );
  }
}

interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  permissions: string;
  approximate_member_count?: number;
}

interface BotGuild {
  id: string;
  name: string;
  icon: string | null;
}
