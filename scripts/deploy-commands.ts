// pnpm deploy-commands
export {};

// .env.local 로드
import { config } from "dotenv";
config({ path: ".env" });

const CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;

const commands = [
  {
    name: "pot",
    description: "이 서버를 DISPOT 상단에 올립니다.",
  },
  {
    name: "팟",
    description: "이 서버를 DISPOT 상단에 올립니다.",
  },
  {
    name: "register",
    description: "이 서버의 초대 채널을 DISPOT에 등록합니다.",
    options: [
      {
        name: "channel",
        description: "초대 링크로 사용할 채널",
        type: 7,
        required: true,
        channel_types: [0],
      },
    ],
  },
  {
    name: "help",
    description: "DISPOT 봇 명령어 목록을 보여줍니다.",
  },
];

async function main() {
  const res = await fetch(`https://discord.com/api/v10/applications/${CLIENT_ID}/commands`, {
    method: "PUT",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  });

  if (res.ok) {
    console.log("✅ 슬래시 커맨드 등록 완료");
  } else {
    const err = await res.json();
    console.error("❌ 등록 실패:", err);
  }
}

main();
