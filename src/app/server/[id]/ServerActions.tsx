"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconPencil } from "@tabler/icons-react";

const SESSION_KEY = "dispot_guilds";

export default function ServerActions({ serverId, guildId, compact = false }: { serverId: string; guildId: string | null; compact?: boolean }) {
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    try {
      const guilds: { id: string }[] = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? "[]");
      setIsOwner(guilds.some((g) => g.id === guildId));
    } catch {}
  }, [guildId]);

  if (!isOwner) return null;

  if (compact) {
    return (
      <Link
        href={`/server/${serverId}/edit`}
        className="flex items-center gap-1 text-xs text-gray-400 dark:text-zinc-500 hover:text-indigo-500 transition-colors"
      >
        <IconPencil size={11} stroke={1.5} />
        수정
      </Link>
    );
  }

  return (
    <Link
      href={`/server/${serverId}/edit`}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm text-gray-600 dark:text-zinc-400 hover:border-gray-300 dark:hover:border-zinc-600 transition-colors"
    >
      <IconPencil size={14} stroke={1.5} />
      수정
    </Link>
  );
}
