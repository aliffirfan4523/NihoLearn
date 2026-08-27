"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { KanjiEntry, ProgressStatus } from "@/types";

const statusOrder: ProgressStatus[] = ["unlearned", "reviewing", "mastered"];

const statusStyles: Record<ProgressStatus, string> = {
  unlearned: "bg-[#F0F0F0] text-[#6B6B6B] border-[#F0F0F0] dark:bg-[#1E232B] dark:text-[#A0A0A0] dark:border-[#1E232B]",
  reviewing: "bg-[#FFF3CD] text-[#856404] border-yellow-300 dark:bg-[#332E00] dark:text-[#FEF3C7] dark:border-yellow-500/50",
  mastered: "bg-[#D4EDDA] text-[#155724] border-green-300 dark:bg-[#0F2D1A] dark:text-[#D1FAE5] dark:border-green-500/50",
};

type KanjiWithProgress = KanjiEntry & { status: ProgressStatus };

export function KanjiGrid({ kanji, progressMap }: { kanji: KanjiEntry[]; progressMap: Record<string, ProgressStatus> }) {
  const [items, setItems] = useState<KanjiWithProgress[]>(
    kanji.map((k) => ({ ...k, status: progressMap[k.id] ?? "unlearned" }))
  );
  const [selected, setSelected] = useState<KanjiWithProgress | null>(null);

  function cycleStatus(kanjiId: string) {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== kanjiId) return item;
        const nextStatus = statusOrder[(statusOrder.indexOf(item.status) + 1) % statusOrder.length];
        fetch("/api/kanji", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kanjiId: item.id, level: item.level, status: nextStatus }),
        }).catch(() => {});
        return { ...item, status: nextStatus };
      })
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelected(item)}
            className={`rounded-2xl border p-4 text-center shadow-xs transition hover:border-black/20 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:hover:border-white/25 dark:focus-visible:ring-white/20 ${statusStyles[item.status]}`}
          >
            <div className="font-serif text-5xl font-bold leading-none text-[#1A1A1A] dark:text-[#F0F4F8]">{item.character}</div>
            <div className="mt-2 font-mono text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">{item.meaning.join(", ")}</div>
            <div className="mt-1 text-xs capitalize text-[#6B6B6B] dark:text-[#A0A0A0]">{item.status}</div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-lg rounded-2xl border border-black/10 bg-white p-6 shadow-2xl dark:border-white/15 dark:bg-[#161B22]">
            <button onClick={() => setSelected(null)} className="absolute right-5 top-5 rounded-full p-2 text-[#6B6B6B] hover:bg-black/5 hover:text-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:bg-white/10 dark:hover:text-[#F0F4F8]" aria-label="Close">
              <X size={20} />
            </button>

            <div className="text-center">
              <div className="font-serif text-8xl font-bold leading-none text-[#1A1A1A] dark:text-[#F0F4F8]">{selected.character}</div>
              <div className="mt-4 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">{selected.meaning.join(", ")}</div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-2xl border border-black/5 bg-[#F4F4F0] p-4 dark:border-white/10 dark:bg-[#1E232B]">
                <p className="font-semibold text-[#2D5F8A] dark:text-[#60A5FA]">Onyomi</p>
                <p className="mt-1 font-serif text-lg dark:text-[#F0F4F8]">{selected.onyomi.join("、") || "—"}</p>
              </div>
              <div className="rounded-2xl border border-black/5 bg-[#F4F4F0] p-4 dark:border-white/10 dark:bg-[#1E232B]">
                <p className="font-semibold text-[#2D5F8A] dark:text-[#60A5FA]">Kunyomi</p>
                <p className="mt-1 font-serif text-lg dark:text-[#F0F4F8]">{selected.kunyomi.join("、") || "—"}</p>
              </div>
              <div className="rounded-2xl border border-black/5 bg-[#F4F4F0] p-4 dark:border-white/10 dark:bg-[#1E232B]">
                <p className="font-semibold text-[#2D5F8A] dark:text-[#60A5FA]">Strokes</p>
                <p className="mt-1 text-lg dark:text-[#F0F4F8]">{selected.strokeCount}</p>
              </div>
              <div className="rounded-2xl border border-black/5 bg-[#F4F4F0] p-4 dark:border-white/10 dark:bg-[#1E232B]">
                <p className="font-semibold text-[#2D5F8A] dark:text-[#60A5FA]">Example words</p>
                <p className="mt-1 font-serif dark:text-[#F0F4F8]">{selected.exampleWords.join("、") || "—"}</p>
              </div>
            </div>

            <button
              onClick={() => {
                cycleStatus(selected.id);
                setSelected({ ...selected, status: statusOrder[(statusOrder.indexOf(selected.status) + 1) % statusOrder.length] });
              }}
              className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold capitalize transition ${statusStyles[selected.status]}`}
            >
              Status: {selected.status} (click to cycle)
            </button>
          </div>
        </div>
      )}
    </>
  );
}
