"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { IconSearch, IconFilter, IconX } from "@tabler/icons-react";
import ServerCard from "./ServerCard";
import ServerCardSkeleton from "./ServerCardSkeleton";
import type { Server } from "@/lib/db";
import { CATEGORIES } from "@/types/category";

const SORT_OPTIONS = [
  { value: "bump", label: "최근 범프" },
  { value: "member", label: "멤버 수" },
  { value: "new", label: "최신 등록" },
] as const;
type Sort = "bump" | "member" | "new";

interface TagCount { tag: string; count: number; }

export default function ServerFeed() {
  const [servers, setServers] = useState<Server[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [tag, setTag] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("bump");

  const [filterOpen, setFilterOpen] = useState(false);
  const [pendingCategory, setPendingCategory] = useState("all");
  const [pendingTag, setPendingTag] = useState<string | null>(null);

  const [tags, setTags] = useState<TagCount[]>([]);

  const sentinelRef = useRef<HTMLDivElement>(null);

  // 태그 목록 로드
  useEffect(() => {
    fetch("/api/tags").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setTags(data);
    });
  }, []);

  const fetchServers = useCallback(async (opts: {
    search: string; category: string; tag: string | null; sort: Sort; page: number; replace?: boolean;
  }) => {
    const params = new URLSearchParams({
      search: opts.search,
      category: opts.category,
      sort: opts.sort,
      page: String(opts.page),
    });
    if (opts.tag) params.set("tag", opts.tag);
    const res = await fetch(`/api/servers?${params}`);
    const { servers: data, total } = await res.json();
    setTotal(total);
    if (opts.replace) setServers(data ?? []);
    else setServers((prev) => [...prev, ...(data ?? [])]);
    setHasMore(data && data.length === 20);
  }, []);

  useEffect(() => {
    setLoading(true);
    setPage(0);
    fetchServers({ search, category, tag, sort, page: 0, replace: true })
      .finally(() => setLoading(false));
  }, [search, category, tag, sort]);

  useEffect(() => {
    if (page === 0) return;
    setLoadingMore(true);
    fetchServers({ search, category, tag, sort, page }).finally(() => setLoadingMore(false));
  }, [page]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loadingMore) setPage((p) => p + 1);
    }, { rootMargin: "200px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loadingMore]);

  useEffect(() => {
    if (filterOpen) {
      setPendingCategory(category);
      setPendingTag(tag);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [filterOpen]);

  const hasFilter = category !== "all" || tag !== null;

  return (
    <div className="flex flex-col gap-5">
      {/* Search + Sort */}
      <div className="flex gap-2 flex-wrap sm:flex-nowrap">
        <div className="relative flex-1 min-w-0">
          <IconSearch size={14} stroke={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="서버 이름으로 검색..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-400 transition-colors"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Desktop: 카테고리 + 태그 */}
      <div className="hidden sm:flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {["all", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                category === cat
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              {cat === "all" ? "전체" : cat}
            </button>
          ))}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map(({ tag: t, count }) => (
              <button
                key={t}
                onClick={() => setTag(tag === t ? null : t)}
                className={`px-2.5 py-0.5 rounded-full text-xs border transition-colors ${
                  tag === t
                    ? "bg-indigo-100 dark:bg-indigo-950 border-indigo-400 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300 font-medium"
                    : "border-gray-100 dark:border-zinc-800 text-gray-400 dark:text-zinc-500 hover:border-indigo-200 hover:text-indigo-500"
                }`}
              >
                #{t} <span className="opacity-60">({count.toLocaleString()})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Count + mobile filter */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">총 {total?.toLocaleString()}개</p>
        <button
          onClick={() => setFilterOpen(true)}
          className={`sm:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-colors ${
            hasFilter
              ? "border-indigo-600 bg-indigo-600 text-white"
              : "border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400"
          }`}
        >
          <IconFilter size={11} stroke={1.5} />
          필터{hasFilter ? " ✓" : ""}
        </button>
      </div>

      {/* Mobile filter modal */}
      {filterOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFilterOpen(false)} />
          <div className="relative bg-white dark:bg-zinc-950 rounded-t-2xl p-5 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between flex-shrink-0">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">필터</span>
              <button onClick={() => setFilterOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500">
                <IconX size={14} stroke={2} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">카테고리</p>
              <div className="flex flex-wrap gap-2">
                {["all", ...CATEGORIES].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPendingCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      pendingCategory === cat
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400"
                    }`}
                  >
                    {cat === "all" ? "전체" : cat}
                  </button>
                ))}
              </div>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">태그</p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(({ tag: t, count }) => (
                    <button
                      key={t}
                      onClick={() => setPendingTag(pendingTag === t ? null : t)}
                      className={`px-2.5 py-0.5 rounded-full text-xs border transition-colors ${
                        pendingTag === t
                          ? "bg-indigo-100 dark:bg-indigo-950 border-indigo-400 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300 font-medium"
                          : "border-gray-100 dark:border-zinc-800 text-gray-400 dark:text-zinc-500"
                      }`}
                    >
                      #{t} <span className="opacity-60">({count.toLocaleString()})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => { setCategory(pendingCategory); setTag(pendingTag); setFilterOpen(false); }}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold flex-shrink-0"
            >
              적용
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => <ServerCardSkeleton key={i} />)}
        </div>
      ) : servers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <p className="text-sm">검색 결과가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {servers.map((s) => <ServerCard key={s.id} server={s} />)}
          {loadingMore && Array.from({ length: 3 }).map((_, i) => <ServerCardSkeleton key={`more-${i}`} />)}
        </div>
      )}

      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}
