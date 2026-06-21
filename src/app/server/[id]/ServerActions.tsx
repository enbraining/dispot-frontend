"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconPencil } from "@tabler/icons-react";

const SESSION_KEY = "dispot_guilds";

export default function ServerActions({ serverId, guildId }: { serverId: string; guildId: string | null }) {
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    try {
      const guilds: { id: string }[] = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? "[]");
      setIsOwner(guilds.some((g) => g.id === guildId));
    } catch {}
  }, [guildId]);

  if (!isOwner) return null;

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
