import { NextResponse } from "next/server";

export function GET() {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/discord/callback`,
    response_type: "code",
    // bot 스코프: 인증 시 봇을 서버에 추가하는 화면도 함께 표시
    scope: "identify guilds bot",
    permissions: "8",
  });
  return NextResponse.redirect(`https://discord.com/oauth2/authorize?${params}`);
}
