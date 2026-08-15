"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { KanjiEntry, ProgressStatus } from "@/types";

const statusOrder: ProgressStatus[] = ["unlearned", "reviewing", "mastered"];

const statusStyles: Record<ProgressStatus, string> = {
  unlearned: "bg-[#F0F0F0] text-[#6B6B6B] border-[#F0F0F0] dark:bg-[#2A2A2A] dark:text-[#A0A0A0] dark:border-[#2A2A2A]",
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
            className={`rounded-2xl border p-4 text-center shadow-sm transition hover:-translate-y-1 ${statusStyles[item.status]}`}
          >
            <div className="font-serif text-5xl font-bold leading-none text-[#1A1A1A] dark:text-[#FAFAFA]">{item.character}</div>
            <div className="mt-2 font-mono text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">{item.meaning.join(", ")}</div>
            <div className="mt-1 text-xs capitalize text-[#6B6B6B] dark:text-[#A0A0A0]">{item.status}</div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 dark:bg-black/60 p-4" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl dark:bg-[#1A1A1A]">
            <button onClick={() => setSelected(null)} className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-[#2A2A2A]" aria-label="Close">
              <X size={20} />
            </button>

            <div className="text-center">
              <div className="font-serif text-8xl font-bold leading-none text-[#1A1A1A] dark:text-[#FAFAFA]">{selected.character}</div>
              <div className="mt-4 text-lg text-[#6B6B6B] dark:text-[#A0A0A0]">{selected.meaning.join(", ")}</div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-2xl bg-[#FAFAF8] p-4 dark:bg-[#2A2A2A]">
                <p className="font-semibold text-[#2D5F8A] dark:text-[#4A86B8]">Onyomi</p>
                <p className="mt-1 font-serif text-lg dark:text-[#FAFAFA]">{selected.onyomi.join("、") || "—"}</p>
              </div>
              <div className="rounded-2xl bg-[#FAFAF8] p-4 dark:bg-[#2A2A2A]">
                <p className="font-semibold text-[#2D5F8A] dark:text-[#4A86B8]">Kunyomi</p>
                <p className="mt-1 font-serif text-lg dark:text-[#FAFAFA]">{selected.kunyomi.join("、") || "—"}</p>
              </div>
              <div className="rounded-2xl bg-[#FAFAF8] p-4 dark:bg-[#2A2A2A]">
                <p className="font-semibold text-[#2D5F8A] dark:text-[#4A86B8]">Strokes</p>
                <p className="mt-1 text-lg dark:text-[#FAFAFA]">{selected.strokeCount}</p>
              </div>
              <div className="rounded-2xl bg-[#FAFAF8] p-4 dark:bg-[#2A2A2A]">
                <p className="font-semibold text-[#2D5F8A] dark:text-[#4A86B8]">Example words</p>
                <p className="mt-1 font-serif dark:text-[#FAFAFA]">{selected.exampleWords.join("、") || "—"}</p>
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
