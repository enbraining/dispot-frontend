"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { IconArrowLeft, IconArrowUp, IconPencil, IconPlus, IconUsers } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { Server } from "@/lib/db";

const SESSION_KEY = "dispot_guilds";

export default function DashboardPage() {
  const router = useRouter();
  const [servers, setServers] = useState<Server[] | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) { router.replace("/api/auth/discord"); return; }

    let guilds: { id: string }[] = [];
    try { guilds = JSON.parse(stored); } catch { router.replace("/"); return; }

    fetch("/api/dashboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guild_ids: guilds.map((g) => g.id) }),
    })
      .then((r) => r.json())
      .then(setServers);
  }, []);

  if (servers === null) return null;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors w-fit">
        <IconArrowLeft size={15} stroke={1.5} />
        목록으로
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">내 서버</h1>
        <Link href="/submit" className="flex items-center gap-1.5 px-3 h-9 rounded-full text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-80 transition-opacity">
          <IconPlus size={14} stroke={2} />
          서버 등록
        </Link>
      </div>

      {servers.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-12 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-gray-500 dark:text-zinc-400">등록된 서버가 없습니다.</p>
          <Link href="/submit" className="text-sm text-indigo-500 hover:underline">서버 등록하기</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {servers.map((server) => (
            <DashboardCard key={server.id} server={server} />
          ))}
        </div>
      )}
    </div>
  );
}

function DashboardCard({ server }: { server: Server }) {
  const bumped = formatDistanceToNow(new Date(server.bumped_at), { addSuffix: true, locale: ko });

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900 overflow-hidden flex-shrink-0 flex items-center justify-center">
        {server.icon_url ? (
          <Image src={server.icon_url} alt={server.name} width={48} height={48} className="object-cover w-full h-full" />
        ) : (
          <span className="text-lg font-bold text-indigo-500 dark:text-indigo-300 select-none">{server.name[0]}</span>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{server.name}</p>
        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-zinc-500">
          <span className="flex items-center gap-1"><IconUsers size={11} stroke={1.5} />{server.member_count.toLocaleString()}명</span>
          <span className="flex items-center gap-1"><IconArrowUp size={11} stroke={1.5} />{server.bump_count.toLocaleString()} · {bumped}</span>
          {!server.bot_added && <span className="text-amber-500">봇 미추가</span>}
          {server.bot_added && !server.invite_url && <span className="text-amber-500">/register 필요</span>}
        </div>
      </div>

      <div className="flex gap-2 flex-shrink-0">
        <Link href={`/server/${server.id}`} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 text-xs text-gray-600 dark:text-zinc-400 hover:border-gray-300 dark:hover:border-zinc-600 transition-colors">
          보기
        </Link>
        <Link href={`/server/${server.id}/edit`} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 text-xs text-gray-600 dark:text-zinc-400 hover:border-gray-300 dark:hover:border-zinc-600 transition-colors">
          <IconPencil size={11} stroke={1.5} />
          수정
        </Link>
      </div>
    </div>
  );
}
