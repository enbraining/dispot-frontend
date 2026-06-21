import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

export const metadata = { title: "개인정보처리방침 — DISPOT" };

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors w-fit">
        <IconArrowLeft size={15} stroke={1.5} />
        홈으로
      </Link>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-8 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">개인정보처리방침</h1>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">최종 수정: 2025년 1월</p>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-gray-800 dark:text-zinc-200">1. 수집하는 정보</h2>
          <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
            DISPOT은 Discord OAuth2 로그인 시 다음 정보를 수집합니다.
          </p>
          <ul className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed list-disc list-inside flex flex-col gap-1.5">
            <li>Discord 사용자 ID, 이름, 프로필 사진</li>
            <li>사용자가 관리하는 Discord 서버 목록</li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-gray-800 dark:text-zinc-200">2. 정보 이용 목적</h2>
          <ul className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed list-disc list-inside flex flex-col gap-1.5">
            <li>서버 등록 및 관리 기능 제공</li>
            <li>서비스 이용 인증</li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-gray-800 dark:text-zinc-200">3. 정보 저장 방식</h2>
          <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
            수집된 정보는 브라우저 세션 저장소(sessionStorage)에만 임시 저장되며, 브라우저 탭을 닫으면 자동으로 삭제됩니다. 서버 등록 정보(서버명, 설명, 아이콘 등)는 서비스 데이터베이스에 저장됩니다.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-gray-800 dark:text-zinc-200">4. 제3자 제공</h2>
          <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
            DISPOT은 수집한 개인정보를 제3자에게 제공하지 않습니다. 단, Discord API를 통해 인증 처리가 이루어지며 Discord의 개인정보처리방침이 적용됩니다.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-gray-800 dark:text-zinc-200">5. 정보 삭제</h2>
          <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
            등록한 서버 삭제 시 관련 데이터가 함께 삭제됩니다. 추가적인 데이터 삭제 요청은 공식 Discord 서버를 통해 문의해주세요.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-gray-800 dark:text-zinc-200">6. 문의</h2>
          <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
            개인정보처리방침에 대한 문의는 공식 Discord 서버를 통해 연락해주세요.
          </p>
        </section>
      </div>
    </div>
  );
}
