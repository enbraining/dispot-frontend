"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { IconX } from "@tabler/icons-react";

export default function NewServerBanner({ guildId }: { guildId: string | null }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (params.get("new") === "1") {
      setShow(true);
      // URL에서 ?new=1 제거
      router.replace(pathname, { scroll: false });
    }
  }, []);

  if (!show) return null;

  return (
    <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-4 flex gap-3">
      <div className="flex-1 flex flex-col gap-2">
        <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">🎉 서버 등록 완료!</p>
        <p className="text-xs text-indigo-600 dark:text-indigo-400 leading-relaxed">
          Discord 서버에서 아래 명령어를 사용해 설정을 완료하세요.
        </p>
        <div className="flex flex-col gap-1.5 mt-0.5">
          <div className="flex items-start gap-2 text-xs text-indigo-700 dark:text-indigo-300">
            <code className="font-mono bg-indigo-100 dark:bg-indigo-900 px-1.5 py-0.5 rounded shrink-0">/register #채널</code>
            <span className="text-indigo-500 dark:text-indigo-400">초대 링크로 사용할 채널을 등록합니다.</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-indigo-700 dark:text-indigo-300">
            <code className="font-mono bg-indigo-100 dark:bg-indigo-900 px-1.5 py-0.5 rounded shrink-0">/bump</code>
            <span className="text-indigo-500 dark:text-indigo-400">30분마다 서버를 목록 상단으로 올립니다.</span>
          </div>
        </div>
      </div>
      <button
        onClick={() => setShow(false)}
        className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200 transition-colors shrink-0 self-start"
      >
        <IconX size={16} stroke={2} />
      </button>
    </div>
  );
}
