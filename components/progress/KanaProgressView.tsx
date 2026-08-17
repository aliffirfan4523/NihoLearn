"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, ArrowRight, Play, CheckCircle2, RotateCw, Trophy, Flame, ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { BASIC_ROWS, DAKUTEN_ROWS, COMBO_ROWS, kanaByGroup, type KanaRef } from "@/lib/kana-groups";
import { KanaFlashcardModal } from "@/components/kana/KanaFlashcardModal";
import type { KanaCharacter } from "@/types";

export interface KanaProgressStats {
  basicHiraCount: number;
  dakutenHiraCount: number;
  combiHiraCount: number;
  basicKataCount: number;
  dakutenKataCount: number;
  combiKataCount: number;
  totalMastered: number;
  totalKana: number;
  masteredIdSet: string[];
  struggles?: Array<{ id: string; character: string; romaji: string }>;
}

export function KanaProgressView({ stats, kana }: { stats?: KanaProgressStats; kana: KanaRef[] }) {
  const [selectedKana, setSelectedKana] = useState<KanaCharacter | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    hira_basic: true,
    hira_dakuten: false,
    hira_combination: false,
    kata_basic: false,
    kata_dakuten: false,
    kata_combination: false,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const basicHira = kanaByGroup(kana, "hiragana", BASIC_ROWS);
  const dakutenHira = kanaByGroup(kana, "hiragana", DAKUTEN_ROWS);
  const combiHira = kanaByGroup(kana, "hiragana", COMBO_ROWS);

  const basicKata = kanaByGroup(kana, "katakana", BASIC_ROWS);
  const dakutenKata = kanaByGroup(kana, "katakana", DAKUTEN_ROWS);
  const combiKata = kanaByGroup(kana, "katakana", COMBO_ROWS);

  const masteredIds = new Set(stats?.masteredIdSet || []);

  const basicHiraMastered = stats?.basicHiraCount ?? 0;
  const dakutenHiraMastered = stats?.dakutenHiraCount ?? 0;
  const combiHiraMastered = stats?.combiHiraCount ?? 0;

  const basicKataMastered = stats?.basicKataCount ?? 0;
  const dakutenKataMastered = stats?.dakutenKataCount ?? 0;
  const combiKataMastered = stats?.combiKataCount ?? 0;

  const totalHiraMastered = basicHiraMastered + dakutenHiraMastered + combiHiraMastered;
  const totalKataMastered = basicKataMastered + dakutenKataMastered + combiKataMastered;
  const totalMastered = stats?.totalMastered ?? (totalHiraMastered + totalKataMastered);
  const hiraganaCount = basicHira.length + dakutenHira.length + combiHira.length;
  const katakanaCount = basicKata.length + dakutenKata.length + combiKata.length;
  const totalKana = stats?.totalKana ?? (hiraganaCount + katakanaCount);

  const basicHiraPct = Math.round((basicHiraMastered / basicHira.length) * 100);
  const dakutenHiraPct = Math.round((dakutenHiraMastered / dakutenHira.length) * 100);
  const combiHiraPct = Math.round((combiHiraMastered / combiHira.length) * 100);
  const avgHiraPct = Math.round((totalHiraMastered / hiraganaCount) * 100);

  const basicKataPct = Math.round((basicKataMastered / basicKata.length) * 100);
  const dakutenKataPct = Math.round((dakutenKataMastered / dakutenKata.length) * 100);
  const combiKataPct = Math.round((combiKataMastered / combiKata.length) * 100);
  const avgKataPct = Math.round((totalKataMastered / katakanaCount) * 100);

  const overallMasteryPct = Math.round((totalMastered / totalKana) * 100);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-5 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/progress"
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Progress
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-xs font-bold text-[#C84B31] dark:text-[#E85C40]">Kana</span>
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#FAFAFA]">
            Kana Progress
          </h1>
          <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
            Track accuracy and drill Hiragana, Katakana, Dakuten, and Combination rows.
          </p>
        </div>

        <Link
          href="/practice/kana"
          className="flex items-center gap-2 rounded-2xl bg-[#C84B31] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#b03e26] dark:bg-[#E85C40]"
        >
          <RotateCw size={16} />
          <span>Practice Kana</span>
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Kana Breakdown */}
        <div className="space-y-8 lg:col-span-8">
          {/* Hiragana Section */}
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Hiragana</h2>
              <span className="text-xs font-semibold text-[#6B6B6B] dark:text-[#A0A0A0]">
                Average mastery: {avgHiraPct}%
              </span>
            </div>

            <div className="space-y-3">
              {/* Basic Hiragana Accordion */}
              <div className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-xs dark:border-white/15 dark:bg-[#1A1A1A]">
                <button
                  type="button"
                  onClick={() => toggleSection("hira_basic")}
                  className="flex w-full items-center justify-between p-4.5 text-left font-bold text-sm text-[#1A1A1A] hover:bg-[#FAFAF8] dark:text-[#FAFAFA] dark:hover:bg-[#2A2A2A]"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-lg text-[#C84B31] dark:text-[#E85C40]">あ</span>
                    <span>Basic Hiragana</span>
                    <span className="text-xs font-normal text-gray-400">
                      (10 rows · {basicHira.length} kana)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        basicHiraPct > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"
                      }`}
                    >
                      {basicHiraPct}%
                    </span>
                    {openSections.hira_basic ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                </button>

                {openSections.hira_basic && (
                  <div className="border-t border-black/5 p-4 bg-[#FAFAF8] dark:border-white/10 dark:bg-[#2A2A2A]">
                    <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                      {basicHira.map((k) => {
                        const isMastered = masteredIds.has(k.id);
                        return (
                          <button
                            key={k.id}
                            type="button"
                            onClick={() => setSelectedKana({ ...k, status: isMastered ? "mastered" : "unlearned" } as any)}
                            className={`flex flex-col items-center justify-center rounded-xl p-2 shadow-2xs transition hover:scale-105 ${
                              isMastered
                                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-300"
                                : "bg-white border border-black/5 text-[#1A1A1A] dark:bg-[#1A1A1A] dark:border-white/10 dark:text-[#FAFAFA]"
                            }`}
                          >
                            <span className="font-serif text-lg font-bold">{k.character}</span>
                            <span className="text-[10px] text-gray-400">{k.romaji}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Dakuten Hiragana Accordion */}
              <div className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-xs dark:border-white/15 dark:bg-[#1A1A1A]">
                <button
                  type="button"
                  onClick={() => toggleSection("hira_dakuten")}
                  className="flex w-full items-center justify-between p-4.5 text-left font-bold text-sm text-[#1A1A1A] hover:bg-[#FAFAF8] dark:text-[#FAFAFA] dark:hover:bg-[#2A2A2A]"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-lg text-[#2D5F8A] dark:text-[#4A86B8]">が</span>
                    <span>Dakuten and Handakuten</span>
                    <span className="text-xs font-normal text-gray-400">
                      (5 rows · {dakutenHira.length} kana)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        dakutenHiraPct > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"
                      }`}
                    >
                      {dakutenHiraPct}%
                    </span>
                    {openSections.hira_dakuten ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                </button>

                {openSections.hira_dakuten && (
                  <div className="border-t border-black/5 p-4 bg-[#FAFAF8] dark:border-white/10 dark:bg-[#2A2A2A]">
                    <div className="grid grid-cols-5 gap-2">
                      {dakutenHira.map((k) => {
                        const isMastered = masteredIds.has(k.id);
                        return (
                          <button
                            key={k.id}
                            type="button"
                            onClick={() => setSelectedKana({ ...k, status: isMastered ? "mastered" : "unlearned" } as any)}
                            className={`flex flex-col items-center justify-center rounded-xl p-2 shadow-2xs transition hover:scale-105 ${
                              isMastered
                                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-300"
                                : "bg-white border border-black/5 text-[#1A1A1A] dark:bg-[#1A1A1A] dark:border-white/10 dark:text-[#FAFAFA]"
                            }`}
                          >
                            <span className="font-serif text-lg font-bold">{k.character}</span>
                            <span className="text-[10px] text-gray-400">{k.romaji}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Combination Hiragana Accordion */}
              <div className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-xs dark:border-white/15 dark:bg-[#1A1A1A]">
                <button
                  type="button"
                  onClick={() => toggleSection("hira_combination")}
                  className="flex w-full items-center justify-between p-4.5 text-left font-bold text-sm text-[#1A1A1A] hover:bg-[#FAFAF8] dark:text-[#FAFAFA] dark:hover:bg-[#2A2A2A]"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-lg text-purple-600 dark:text-purple-400">きゃ</span>
                    <span>Combination Hiragana</span>
                    <span className="text-xs font-normal text-gray-400">
                      (11 rows · {combiHira.length} kana)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        combiHiraPct > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"
                      }`}
                    >
                      {combiHiraPct}%
                    </span>
                    {openSections.hira_combination ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                </button>

                {openSections.hira_combination && (
                  <div className="border-t border-black/5 p-4 bg-[#FAFAF8] dark:border-white/10 dark:bg-[#2A2A2A]">
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                      {combiHira.map((k) => {
                        const isMastered = masteredIds.has(k.id);
                        return (
                          <button
                            key={k.id}
                            type="button"
                            onClick={() => setSelectedKana({ ...k, status: isMastered ? "mastered" : "unlearned" } as any)}
                            className={`flex flex-col items-center justify-center rounded-xl p-2 shadow-2xs transition hover:scale-105 ${
                              isMastered
                                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-300"
                                : "bg-white border border-black/5 text-[#1A1A1A] dark:bg-[#1A1A1A] dark:border-white/10 dark:text-[#FAFAFA]"
                            }`}
                          >
                            <span className="font-serif text-base font-bold">{k.character}</span>
                            <span className="text-[10px] text-gray-400">{k.romaji}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Katakana Section */}
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Katakana</h2>
              <span className="text-xs font-semibold text-[#6B6B6B] dark:text-[#A0A0A0]">
                Average mastery: {avgKataPct}%
              </span>
            </div>

            <div className="space-y-3">
              {/* Basic Katakana */}
              <div className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-xs dark:border-white/15 dark:bg-[#1A1A1A]">
                <button
                  type="button"
                  onClick={() => toggleSection("kata_basic")}
                  className="flex w-full items-center justify-between p-4.5 text-left font-bold text-sm text-[#1A1A1A] hover:bg-[#FAFAF8] dark:text-[#FAFAFA] dark:hover:bg-[#2A2A2A]"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-lg text-[#C84B31] dark:text-[#E85C40]">ア</span>
                    <span>Basic Katakana</span>
                    <span className="text-xs font-normal text-gray-400">
                      (10 rows · {basicKata.length} kana)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        basicKataPct > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"
                      }`}
                    >
                      {basicKataPct}%
                    </span>
                    {openSections.kata_basic ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                </button>

                {openSections.kata_basic && (
                  <div className="border-t border-black/5 p-4 bg-[#FAFAF8] dark:border-white/10 dark:bg-[#2A2A2A]">
                    <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                      {basicKata.map((k) => {
                        const isMastered = masteredIds.has(k.id);
                        return (
                          <button
                            key={k.id}
                            type="button"
                            onClick={() => setSelectedKana({ ...k, status: isMastered ? "mastered" : "unlearned" } as any)}
                            className={`flex flex-col items-center justify-center rounded-xl p-2 shadow-2xs transition hover:scale-105 ${
                              isMastered
                                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-300"
                                : "bg-white border border-black/5 text-[#1A1A1A] dark:bg-[#1A1A1A] dark:border-white/10 dark:text-[#FAFAFA]"
                            }`}
                          >
                            <span className="font-serif text-lg font-bold">{k.character}</span>
                            <span className="text-[10px] text-gray-400">{k.romaji}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Dakuten Katakana */}
              <div className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-xs dark:border-white/15 dark:bg-[#1A1A1A]">
                <button
                  type="button"
                  onClick={() => toggleSection("kata_dakuten")}
                  className="flex w-full items-center justify-between p-4.5 text-left font-bold text-sm text-[#1A1A1A] hover:bg-[#FAFAF8] dark:text-[#FAFAFA] dark:hover:bg-[#2A2A2A]"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-lg text-[#2D5F8A] dark:text-[#4A86B8]">ガ</span>
                    <span>Dakuten and Handakuten</span>
                    <span className="text-xs font-normal text-gray-400">
                      (5 rows · {dakutenKata.length} kana)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        dakutenKataPct > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"
                      }`}
                    >
                      {dakutenKataPct}%
                    </span>
                    {openSections.kata_dakuten ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                </button>

                {openSections.kata_dakuten && (
                  <div className="border-t border-black/5 p-4 bg-[#FAFAF8] dark:border-white/10 dark:bg-[#2A2A2A]">
                    <div className="grid grid-cols-5 gap-2">
                      {dakutenKata.map((k) => {
                        const isMastered = masteredIds.has(k.id);
                        return (
                          <button
                            key={k.id}
                            type="button"
                            onClick={() => setSelectedKana({ ...k, status: isMastered ? "mastered" : "unlearned" } as any)}
                            className={`flex flex-col items-center justify-center rounded-xl p-2 shadow-2xs transition hover:scale-105 ${
                              isMastered
                                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-300"
                                : "bg-white border border-black/5 text-[#1A1A1A] dark:bg-[#1A1A1A] dark:border-white/10 dark:text-[#FAFAFA]"
                            }`}
                          >
                            <span className="font-serif text-lg font-bold">{k.character}</span>
                            <span className="text-[10px] text-gray-400">{k.romaji}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Stats & Struggle Widgets */}
        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/15 dark:bg-[#1A1A1A]">
            <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Overview</h3>
            <div className="my-6 flex flex-col items-center justify-center">
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-8 border-[#C84B31]/20 dark:border-[#E85C40]/20">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#C84B31] dark:text-[#E85C40]">
                    {overallMasteryPct}%
                  </div>
                  <div className="text-[10px] text-gray-400">Mastered</div>
                </div>
              </div>
            </div>
            <div className="text-center text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
              {totalMastered} / {totalKana} Kana characters mastered.
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/15 dark:bg-[#1A1A1A] space-y-3">
            <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
              Items you struggle with
            </h3>
            {(!stats?.struggles || stats.struggles.length === 0) ? (
              <div className="rounded-xl bg-[#FAFAF8] p-4 text-center text-xs text-[#6B6B6B] dark:bg-[#2A2A2A] dark:text-[#A0A0A0]">
                No struggle items yet. Characters you miss during practice will appear here for targeted review.
              </div>
            ) : (
              <div className="space-y-2 text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
                {stats.struggles.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl bg-[#FAFAF8] p-2.5 dark:bg-[#2A2A2A]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                        {item.character}
                      </span>
                      <span>({item.romaji})</span>
                    </div>
                    <span className="rounded-md bg-rose-500/10 px-2 py-0.5 text-[11px] font-bold text-rose-500">
                      Needs Review
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedKana && (
        <KanaFlashcardModal item={selectedKana} onClose={() => setSelectedKana(null)} />
      )}
    </div>
  );
}
