import { getServer } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { IconUsers, IconArrowLeft, IconClock, IconExternalLink } from "@tabler/icons-react";
import ServerActions from "./ServerActions";
import NewServerBanner from "./NewServerBanner";
import { Suspense } from "react";

export default async function ServerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const server = await getServer(id);
  if (!server) notFound();

  const bumped = formatDistanceToNow(new Date(server.bumped_at), { addSuffix: true, locale: ko });

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors w-fit">
        <IconArrowLeft size={15} stroke={1.5} />
        목록으로
      </Link>

      <Suspense>
        <NewServerBanner guildId={server.guild_id} />
      </Suspense>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-indigo-100 dark:bg-indigo-900 overflow-hidden flex-shrink-0 flex items-center justify-center">
            {server.icon_url ? (
              <Image src={server.icon_url} alt={server.name} width={64} height={64} className="object-cover w-full h-full" />
            ) : (
              <span className="text-2xl font-bold text-indigo-500 dark:text-indigo-300 select-none">{server.name[0]}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight break-words">{server.name}</h1>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 dark:text-zinc-500">
              <span className="flex items-center gap-1">
                <IconUsers size={12} stroke={1.5} />
                {server.member_count.toLocaleString()}명
              </span>
              {server.online_count > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  {server.online_count.toLocaleString()} 온라인
                </span>
              )}
              <span className="flex items-center gap-1">
                <IconClock size={12} stroke={1.5} />
                범프 {bumped}
              </span>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <ServerActions serverId={server.id} guildId={server.guild_id} />
            {server.invite_url && (
              <a
                href={server.invite_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                <IconExternalLink size={14} stroke={2} />
                참가하기
              </a>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed break-words overflow-hidden whitespace-pre-line">
          {server.description}
        </p>

        {server.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {server.tags.map((tag) => (
              <span key={tag} className="text-xs text-gray-400 dark:text-zinc-500 bg-gray-50 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 dark:text-zinc-600 pt-1 border-t border-gray-50 dark:border-zinc-800">
          범프는 Discord 서버에서 <code className="font-mono">/bump</code> 명령어로 할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
