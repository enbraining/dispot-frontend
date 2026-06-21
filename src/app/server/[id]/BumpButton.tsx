"use client";

import { useState } from "react";
import { IconArrowUp } from "@tabler/icons-react";

export default function BumpButton({ serverId, bumpCount }: { serverId: string; bumpCount: number }) {
  const [count, setCount] = useState(bumpCount);
  const [bumped, setBumped] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleBump() {
    if (bumped || loading) return;
    setLoading(true);
    try {
      await fetch("/api/bump", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: serverId }) });
      setCount((c) => c + 1);
      setBumped(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleBump}
      disabled={bumped || loading}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${
        bumped
          ? "border-indigo-200 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-400"
          : "border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:border-indigo-400 hover:text-indigo-600"
      }`}
    >
      <IconArrowUp size={14} stroke={2} />
      {bumped ? "범프됨" : "범프"} {count}
    </button>
  );
}
