import { Suspense } from "react";
import ServerFeed from "@/components/ServerFeed";
import AuthCallback from "@/components/AuthCallback";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <Suspense>
        <AuthCallback />
      </Suspense>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          디스코드 서버 찾기
        </h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          한국의 다양한 디스코드 서버를 탐색하고 참여해보세요.
        </p>
      </div>
      <ServerFeed />
    </div>
  );
}
