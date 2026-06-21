"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { CATEGORIES, type Category } from "@/lib/db";

export default function SubmitPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    invite_url: "",
    category: "" as Category | "",
    tags: "",
    member_count: "",
    nsfw: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(key: string, val: string | boolean) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.category) { setError("카테고리를 선택해주세요."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          member_count: Number(form.member_count) || 0,
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

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6">
      <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors w-fit">
        <IconArrowLeft size={15} stroke={1.5} />
        목록으로
      </Link>

      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">서버 등록</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400">디스코드 서버를 DISCHAN에 등록하세요.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>서버 이름 *</label>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="서버 이름" className={inputClass} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>소개 *</label>
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} required placeholder="서버를 소개해주세요." rows={4} className={inputClass + " resize-none"} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>초대 링크 *</label>
          <input value={form.invite_url} onChange={(e) => set("invite_url", e.target.value)} required placeholder="https://discord.gg/..." type="url" className={inputClass} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>카테고리 *</label>
          <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputClass}>
            <option value="">카테고리 선택</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>태그 (쉼표로 구분)</label>
          <input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="롤플레이, 친목, 스터디" className={inputClass} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>멤버 수 (선택)</label>
          <input value={form.member_count} onChange={(e) => set("member_count", e.target.value)} type="number" min="0" placeholder="0" className={inputClass} />
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={form.nsfw} onChange={(e) => set("nsfw", e.target.checked)} className="w-4 h-4 rounded accent-indigo-600" />
          <span className="text-sm text-gray-600 dark:text-zinc-400">18+ 서버 (NSFW)</span>
        </label>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
        >
          {loading ? "등록 중..." : "등록하기"}
        </button>
      </form>
    </div>
  );
}
