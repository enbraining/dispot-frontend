import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

export const metadata = { title: "이용약관 — DISPOT" };

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors w-fit">
        <IconArrowLeft size={15} stroke={1.5} />
        홈으로
      </Link>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-8 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">이용약관</h1>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">최종 수정: 2025년 1월</p>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-gray-800 dark:text-zinc-200">1. 서비스 소개</h2>
          <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
            DISPOT은 디스코드 서버를 탐색하고 등록할 수 있는 서버 리스트 서비스입니다. 본 약관은 DISPOT 서비스 이용에 적용됩니다.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-gray-800 dark:text-zinc-200">2. 이용 조건</h2>
          <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
            서비스를 이용하기 위해 Discord 계정이 필요하며, Discord 이용약관을 준수해야 합니다. 서버 등록 시 해당 서버의 관리 권한이 있어야 합니다.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-gray-800 dark:text-zinc-200">3. 금지 행위</h2>
          <ul className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed list-disc list-inside flex flex-col gap-1.5">
            <li>타인의 서버를 무단으로 등록하는 행위</li>
            <li>허위 또는 오해를 유발하는 서버 정보 등록</li>
            <li>불법적이거나 유해한 콘텐츠를 포함한 서버 홍보</li>
            <li>서비스를 통한 스팸 또는 어뷰징 행위</li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-gray-800 dark:text-zinc-200">4. 서비스 변경 및 중단</h2>
          <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
            DISPOT은 사전 고지 없이 서비스의 일부 또는 전체를 변경하거나 중단할 수 있습니다.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-gray-800 dark:text-zinc-200">5. 면책 조항</h2>
          <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
            DISPOT은 등록된 서버의 콘텐츠에 대해 책임을 지지 않습니다. 서비스 이용 중 발생하는 손해에 대해 DISPOT은 법적 범위 내에서 책임을 제한합니다.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-gray-800 dark:text-zinc-200">6. 문의</h2>
          <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
            이용약관에 대한 문의는 공식 Discord 서버를 통해 연락해주세요.
          </p>
        </section>
      </div>
    </div>
  );
}
