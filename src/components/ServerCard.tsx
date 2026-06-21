"use client";

import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { IconUsers, IconClock } from "@tabler/icons-react";
import type { Server } from "@/lib/db";

export default function ServerCard({ server }: { server: Server }) {
  const bumped = formatDistanceToNow(new Date(server.bumped_at), { addSuffix: true, locale: ko });

  return (
    <Link
      href={`/server/${server.id}`}
      className="group flex flex-col gap-3.5 p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600 hover:shadow-md transition-all relative"
    >
      {/* 로고 */}
      <div className="w-14 h-14 rounded-xl bg-indigo-100 dark:bg-indigo-900 overflow-hidden flex-shrink-0 flex items-center justify-center">
        {server.icon_url ? (
          <Image src={server.icon_url} alt={server.name} width={56} height={56} className="object-cover w-full h-full" />
        ) : (
          <span className="text-lg font-bold text-indigo-500 dark:text-indigo-300 select-none">
            {server.name[0]}
          </span>
        )}
      </div>

      {/* 제목 */}
      <h2 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 leading-snug line-clamp-1">
        {server.name}
      </h2>

      {/* 설명 */}
      <p className="text-sm text-gray-500 dark:text-zinc-400 line-clamp-6 leading-relaxed flex-1 break-words overflow-hidden whitespace-pre-line">
        {server.description}
      </p>

      {/* 태그 */}
      {server.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {server.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="text-xs text-gray-400 dark:text-zinc-500 bg-gray-50 dark:bg-zinc-800 px-2 py-0.5 rounded-lg">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 하단 통계 + 참여하기 */}
      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-zinc-500 pt-1 border-t border-gray-50 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <IconUsers size={12} stroke={1.5} />
            {server.member_count.toLocaleString()}명
          </span>
          {server.online_count > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              {server.online_count.toLocaleString()}
            </span>
          )}
          <span className="flex items-center gap-1">
            <IconClock size={12} stroke={1.5} />
            {bumped}
          </span>
        </div>
        {server.invite_url && (
          <a
            href={server.invite_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="px-2.5 py-1 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors"
          >
            참여하기
          </a>
        )}
      </div>
    </Link>
  );
}
