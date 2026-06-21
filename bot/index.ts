import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ChannelType,
} from "discord.js";
import { createClient } from "@supabase/supabase-js";

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 슬래시 커맨드 등록
const commands = [
  new SlashCommandBuilder()
    .setName("bump")
    .setDescription("이 서버를 DISPOT 상단에 올립니다."),

  new SlashCommandBuilder()
    .setName("register")
    .setDescription("이 서버의 초대 채널을 DISPOT에 등록합니다.")
    .addChannelOption((opt) =>
      opt
        .setName("channel")
        .setDescription("초대 링크로 사용할 채널")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    ),
].map((c) => c.toJSON());

async function deployCommands() {
  const rest = new REST().setToken(BOT_TOKEN);
  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
  console.log("슬래시 커맨드 등록 완료");
}

async function handleBump(interaction: ChatInputCommandInteraction) {
  const guildId = interaction.guildId;
  if (!guildId) return interaction.reply({ content: "서버에서만 사용 가능합니다.", ephemeral: true });

  const { data: server } = await supabase
    .from("servers")
    .select("id, bumped_at, bot_added, bump_count")
    .eq("guild_id", guildId)
    .single();

  if (!server || !server.bot_added) {
    return interaction.reply({ content: "DISPOT에 등록되지 않은 서버입니다. `/register`로 초대 채널을 먼저 설정해주세요.", ephemeral: true });
  }

  // 2시간 쿨다운
  const lastBump = new Date(server.bumped_at).getTime();
  const cooldown = 2 * 60 * 60 * 1000;
  const remaining = cooldown - (Date.now() - lastBump);
  if (remaining > 0) {
    const mins = Math.ceil(remaining / 60000);
    return interaction.reply({ content: `⏳ 범프 쿨다운 중입니다. **${mins}분** 후에 다시 시도해주세요.`, ephemeral: true });
  }

  await supabase
    .from("servers")
    .update({ bump_count: server.bump_count + 1, bumped_at: new Date().toISOString() })
    .eq("id", server.id);

  // bump_count를 직접 가져와 증가
  await supabase.rpc("bump_server", { server_id: server.id });

  return interaction.reply({ content: "✅ 서버가 DISPOT 상단으로 올라갔습니다!" });
}

async function handleRegister(interaction: ChatInputCommandInteraction) {
  const guildId = interaction.guildId;
  if (!guildId) return interaction.reply({ content: "서버에서만 사용 가능합니다.", ephemeral: true });

  const member = interaction.guild?.members.cache.get(interaction.user.id);
  if (!member?.permissions.has("ManageGuild")) {
    return interaction.reply({ content: "서버 관리 권한이 필요합니다.", ephemeral: true });
  }

  const channel = interaction.options.getChannel("channel", true);
  if (channel.type !== ChannelType.GuildText) {
    return interaction.reply({ content: "텍스트 채널만 선택할 수 있습니다.", ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    // Discord API로 영구 초대 링크 생성
    const invite = await (channel as import("discord.js").TextChannel).createInvite({
      maxAge: 0, // 영구
      maxUses: 0,
      unique: false,
    });

    await supabase
      .from("servers")
      .update({ invite_url: `https://discord.gg/${invite.code}` })
      .eq("guild_id", guildId);

    await interaction.editReply({ content: `✅ 초대 링크가 설정되었습니다: https://discord.gg/${invite.code}` });
  } catch (e) {
    console.error(e);
    await interaction.editReply({ content: "초대 링크 생성에 실패했습니다. 봇에게 초대 링크 생성 권한이 있는지 확인해주세요." });
  }
}

async function main() {
  await deployCommands();

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.on("ready", () => {
    console.log(`봇 로그인: ${client.user?.tag}`);
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    try {
      if (interaction.commandName === "bump") await handleBump(interaction);
      if (interaction.commandName === "register") await handleRegister(interaction);
    } catch (e) {
      console.error(e);
    }
  });

  await client.login(BOT_TOKEN);
}

main();
