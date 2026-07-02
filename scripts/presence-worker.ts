// pnpm presence-worker
// Standalone always-on process that keeps the bot's Discord presence
// ("/help | N servers") up to date. Discord presence can only be set over
// a live Gateway connection, so this can't run as a Vercel serverless
// function like the interactions webhook — run it separately (e.g. Docker).
export {};

import { config } from "dotenv";
config({ path: ".env" });

import { ActivityType, Client, GatewayIntentBits } from "discord.js";

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10분

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

function updatePresence() {
  const count = client.guilds.cache.size.toLocaleString("en-US");
  client.user?.setPresence({
    status: "online",
    activities: [
      {
        name: "custom",
        state: `/help | ${count} servers`,
        type: ActivityType.Custom,
      },
    ],
  });
}

client.once("ready", () => {
  console.log(`✅ presence worker logged in as ${client.user?.tag}`);
  updatePresence();
  setInterval(updatePresence, REFRESH_INTERVAL_MS);
});

client.on("guildCreate", updatePresence);
client.on("guildDelete", updatePresence);

client.login(BOT_TOKEN);
