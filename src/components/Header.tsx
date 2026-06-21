"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconSun, IconMoon, IconPlus, IconBrandDiscord, IconLogout, IconChevronDown } from "@tabler/icons-react";

const SESSION_KEY = "dischan_guilds";

export default function Header() {
  const [dark, setDark] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setLoggedIn(!!sessionStorage.getItem(SESSION_KEY));
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "dark" : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  // 프로필 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    if (!profileOpen) return;
    function onClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [profileOpen]);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    setLoggedIn(false);
    setProfileOpen(false);
    router.refresh();
  }

  return (
    <header className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link href="/" className="text-base font-bold tracking-widest text-gray-900 dark:text-white select-none" style={{ fontFamily: "var(--font-space-mono)" }}>
          DISCHAN
        </Link>

        <div className="flex items-center gap-2">
          {/* 다크모드 토글 */}
          <button
            onClick={toggleDark}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {dark ? <IconSun size={16} stroke={1.5} /> : <IconMoon size={16} stroke={1.5} />}
          </button>

          {/* 서버 등록 버튼 */}
          <Link
            href={loggedIn ? "/submit" : "/api/auth/discord"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-80 transition-opacity"
          >
            <IconPlus size={13} stroke={2} />
            서버 등록
          </Link>

          {/* 프로필 / Discord 로그인 */}
          {loggedIn ? (
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-[#5865F2] flex items-center justify-center">
                  <IconBrandDiscord size={12} className="text-white" stroke={1.5} />
                </div>
                <IconChevronDown size={12} stroke={1.5} className={`transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-40 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl shadow-lg overflow-hidden z-20">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <IconLogout size={14} stroke={1.5} />
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a
              href="/api/auth/discord"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <IconBrandDiscord size={14} stroke={1.5} />
              로그인
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
