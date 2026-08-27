"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { GrammarPoint, ProgressStatus } from "@/types";

const statusOrder: ProgressStatus[] = ["unlearned", "reviewing", "mastered"];

const statusStyles: Record<ProgressStatus, string> = {
  unlearned: "bg-[#F4F4F0] text-[#6B6B6B] dark:bg-[#1E232B] dark:text-[#A0A0A0]",
  reviewing: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  mastered: "bg-[#3D7D52]/10 text-[#3D7D52] dark:bg-[#34D399]/15 dark:text-[#34D399]",
};

type GrammarWithProgress = GrammarPoint & { status: ProgressStatus };

export function GrammarList({ points, progressMap }: { points: GrammarPoint[]; progressMap: Record<string, ProgressStatus> }) {
  const [items, setItems] = useState<GrammarWithProgress[]>(
    points.map((p) => ({ ...p, status: progressMap[p.id] ?? "unlearned" }))
  );
  const [expanded, setExpanded] = useState<string | null>(null);

  function cycleStatus(grammarId: string) {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== grammarId) return item;
        const nextStatus = statusOrder[(statusOrder.indexOf(item.status) + 1) % statusOrder.length];
        fetch("/api/grammar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ grammarId: item.id, level: item.level, status: nextStatus }),
        }).catch(() => {});
        return { ...item, status: nextStatus };
      })
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isOpen = expanded === item.id;
        return (
          <article key={item.id} className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xs dark:border-white/15 dark:bg-[#161B22]">
            <button
              onClick={() => setExpanded(isOpen ? null : item.id)}
              className="flex w-full items-center gap-4 p-5 text-left"
            >
              <div className="flex-1">
                <h3 className="font-serif text-xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">{item.title}</h3>
                <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">{item.meaning}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[item.status]}`}>{item.status}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  cycleStatus(item.id);
                }}
                className="rounded-xl border border-black/10 px-3 py-1.5 text-xs font-semibold text-[#6B6B6B] transition hover:bg-black/5 dark:border-white/15 dark:text-[#A0A0A0] dark:hover:bg-white/5"
              >
                Cycle
              </button>
              <ChevronDown size={20} className={`text-[#6B6B6B] dark:text-[#A0A0A0] transition ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
              <div className="border-t border-black/5 dark:border-white/10 p-5">
                <div className="mb-4 rounded-xl bg-[#F4F4F0] p-3 dark:bg-[#1E232B]">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#2D5F8A] dark:text-[#60A5FA]">Structure</span>
                  <p className="mt-1 font-mono text-sm text-[#1A1A1A] dark:text-[#FAFAFA]">{item.structure}</p>
                </div>
                <div className="space-y-3">
                  {item.examples.map((ex, i) => (
                    <div key={i} className="rounded-xl border border-black/5 dark:border-white/10 p-3">
                      <p className="font-serif text-lg text-[#1A1A1A] dark:text-[#FAFAFA]">{ex.japanese}</p>
                      <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">{ex.reading}</p>
                      <p className="mt-1 text-sm text-[#2D5F8A] dark:text-[#60A5FA]">{ex.english}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
