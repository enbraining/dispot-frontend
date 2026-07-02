This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Presence worker (Docker)

The bot's Discord status (`/help | N servers`) requires a live Gateway
(WebSocket) connection, which Vercel's serverless functions can't hold open.
`scripts/presence-worker.ts` is a small standalone `discord.js` process that
does nothing else — it logs in, sets the presence, and refreshes it on an
interval and on `guildCreate`/`guildDelete`. It's built as a separate image
from the Next.js app, which stays on Vercel as-is.

Build and run:

```bash
docker build -f Dockerfile.presence-worker -t dispot-presence-worker .
docker run -d --restart unless-stopped \
  -e DISCORD_BOT_TOKEN=your-bot-token \
  dispot-presence-worker
```

Only `DISCORD_BOT_TOKEN` is required. The presence text and refresh interval
(default 10 minutes) are set in `scripts/presence-worker.ts`.
