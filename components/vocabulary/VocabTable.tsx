"use client";

import { useState, useMemo } from "react";
import type { VocabWord, ProgressStatus } from "@/types";

const statusOrder: ProgressStatus[] = ["unlearned", "reviewing", "mastered"];

const statusStyles: Record<ProgressStatus, string> = {
  unlearned: "bg-[#F0F0F0] text-[#6B6B6B]",
  reviewing: "bg-[#FFF3CD] text-[#856404]",
  mastered: "bg-[#D4EDDA] text-[#155724]",
};

type VocabWithProgress = VocabWord & { status: ProgressStatus; progressId?: string };

export function VocabTable({ words, progressMap }: { words: VocabWord[]; progressMap: Record<string, { id: string; status: ProgressStatus }> }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | ProgressStatus>("all");
  const [items, setItems] = useState<VocabWithProgress[]>(
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
          item.romaji.toLowerCase().includes(q) ||
          item.meaning.some((m) => m.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [items, search, filter]);

  function cycleStatus(wordId: string) {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== wordId) return item;
        const nextStatus = statusOrder[(statusOrder.indexOf(item.status) + 1) % statusOrder.length];
        // Optimistic update
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

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search vocabulary..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-[#C84B31]"
        />
        <div className="flex gap-2">
          {(["all", "unlearned", "reviewing", "mastered"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-xl px-4 py-3 text-sm font-semibold capitalize transition ${
                filter === f ? "bg-[#C84B31] text-white" : "border border-black/10 bg-white text-[#6B6B6B] hover:bg-[#FAFAF8]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="rounded-xl bg-[#FAFAF8] px-4 py-3 text-sm font-semibold text-[#3D7D52]">
          {masteredCount}/{items.length} mastered
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
        <div className="max-h-[70vh] overflow-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="sticky top-0 bg-[#FAFAF8] text-left text-[#6B6B6B]">
              <tr>
                <th className="p-3">Word</th>
                <th className="p-3">Reading</th>
                <th className="p-3">Romaji</th>
                <th className="p-3">Meaning</th>
                <th className="p-3">Type</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-t border-black/5 hover:bg-[#FAFAF8]">
                  <td className="p-3 font-serif text-lg font-bold text-[#1A1A1A]">{item.word}</td>
                  <td className="p-3 text-[#6B6B6B]">{item.reading}</td>
                  <td className="p-3 font-mono text-xs text-[#6B6B6B]">{item.romaji}</td>
                  <td className="p-3 text-[#1A1A1A]">{item.meaning.join(", ")}</td>
                  <td className="p-3 text-xs text-[#6B6B6B]">{item.partOfSpeech}</td>
                  <td className="p-3">
                    <button
                      onClick={() => cycleStatus(item.id)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition hover:scale-105 ${statusStyles[item.status]}`}
                    >
                      {item.status}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#6B6B6B]">
                    No vocabulary found. Try a different search or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
