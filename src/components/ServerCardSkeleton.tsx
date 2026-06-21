export default function ServerCardSkeleton() {
  return (
    <div className="flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 overflow-hidden animate-pulse">
      <div className="h-16 bg-gray-100 dark:bg-zinc-800" />
      <div className="flex flex-col gap-3 p-4 pt-0">
        <div className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-zinc-700 -mt-7" />
        <div className="h-4 bg-gray-100 dark:bg-zinc-800 rounded w-3/4" />
        <div className="space-y-1.5">
          <div className="h-3 bg-gray-100 dark:bg-zinc-800 rounded w-full" />
          <div className="h-3 bg-gray-100 dark:bg-zinc-800 rounded w-5/6" />
        </div>
        <div className="flex gap-1">
          <div className="h-5 w-12 bg-gray-100 dark:bg-zinc-800 rounded" />
          <div className="h-5 w-16 bg-gray-100 dark:bg-zinc-800 rounded" />
        </div>
        <div className="h-px bg-gray-50 dark:bg-zinc-800" />
        <div className="flex justify-between">
          <div className="h-3 w-16 bg-gray-100 dark:bg-zinc-800 rounded" />
          <div className="h-3 w-20 bg-gray-100 dark:bg-zinc-800 rounded" />
        </div>
      </div>
    </div>
  );
}
