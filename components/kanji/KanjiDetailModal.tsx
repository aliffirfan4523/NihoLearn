"use client";

import { useState } from "react";
import { X, Play, Volume2, CheckCircle2, RotateCw } from "lucide-react";
import { KanjiStrokeAnimator } from "@/components/kanji/KanjiStrokeAnimator";
import { playJapaneseAudio } from "@/lib/audio";
import type { ProgressStatus } from "@/types";

export interface KanjiDetailData {
  id: string;
  character: string;
  strokes: number;
  radicalNumber?: number | null;
  frequency?: number | null;
  jlpt: string;
  meaning: string;
  onyomi: string[];
  kunyomi: string[];
  examples: Array<{ word: string; reading: string; meaning: string }>;
  description?: string | null;
  status: ProgressStatus;
  notes?: string | null;
  practiceCount?: number;
  successRate?: number;
}

const statusDisplayNames: Record<ProgressStatus, string> = {
  unlearned: "Not learned",
  reviewing: "Learning",
  mastered: "Mastered",
};

const statusOrder: ProgressStatus[] = ["unlearned", "reviewing", "mastered"];

export function KanjiDetailModal({
  kanji,
  onClose,
  onStatusChange,
}: {
  kanji: KanjiDetailData | null;
  onClose: () => void;
  onStatusChange?: (kanjiId: string, nextStatus: ProgressStatus) => void;
}) {
  if (!kanji) return null;

  const handleCycleStatus = () => {
    const nextStatus = statusOrder[(statusOrder.indexOf(kanji.status) + 1) % statusOrder.length];
    if (onStatusChange) {
      onStatusChange(kanji.id, nextStatus);
    }
  };

  const primaryKunyomi = kanji.kunyomi[0] || null;
  const otherKunyomi = kanji.kunyomi.slice(1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm dark:bg-black/80 animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-black/10 bg-white p-6 text-[#1A1A1A] shadow-xs dark:border-white/15 dark:bg-[#161B22] dark:text-[#F0F4F8] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-[#6B6B6B] transition hover:bg-black/5 hover:text-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:bg-white/10 dark:hover:text-white"
        >
          <X size={20} />
        </button>

        {/* 1. Kanji Stroke Animator Header */}
        <div className="pt-2 pb-5">
          <KanjiStrokeAnimator character={kanji.character} strokesCount={kanji.strokes} />
        </div>

        <div className="space-y-4">
          {/* 2. READINGS & MEANING SECTION */}
          <div className="rounded-2xl border border-black/5 bg-[#F4F4F0] p-5 dark:border-white/10 dark:bg-[#1E232B]">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] dark:text-[#A0A0A0]">
              Readings &amp; Meaning
            </h4>

            {/* Onyomi */}
            <div className="mt-4 flex items-baseline justify-between gap-4 border-b border-black/5 pb-3 dark:border-white/10">
              <span className="text-xs font-medium text-[#6B6B6B] dark:text-[#A0A0A0]">Onyomi</span>
              <div className="flex flex-wrap items-center gap-3">
                {kanji.onyomi.length > 0 ? (
                  kanji.onyomi.map((on, idx) => (
                    <span key={idx} className="font-serif text-sm font-semibold text-[#2D5F8A] dark:text-[#60A5FA]">
                      {on}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#6B6B6B]/70 dark:text-[#A0A0A0]/70">—</span>
                )}
              </div>
            </div>

            {/* Kunyomi */}
            <div className="mt-3 flex items-baseline justify-between gap-4 border-b border-black/5 pb-3 dark:border-white/10">
              <span className="text-xs font-medium text-[#6B6B6B] dark:text-[#A0A0A0]">Kunyomi</span>
              <div className="flex flex-wrap items-center gap-2">
                {primaryKunyomi && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#C84B31] px-3 py-0.5 text-xs font-bold text-white shadow-xs dark:bg-[#E85C40]">
                    ★ {primaryKunyomi}
                  </span>
                )}
                {otherKunyomi.map((kun, idx) => (
                  <span key={idx} className="font-serif text-sm font-semibold text-[#C84B31] dark:text-[#E85C40]">
                    {kun}
                  </span>
                ))}
                {kanji.kunyomi.length === 0 && <span className="text-xs text-[#6B6B6B]/70 dark:text-[#A0A0A0]/70">—</span>}
              </div>
            </div>

            {/* Subtitle helper note */}
            <p className="mt-2 text-xs italic text-[#6B6B6B] dark:text-[#A0A0A0]">
              All readings shown. The JLPT tests readings through vocabulary, so focus on the highlighted ones.
            </p>

            {/* English Meanings */}
            <div className="mt-3 font-medium text-sm text-[#1A1A1A] dark:text-[#F0F4F8]">
              {kanji.meaning}
            </div>
          </div>

          {/* 3. RADICAL & COMPONENTS SECTION */}
          <div className="grid grid-cols-2 gap-3">
            {/* RADICAL */}
            <div className="rounded-2xl border border-black/5 bg-[#F4F4F0] p-4 dark:border-white/10 dark:bg-[#1E232B]">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] dark:text-[#A0A0A0]">
                Radical
              </h4>
              <div className="mt-3 flex flex-col items-center justify-center rounded-xl border border-black/5 bg-white p-4 dark:border-white/10 dark:bg-[#161B22]">
                <div className="font-serif text-4xl font-bold text-[#2D5F8A] dark:text-[#60A5FA]">
                  {kanji.character}
                </div>
                <div className="mt-2 text-center text-xs font-semibold text-[#1A1A1A] dark:text-[#F0F4F8]">
                  {kanji.character}
                </div>
                <div className="text-xs text-[#6B6B6B] capitalize dark:text-[#A0A0A0]">
                  {kanji.meaning.split(",")[0] || "radical"}
                </div>
              </div>
            </div>

            {/* COMPONENTS */}
            <div className="rounded-2xl border border-black/5 bg-[#F4F4F0] p-4 dark:border-white/10 dark:bg-[#1E232B]">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] dark:text-[#A0A0A0]">
                Components
              </h4>
              <div className="mt-3 flex h-[104px] items-center justify-center rounded-xl border border-black/5 bg-white p-4 text-sm text-[#6B6B6B] dark:border-white/10 dark:bg-[#161B22] dark:text-[#A0A0A0]">
                {kanji.strokes > 6 ? (
                  <span className="font-serif text-xl font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
                    {kanji.character}
                  </span>
                ) : (
                  "—"
                )}
              </div>
            </div>
          </div>

          {/* 4. RELATED VOCABULARY SECTION */}
          <div className="rounded-2xl border border-black/5 bg-[#F4F4F0] p-5 dark:border-white/10 dark:bg-[#1E232B]">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] dark:text-[#A0A0A0]">
              Related Vocabulary
            </h4>

            {kanji.examples && kanji.examples.length > 0 ? (
              <div className="mt-3 space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {kanji.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl border border-black/5 bg-white p-3 transition hover:border-black/20 hover:shadow-sm dark:border-white/10 dark:bg-[#161B22] dark:hover:border-white/25"
                  >
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-base font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
                          {ex.word}
                        </span>
                        <span className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">{ex.reading}</span>
                      </div>
                      <div className="mt-0.5 text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">{ex.meaning}</div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playJapaneseAudio(ex.word);
                      }}
                      className="rounded-full bg-black/5 p-2 text-[#6B6B6B] transition hover:bg-[#C84B31] hover:text-white dark:bg-white/5 dark:text-[#A0A0A0] dark:hover:bg-[#E85C40] dark:hover:text-white"
                      title="Play Pronunciation"
                    >
                      <Play size={13} className="fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 text-xs text-[#6B6B6B]/70 dark:text-[#A0A0A0]/70 italic">
                No vocabulary compounds recorded.
              </div>
            )}
          </div>

          {/* 5. PROGRESS & STATISTICS SECTION */}
          <div className="rounded-2xl border border-black/5 bg-[#F4F4F0] p-5 dark:border-white/10 dark:bg-[#1E232B]">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] dark:text-[#A0A0A0]">
              Progress &amp; Statistics
            </h4>

            <div className="mt-3 grid grid-cols-2 gap-3">
              {/* JLPT Level */}
              <div className="rounded-xl border border-black/5 bg-white p-3.5 text-center dark:border-white/10 dark:bg-[#161B22]">
                <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">JLPT Level</div>
                <div className="mt-1 text-lg font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">{kanji.jlpt}</div>
              </div>

              {/* Status with interactive cycle */}
              <button
                type="button"
                onClick={handleCycleStatus}
                className="group rounded-xl border border-black/5 bg-white p-3.5 text-center transition hover:border-[#C84B31]/30 hover:bg-[#F4F4F0] dark:border-white/10 dark:bg-[#161B22] dark:hover:border-[#E85C40]/30 dark:hover:bg-[#1E232B]"
              >
                <div className="flex items-center justify-center gap-1 text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
                  <span>Status</span>
                  <RotateCw size={10} className="transition group-hover:rotate-180" />
                </div>
                <div className="mt-1 text-base font-bold text-[#2D5F8A] dark:text-[#60A5FA]">
                  {statusDisplayNames[kanji.status] || "Not learned"}
                </div>
              </button>

              {/* Practice Count */}
              <div className="rounded-xl border border-black/5 bg-white p-3.5 text-center dark:border-white/10 dark:bg-[#161B22]">
                <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Practice Count</div>
                <div className="mt-1 text-lg font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
                  {kanji.practiceCount ?? 0}
                </div>
              </div>

              {/* Success Rate */}
              <div className="rounded-xl border border-black/5 bg-white p-3.5 text-center dark:border-white/10 dark:bg-[#161B22]">
                <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Success Rate</div>
                <div className="mt-1 text-lg font-bold text-[#3D7D52] dark:text-[#34D399]">
                  {kanji.successRate ?? (kanji.status === "mastered" ? 100 : kanji.status === "reviewing" ? 60 : 0)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
