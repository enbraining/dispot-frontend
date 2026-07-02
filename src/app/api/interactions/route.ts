export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { sign } from "tweetnacl";
import { createAdminClient } from "@/lib/supabase-admin";

const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY!;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;

function hexToBytes(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2)
    arr[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  return arr;
}

function verify(signature: string, timestamp: string, body: string): boolean {
  const enc = new TextEncoder();
  const msg = new Uint8Array([...enc.encode(timestamp), ...enc.encode(body)]);
  return sign.detached.verify(msg, hexToBytes(signature), hexToBytes(PUBLIC_KEY));
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-signature-ed25519") ?? "";
  const timestamp = req.headers.get("x-signature-timestamp") ?? "";
  const body = await req.text();

  if (!verify(signature, timestamp, body)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const data = JSON.parse(body);

  // PING
  if (data.type === 1) {
    return NextResponse.json({ type: 1 });
  }

  // 슬래시 커맨드
  if (data.type === 2) {
    const { name } = data.data;
    const guildId: string = data.guild_id;

    if (name === "pot" || name === "팟") return handleBump(guildId);
    if (name === "register") return handleRegister(guildId, data);
    if (name === "help") return handleHelp();
  }

  return NextResponse.json({ type: 1 });
}

async function handleBump(guildId: string) {
  const supabase = createAdminClient();
  const { data: server } = await supabase
    .from("servers")
    .select("id, bumped_at, bot_added")
    .eq("guild_id", guildId)
    .single();

  if (!server?.bot_added) {
    return msg("DISPOT에 등록되지 않은 서버입니다. `/register`로 초대 채널을 먼저 설정해주세요.", true);
  }

  const cooldown = 30 * 60 * 1000; // 30분
  const remaining = cooldown - (Date.now() - new Date(server.bumped_at).getTime());
  if (remaining > 0) {
    const mins = Math.ceil(remaining / 60000);
    return msg(`⏳ 쿨다운 중입니다. **${mins}분** 후에 다시 시도해주세요.`, true);
  }

  // 현재 멤버/온라인 수 갱신
  const guildRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}?with_counts=true`, {
    headers: { Authorization: `Bot ${BOT_TOKEN}` },
  });
  const guildData = guildRes.ok ? await guildRes.json() : null;

  await supabase
    .from("servers")
    .update({
      bumped_at: new Date().toISOString(),
      ...(guildData && {
        member_count: guildData.approximate_member_count ?? 0,
        online_count: guildData.approximate_presence_count ?? 0,
      }),
    })
    .eq("id", server.id);

  return msg("✅ 서버가 DISPOT 상단으로 올라갔습니다!");
}

async function handleRegister(guildId: string, interaction: InteractionData) {
  const channelId = interaction.data.resolved
    ? Object.keys(interaction.data.resolved.channels ?? {})[0]
    : interaction.data.options?.[0]?.value as string;

  if (!channelId) return msg("채널을 선택해주세요.", true);

  // 멤버 권한 확인
  const memberPerms = BigInt(interaction.member?.permissions ?? "0");
  const MANAGE_GUILD = BigInt(0x20);
  if ((memberPerms & MANAGE_GUILD) !== MANAGE_GUILD) {
    return msg("서버 관리 권한이 필요합니다.", true);
  }

  // Discord REST API로 초대 링크 생성
  const inviteRes = await fetch(`https://discord.com/api/channels/${channelId}/invites`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ max_age: 0, max_uses: 0 }),
  });

  if (!inviteRes.ok) {
    return msg("초대 링크 생성 실패. 봇에게 초대 링크 생성 권한이 있는지 확인해주세요.", true);
  }

  const invite = await inviteRes.json();
  const inviteUrl = `https://discord.gg/${invite.code}`;

  const supabase = createAdminClient();
  await supabase.from("servers").update({ invite_url: inviteUrl }).eq("guild_id", guildId);

  return msg(`✅ 초대 링크가 등록되었습니다: ${inviteUrl}`);
}

async function handleHelp() {
  return msg(
    [
      "**DISPOT 명령어**",
      "`/pot` 또는 `/팟` — 이 서버를 DISPOT 상단으로 올립니다. (30분 쿨다운)",
      "`/register #채널` — 초대 링크로 사용할 채널을 등록합니다.",
      "`/help` — 이 명령어 목록을 보여줍니다.",
    ].join("\n"),
    true,
  );
}

function msg(content: string, ephemeral = false) {
  return NextResponse.json({
    type: 4,
    data: { content, flags: ephemeral ? 64 : 0 },
  });
}

interface InteractionData {
  member?: { permissions: string };
  data: {
    options?: { name: string; value: string }[];
    resolved?: { channels?: Record<string, unknown> };
  };
}
