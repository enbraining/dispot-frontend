"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconArrowLeft, IconChevronDown, IconX, IconExternalLink } from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";

interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  approximate_member_count: number;
}

const SESSION_KEY = "dispot_guilds";
const USER_KEY = "dispot_user";

// atob은 Latin-1만 처리 → TextDecoder로 UTF-8 디코딩
function decodeBase64(encoded: string): string {
  const binary = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function filterBotGuilds(guilds: DiscordGuild[]): Promise<DiscordGuild[]> {
  if (guilds.length === 0) return [];
  try {
    const res = await fetch("/api/guilds/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guild_ids: guilds.map((g) => g.id) }),
    });
    const botAdded: string[] = await res.json();
    const set = new Set(botAdded);
    return guilds.filter((g) => set.has(g.id));
  } catch {
    return guilds;
  }
}

function botInviteUrl() {
  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
  if (!clientId) return "https://discord.com/developers/applications";
  return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot`;
}

function SubmitForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [guilds, setGuilds] = useState<DiscordGuild[] | null>(null); // null = 로드 전
  const [loggedIn, setLoggedIn] = useState(false);
  const [guildPickerOpen, setGuildPickerOpen] = useState(false);
  const [selectedGuild, setSelectedGuild] = useState<DiscordGuild | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    description: "",
    tags: [] as string[],
    nsfw: false,
  });
  const [tagInput, setTagInput] = useState("");
  const tagInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // OAuth 콜백 처리 + sessionStorage 동기화
  useEffect(() => {
    async function init() {
      const err = searchParams.get("error");
      if (err) setError(err === "cancelled" ? "Discord 인증이 취소됐습니다." : "Discord 인증에 실패했습니다.");

      const encoded = searchParams.get("guilds");
      if (encoded) {
        try {
          const data: DiscordGuild[] = JSON.parse(decodeBase64(encoded));
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
          const encodedUser = searchParams.get("user");
          if (encodedUser) {
            const userData = JSON.parse(decodeBase64(encodedUser));
            sessionStorage.setItem(USER_KEY, JSON.stringify(userData));
          }
          window.dispatchEvent(new Event("dispot-login"));
          router.replace("/submit");
          setLoggedIn(true);
          const filtered = await filterBotGuilds(data);
          setGuilds(filtered);
          return;
        } catch {}
      }

      // sessionStorage에서 복원
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        try {
          const data: DiscordGuild[] = JSON.parse(stored);
          setLoggedIn(true);
          const filtered = await filterBotGuilds(data);
          setGuilds(filtered);
          return;
        } catch {}
      }

      // 미로그인
      setLoggedIn(false);
      setGuilds([]);
    }
    init();
  }, []);

  // 피커 외부 클릭 시 닫기
  useEffect(() => {
    if (!guildPickerOpen) return;
    function onClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node))
        setGuildPickerOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [guildPickerOpen]);

  function applyGuild(guild: DiscordGuild) {
    setSelectedGuild(guild);
    setGuildPickerOpen(false);
  }

  function set(key: string, val: string | boolean | string[]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!selectedGuild) { setError("서버를 선택해주세요."); setLoading(false); return; }
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guild_id: selectedGuild.id,
          description: form.description,
          tags: form.tags,
          nsfw: form.nsfw,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "오류가 발생했습니다.");
      router.push(`/server/${data.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors";
  const labelClass = "text-xs font-medium text-gray-600 dark:text-zinc-400";

  useEffect(() => {
    if (guilds !== null && !loggedIn) {
      router.replace("/api/auth/discord");
    }
  }, [guilds, loggedIn]);

  // 로드 전
  if (guilds === null) return null;

  // 미로그인
  if (!loggedIn) return null;


  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6">
      <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors w-fit">
        <IconArrowLeft size={15} stroke={1.5} />
        목록으로
      </Link>

      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">서버 등록</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400">디스코드 서버를 DISPOT에 등록하세요.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 flex flex-col gap-5">

        {/* 서버 선택 (초대 링크 대신) */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>서버 선택 *</label>
          <div ref={pickerRef} className="relative">
            <button
              type="button"
              onClick={() => setGuildPickerOpen((v) => !v)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border text-sm transition-colors ${
                selectedGuild
                  ? "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                  : "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-400"
              } focus:outline-none hover:border-indigo-400 dark:hover:border-indigo-600`}
            >
              {selectedGuild ? (
                <>
                  {selectedGuild.icon ? (
                    <Image src={selectedGuild.icon} alt={selectedGuild.name} width={20} height={20} className="rounded-full flex-shrink-0" />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-500 flex-shrink-0">{selectedGuild.name[0]}</span>
                  )}
                  <span className="flex-1 text-left font-medium truncate">{selectedGuild.name}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0">{selectedGuild.approximate_member_count.toLocaleString()}명</span>
                </>
              ) : (
                <span className="flex-1 text-left">서버를 선택하세요</span>
              )}
              <IconChevronDown size={14} stroke={1.5} className={`flex-shrink-0 text-gray-400 transition-transform ${guildPickerOpen ? "rotate-180" : ""}`} />
            </button>

            {guildPickerOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl shadow-lg overflow-hidden z-20">
                <div className="max-h-52 overflow-y-auto">
                  {guilds.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => applyGuild(g)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-left ${selectedGuild?.id === g.id ? "bg-indigo-50 dark:bg-indigo-950/30" : ""}`}
                    >
                      {g.icon ? (
                        <Image src={g.icon} alt={g.name} width={26} height={26} className="rounded-full flex-shrink-0" />
                      ) : (
                        <span className="w-6.5 h-6.5 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-500 flex-shrink-0 w-[26px] h-[26px]">{g.name[0]}</span>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{g.name}</p>
                        <p className="text-xs text-gray-400">{g.approximate_member_count.toLocaleString()}명</p>
                      </div>
                      {selectedGuild?.id === g.id && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-100 dark:border-zinc-800 px-4 py-2.5">
                  <a
                    href={botInviteUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-500 transition-colors"
                  >
                    <IconExternalLink size={11} stroke={1.5} />
                    목록에 서버가 보이지 않는다면? 봇 추가하기
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>소개 *</label>
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} required placeholder="서버를 소개해주세요." rows={4} className={inputClass + " resize-none"} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>태그</label>
          <div
            className="flex flex-wrap gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus-within:border-indigo-400 dark:focus-within:border-indigo-500 transition-colors cursor-text min-h-[42px]"
            onClick={() => tagInputRef.current?.focus()}
          >
            {form.tags.map((t) => (
              <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
                #{t}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); set("tags", form.tags.filter((x) => x !== t)); }}
                  className="hover:text-indigo-900 dark:hover:text-indigo-100"
                >
                  <IconX size={10} stroke={2.5} />
                </button>
              </span>
            ))}
            <input
              ref={tagInputRef}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const val = tagInput.trim();
                  if (val && !form.tags.includes(val) && form.tags.length < 10)
                    set("tags", [...form.tags, val]);
                  setTagInput("");
                }
                if (e.key === "Backspace" && !tagInput && form.tags.length > 0)
                  set("tags", form.tags.slice(0, -1));
              }}
              placeholder={form.tags.length === 0 ? "태그 입력 후 엔터" : ""}
              className="flex-1 min-w-24 text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
            />
          </div>
          <p className="text-xs text-gray-400">최대 10개 · Backspace로 마지막 태그 삭제</p>
        </div>

        {/* NSFW 커스텀 셀렉터 */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>연령 제한</label>
          <div className="grid grid-cols-2 gap-2">
            {([false, true] as const).map((val) => (
              <button
                key={String(val)}
                type="button"
                onClick={() => set("nsfw", val)}
                className={`flex flex-col items-start gap-0.5 px-4 py-3 rounded-xl border text-sm transition-colors ${
                  form.nsfw === val
                    ? val
                      ? "border-red-400 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                      : "border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                    : "border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 hover:border-gray-300 dark:hover:border-zinc-600"
                }`}
              >
                <span className="font-semibold">{val ? "18+" : "전체 이용가"}</span>
                <span className="text-xs opacity-70">{val ? "성인 전용 서버" : "누구나 이용 가능"}</span>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
          {loading ? "등록 중..." : "등록하기"}
        </button>
      </form>
    </div>
  );
}

export default function SubmitPage() {
  return (
    <Suspense>
      <SubmitForm />
    </Suspense>
  );
}
