"use client";

import { useState, useMemo } from "react";
import { Play, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { playJapaneseAudio } from "@/lib/audio";
import type { VocabWord, ProgressStatus } from "@/types";

const statusOrder: ProgressStatus[] = ["unlearned", "reviewing", "mastered"];

const statusDisplayNames: Record<ProgressStatus, string> = {
  unlearned: "Not learned",
  reviewing: "Learning",
  mastered: "Mastered",
};

// Minimal status glyphs — no pastel pills. ○ unlearned · ● learning · ✓ mastered (vermillion)
const statusGlyphs: Record<ProgressStatus, { glyph: string; className: string }> = {
  unlearned: {
    glyph: "○",
    className: "text-[#6B6B6B] dark:text-[#A0A0A0]",
  },
  reviewing: {
    glyph: "●",
    className: "text-[#C84B31] dark:text-[#E85C40]",
  },
  mastered: {
    glyph: "✓",
    className: "text-[#C84B31] dark:text-[#E85C40]",
  },
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
          <Search size={16} aria-hidden="true" className="absolute left-4 top-3.5 text-[#6B6B6B] dark:text-[#A0A0A0]" />
          <input
            type="text"
            placeholder="Search word, reading, or English meaning..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-2xl border border-black/10 bg-white py-3 pl-11 pr-4 text-sm text-[#1A1A1A] outline-none transition focus:border-[#C84B31] dark:border-white/10 dark:bg-[#161B22] dark:text-[#F0F4F8] dark:focus:border-[#E85C40]"
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
                  ? "bg-[#C84B31] text-white dark:bg-[#E85C40]"
                  : "border border-black/10 bg-white text-[#6B6B6B] hover:bg-black/5 dark:border-white/10 dark:bg-[#161B22] dark:text-[#A0A0A0] dark:hover:bg-white/5"
              }`}
            >
              {f === "all" ? `All (${items.length})` : f === "reviewing" ? `Learning (${learningCount})` : f === "mastered" ? `Mastered (${masteredCount})` : `Not learned`}
            </button>
          ))}
        </div>
      </div>

      {/* Vocabulary Display: Mobile Cards + Desktop Table — no bounding box, flush to margins */}
      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {paginatedItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-3.5 dark:border-white/10 dark:bg-[#161B22]"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
                  {item.word}
                </span>
                <span className="text-xs font-bold text-[#6B6B6B] dark:text-[#A0A0A0]">
                  {item.level}
                </span>
              </div>
              <div className="mt-0.5 text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
                {item.reading}
              </div>
              <div className="mt-0.5 truncate text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
                {item.meaning.join(", ")}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playJapaneseAudio(item.word);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-[#6B6B6B] transition hover:bg-[#C84B31] hover:text-white dark:bg-white/5 dark:text-[#A0A0A0] dark:hover:bg-[#E85C40]"
                title="Play Pronunciation"
                aria-label={`Play pronunciation of ${item.word}`}
              >
                <Play size={12} className="fill-current" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={(e) => cycleStatus(item.id, e)}
                className={`inline-flex items-center gap-1.5 px-1 py-1.5 text-xs font-semibold transition hover:underline ${statusGlyphs[item.status].className}`}
                title="Click to cycle status"
                aria-label={`${statusDisplayNames[item.status]} — click to change status`}
              >
                <span aria-hidden="true" className="text-sm leading-none">{statusGlyphs[item.status].glyph}</span>
                <span>{statusDisplayNames[item.status]}</span>
              </button>
            </div>
          </div>
        ))}

        {paginatedItems.length === 0 && (
          <div className="py-12 text-center text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
            No vocabulary words matching your query.
          </div>
        )}
      </div>

      {/* Desktop Table View — typeset textbook table: bold headers, hairline rows, no chrome */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-y border-black/10 text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:border-white/10 dark:text-[#A0A0A0]">
            <tr>
              <th className="py-3.5 pl-1 pr-3">Expression</th>
              <th className="px-3 py-3.5">Reading</th>
              <th className="px-3 py-3.5">Meaning</th>
              <th className="px-3 py-3.5">Audio</th>
              <th className="px-3 py-3.5">Level</th>
              <th className="py-3.5 pl-3 pr-1 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {paginatedItems.map((item) => (
              <tr
                key={item.id}
                className="group transition hover:bg-[#FAFAF8] dark:hover:bg-[#1E232B]/60"
              >
                <td className="py-3.5 pl-1 pr-3">
                  <span className="font-serif text-lg font-bold text-[#1A1A1A] group-hover:text-[#C84B31] dark:text-[#F0F4F8] dark:group-hover:text-[#E85C40]">
                    {item.word}
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  <span className="font-medium text-[#1A1A1A] dark:text-[#F0F4F8]">
                    {item.reading}
                  </span>
                </td>
                <td className="px-3 py-3.5 max-w-xs truncate">
                  <span className="text-xs text-[#1A1A1A] dark:text-[#F0F4F8]">
                    {item.meaning.join(", ")}
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playJapaneseAudio(item.word);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-[#6B6B6B] transition hover:bg-[#C84B31] hover:text-white dark:bg-white/5 dark:text-[#A0A0A0] dark:hover:bg-[#E85C40] dark:hover:text-white"
                    title="Play Pronunciation"
                    aria-label={`Play pronunciation of ${item.word}`}
                  >
                    <Play size={12} className="fill-current" aria-hidden="true" />
                  </button>
                </td>
                <td className="px-3 py-3.5">
                  <span className="text-xs font-bold text-[#6B6B6B] dark:text-[#A0A0A0]">
                    {item.level}
                  </span>
                </td>
                <td className="py-3.5 pl-3 pr-1 text-right">
                  <button
                    type="button"
                    onClick={(e) => cycleStatus(item.id, e)}
                    className={`inline-flex items-center gap-1.5 px-1 py-1 text-xs font-semibold capitalize transition hover:underline ${statusGlyphs[item.status].className}`}
                    title="Click to cycle status"
                    aria-label={`${statusDisplayNames[item.status]} — click to change status`}
                  >
                    <span aria-hidden="true" className="text-sm leading-none">{statusGlyphs[item.status].glyph}</span>
                    <span>{statusDisplayNames[item.status]}</span>
                  </button>
                </td>
              </tr>
            ))}

            {paginatedItems.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
                  No vocabulary words matching your query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-black/5 pt-3.5 dark:border-white/5">
          <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
            Showing <span className="font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">{(page - 1) * pageSize + 1}</span> to{" "}
            <span className="font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
              {Math.min(page * pageSize, filtered.length)}
            </span>{" "}
            of <span className="font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">{filtered.length}</span> words
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-black/10 bg-white text-[#6B6B6B] transition hover:border-black/20 disabled:opacity-30 dark:border-white/10 dark:bg-[#161B22] dark:text-[#A0A0A0]"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-black/10 bg-white text-[#6B6B6B] transition hover:border-black/20 disabled:opacity-30 dark:border-white/10 dark:bg-[#161B22] dark:text-[#A0A0A0]"
              aria-label="Next page"
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
