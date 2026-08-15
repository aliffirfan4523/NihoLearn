"use client";

import { useState, useMemo } from "react";
import { Play, Volume2, Search, Filter, ChevronLeft, ChevronRight, CheckCircle2, RotateCw } from "lucide-react";
import { playJapaneseAudio } from "@/lib/audio";
import type { VocabWord, ProgressStatus } from "@/types";

const statusOrder: ProgressStatus[] = ["unlearned", "reviewing", "mastered"];

const statusDisplayNames: Record<ProgressStatus, string> = {
  unlearned: "Not learned",
  reviewing: "Learning",
  mastered: "Mastered",
};

const statusStyles: Record<ProgressStatus, string> = {
  unlearned:
    "bg-gray-100 text-gray-600 dark:bg-gray-800/60 dark:text-gray-300 border border-gray-200 dark:border-gray-700",
  reviewing:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50",
  mastered:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50",
};

type VocabWithProgress = VocabWord & { status: ProgressStatus; progressId?: string };

export function VocabTable({
  words,
  progressMap,
}: {
  words: VocabWord[];
  progressMap: Record<string, { id: string; status: ProgressStatus }>;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | ProgressStatus>("all");
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const [items, setItems] = useState<VocabWithProgress[]>(() =>
    words.map((w) => ({
      ...w,
      status: progressMap[w.id]?.status ?? "unlearned",
      progressId: progressMap[w.id]?.id,
    }))
  );

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (filter !== "all" && item.status !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          item.word.toLowerCase().includes(q) ||
          item.reading.toLowerCase().includes(q) ||
          (item.romaji && item.romaji.toLowerCase().includes(q)) ||
          item.meaning.some((m) => m.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [items, search, filter]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  function cycleStatus(wordId: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation();

    setItems((current) =>
      current.map((item) => {
        if (item.id !== wordId) return item;
        const nextStatus = statusOrder[(statusOrder.indexOf(item.status) + 1) % statusOrder.length];
        
        // Background sync
        fetch("/api/vocab", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wordId: item.id, level: item.level, status: nextStatus }),
        }).catch(() => {});

        return { ...item, status: nextStatus };
      })
    );
  }

  const masteredCount = items.filter((i) => i.status === "mastered").length;
  const learningCount = items.filter((i) => i.status === "reviewing").length;

  return (
    <div className="space-y-5">
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search word, reading, or English meaning..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-2xl border border-black/10 bg-white py-3 pl-11 pr-4 text-sm text-[#1A1A1A] outline-none transition focus:border-[var(--color-vermillion)] dark:border-white/10 dark:bg-[#161B22] dark:text-[#F0F4F8]"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(["all", "unlearned", "reviewing", "mastered"] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
              className={`rounded-xl px-3.5 py-2.5 text-xs font-bold capitalize transition ${
                filter === f
                  ? "bg-[var(--color-vermillion)] text-white shadow-xs"
                  : "border border-black/10 bg-white text-[#6B6B6B] hover:bg-black/5 dark:border-white/10 dark:bg-[#161B22] dark:text-[#94A3B8] dark:hover:bg-white/5"
              }`}
            >
              {f === "all" ? `All (${items.length})` : f === "reviewing" ? `Learning (${learningCount})` : f === "mastered" ? `Mastered (${masteredCount})` : `Not learned`}
            </button>
          ))}
        </div>
      </div>

      {/* Vocabulary Table Container */}
      <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-xs dark:border-white/10 dark:bg-[#161B22]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-black/5 bg-[#FAFAF8] text-xs font-bold uppercase tracking-wider text-[#64748B] dark:border-white/5 dark:bg-[#1E232B] dark:text-[#94A3B8]">
              <tr>
                <th className="py-3.5 pl-5 pr-3">Expression</th>
                <th className="px-3 py-3.5">Reading</th>
                <th className="px-3 py-3.5">Meaning</th>
                <th className="px-3 py-3.5">Audio</th>
                <th className="px-3 py-3.5">Level</th>
                <th className="py-3.5 pl-3 pr-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {paginatedItems.map((item) => (
                <tr
                  key={item.id}
                  className="group transition hover:bg-[#FAFAF8] dark:hover:bg-[#1E232B]/60"
                >
                  {/* Expression */}
                  <td className="py-3.5 pl-5 pr-3">
                    <span className="font-serif text-lg font-bold text-[#1A1A1A] group-hover:text-[var(--color-vermillion)] dark:text-[#F0F4F8]">
                      {item.word}
                    </span>
                  </td>

                  {/* Reading */}
                  <td className="px-3 py-3.5">
                    <span className="font-medium text-[#475569] dark:text-[#CBD5E1]">
                      {item.reading}
                    </span>
                  </td>

                  {/* Meaning */}
                  <td className="px-3 py-3.5 max-w-xs truncate">
                    <span className="text-xs text-[#1A1A1A] dark:text-[#E2E8F0]">
                      {item.meaning.join(", ")}
                    </span>
                  </td>

                  {/* Audio */}
                  <td className="px-3 py-3.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playJapaneseAudio(item.word);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-gray-600 transition hover:bg-[var(--color-vermillion)] hover:text-white dark:bg-white/5 dark:text-gray-400 dark:hover:bg-[var(--color-vermillion)] dark:hover:text-white"
                      title="Play Pronunciation"
                    >
                      <Play size={12} className="fill-current" />
                    </button>
                  </td>

                  {/* Level Badge */}
                  <td className="px-3 py-3.5">
                    <span className="rounded-md bg-black/5 px-2 py-0.5 text-[11px] font-bold text-[#64748B] dark:bg-white/5 dark:text-[#94A3B8]">
                      {item.level}
                    </span>
                  </td>

                  {/* Status Toggle Button */}
                  <td className="py-3.5 pl-3 pr-5 text-right">
                    <button
                      type="button"
                      onClick={(e) => cycleStatus(item.id, e)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold capitalize transition hover:scale-105 ${
                        statusStyles[item.status]
                      }`}
                      title="Click to cycle status"
                    >
                      <RotateCw size={10} className="opacity-70" />
                      <span>{statusDisplayNames[item.status]}</span>
                    </button>
                  </td>
                </tr>
              ))}

              {paginatedItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#64748B] dark:text-[#94A3B8]">
                    No vocabulary words matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-black/5 px-5 py-3.5 dark:border-white/5">
            <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Showing <span className="font-bold">{(page - 1) * pageSize + 1}</span> to{" "}
              <span className="font-bold">
                {Math.min(page * pageSize, filtered.length)}
              </span>{" "}
              of <span className="font-bold">{filtered.length}</span> words
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-black/10 bg-white text-gray-600 transition disabled:opacity-30 dark:border-white/10 dark:bg-[#161B22] dark:text-gray-300"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-black/10 bg-white text-gray-600 transition disabled:opacity-30 dark:border-white/10 dark:bg-[#161B22] dark:text-gray-300"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
