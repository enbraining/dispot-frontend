"use client";

import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { IconUsers, IconArrowUp } from "@tabler/icons-react";
import type { Server } from "@/lib/db";

export default function ServerCard({ server }: { server: Server }) {
  const bumped = formatDistanceToNow(new Date(server.bumped_at), { addSuffix: true, locale: ko });

  return (
    <Link
      href={`/server/${server.id}`}
      className="group flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600 hover:shadow-md transition-all overflow-hidden"
    >
      {/* Banner gradient */}
      <div className="h-16 bg-gradient-to-br from-indigo-400 to-violet-600 relative flex-shrink-0" />

      <div className="flex flex-col gap-3 p-4 pt-0">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl border-4 border-white dark:border-zinc-900 bg-indigo-100 dark:bg-indigo-900 overflow-hidden -mt-7 flex-shrink-0 flex items-center justify-center shadow-sm">
          {server.icon_url ? (
            <Image src={server.icon_url} alt={server.name} width={56} height={56} className="object-cover w-full h-full" />
          ) : (
            <span className="text-xl font-bold text-indigo-500 dark:text-indigo-300 select-none">
              {server.name[0]}
            </span>
          )}
        </div>

        {/* Name + category */}
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 leading-snug line-clamp-1">
            {server.name}
          </h2>
          <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-medium">
            {server.category}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed flex-1">
          {server.description}
        </p>

        {/* Tags */}
        {server.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {server.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-xs text-gray-400 dark:text-zinc-500 bg-gray-50 dark:bg-zinc-800 px-2 py-0.5 rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-zinc-500 mt-auto pt-1 border-t border-gray-50 dark:border-zinc-800">
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
    </Link>
  );
}
