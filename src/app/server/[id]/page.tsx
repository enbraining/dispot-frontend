import { getServer } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { IconUsers, IconArrowLeft, IconArrowUp, IconExternalLink, IconPencil } from "@tabler/icons-react";
import BumpButton from "./BumpButton";

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

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 flex flex-col gap-4">
        {/* 로고 + 제목 + 버튼 */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-indigo-100 dark:bg-indigo-900 overflow-hidden flex-shrink-0 flex items-center justify-center">
            {server.icon_url ? (
              <Image src={server.icon_url} alt={server.name} width={64} height={64} className="object-cover w-full h-full" />
            ) : (
              <span className="text-2xl font-bold text-indigo-500 dark:text-indigo-300 select-none">{server.name[0]}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{server.name}</h1>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 dark:text-zinc-500">
              <span className="flex items-center gap-1">
                <IconUsers size={12} stroke={1.5} />
                {server.member_count.toLocaleString()}명
              </span>
              <span className="flex items-center gap-1">
                <IconArrowUp size={12} stroke={1.5} />
                {server.bump_count.toLocaleString()} · {bumped}
              </span>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link href={`/server/${server.id}/edit`} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm text-gray-600 dark:text-zinc-400 hover:border-gray-300 dark:hover:border-zinc-600 transition-colors">
              <IconPencil size={14} stroke={1.5} />
              수정
            </Link>
            <BumpButton serverId={server.id} bumpCount={server.bump_count} />
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

        {/* 설명 */}
        <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
          {server.description}
        </p>

        {/* 태그 */}
        {server.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {server.tags.map((tag) => (
              <span key={tag} className="text-xs text-gray-400 dark:text-zinc-500 bg-gray-50 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
