"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { IconArrowLeft, IconX } from "@tabler/icons-react";
import Link from "next/link";

function EditForm() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState({ description: "", tags: [] as string[], nsfw: false });
  const [tagInput, setTagInput] = useState("");
  const tagInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/servers/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setForm({ description: data.description ?? "", tags: data.tags ?? [], nsfw: data.nsfw ?? false });
      })
      .finally(() => setFetching(false));
  }, [id]);

  function set(key: string, val: string | boolean | string[]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.description.length < 50) { setError("소개는 50자 이상 입력해주세요."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/servers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: form.description, tags: form.tags, nsfw: form.nsfw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "오류가 발생했습니다.");
      router.push(`/server/${id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors";
  const labelClass = "text-xs font-medium text-gray-600 dark:text-zinc-400";

  if (fetching) return null;

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6">
      <Link href={`/server/${id}`} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors w-fit">
        <IconArrowLeft size={15} stroke={1.5} />
        돌아가기
      </Link>

      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">서버 정보 수정</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>소개 *</label>
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} required placeholder="서버를 소개해주세요. (최소 50자)" rows={5} className={inputClass + " resize-none"} />
          <p className={`text-xs ${form.description.length < 50 ? "text-gray-400" : "text-indigo-500"}`}>
            {form.description.length} / 50자 이상
          </p>
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
                <button type="button" onClick={(e) => { e.stopPropagation(); set("tags", form.tags.filter((x) => x !== t)); }} className="hover:text-indigo-900 dark:hover:text-indigo-100">
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
                  if (val && !form.tags.includes(val) && form.tags.length < 10) set("tags", [...form.tags, val]);
                  setTagInput("");
                }
                if (e.key === "Backspace" && !tagInput && form.tags.length > 0) set("tags", form.tags.slice(0, -1));
              }}
              placeholder={form.tags.length === 0 ? "태그 입력 후 엔터" : ""}
              className="flex-1 min-w-24 text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
            />
          </div>
          <p className="text-xs text-gray-400">최대 10개 · Backspace로 마지막 태그 삭제</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>연령 제한</label>
          <div className="grid grid-cols-2 gap-2">
            {([false, true] as const).map((val) => (
              <button key={String(val)} type="button" onClick={() => set("nsfw", val)}
                className={`flex flex-col items-start gap-0.5 px-4 py-3 rounded-xl border text-sm transition-colors ${
                  form.nsfw === val
                    ? val ? "border-red-400 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
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
          {loading ? "저장 중..." : "저장하기"}
        </button>
      </form>
    </div>
  );
}

export default function EditPage() {
  return <Suspense><EditForm /></Suspense>;
}
