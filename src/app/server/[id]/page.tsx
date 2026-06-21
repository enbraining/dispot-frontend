import { getServer } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { IconUsers, IconArrowLeft, IconExternalLink } from "@tabler/icons-react";
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

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-br from-indigo-400 to-violet-600 relative" />

        <div className="px-6 pb-6">
          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-zinc-900 bg-indigo-100 dark:bg-indigo-900 overflow-hidden -mt-10 mb-4 flex items-center justify-center shadow-md">
            {server.icon_url ? (
              <Image src={server.icon_url} alt={server.name} width={80} height={80} className="object-cover w-full h-full" />
            ) : (
              <span className="text-3xl font-bold text-indigo-500 dark:text-indigo-300 select-none">{server.name[0]}</span>
            )}
          </div>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{server.name}</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-medium w-fit">
                {server.category}
              </span>
            </div>
            <div className="flex gap-2">
              <BumpButton serverId={server.id} bumpCount={server.bump_count} />
              <a
                href={server.invite_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                <IconExternalLink size={14} stroke={2} />
                참가하기
              </a>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
            {server.description}
          </p>

          {server.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {server.tags.map((tag) => (
                <span key={tag} className="text-xs text-gray-400 dark:text-zinc-500 bg-gray-50 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-zinc-800 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{server.member_count.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-0.5">멤버</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{server.bump_count.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-0.5">범프</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-zinc-400">{bumped}</p>
              <p className="text-xs text-gray-400 mt-0.5">마지막 범프</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
