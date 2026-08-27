"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";

interface MainDashboardViewProps {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  stats: {
    kanaMastered: number;
    kanaTotal: number;
    vocabCount: number;
    kanjiCount: number;
    grammarCount: number;
    sessionCount: number;
    totalMinutes: number;
    streak: number;
    kanaReviews: number;
    kanaAttempts: number;
    kanaAnswers: number;
    kanaAccuracy: number;
    hiraMastered: number;
    kataMastered: number;
    basicHiraCount: number;
    dakutenHiraCount: number;
    combiHiraCount: number;
    jlpt: Array<{
      level: string;
      vocabMastered: number;
      vocabTotal: number;
      kanjiMastered: number;
      kanjiTotal: number;
      grammarMastered: number;
      grammarTotal: number;
    }>;
    currentStep: {
      step: number;
      title: string;
      subtitle: string;
      href: string;
    };
  };
}

const VERMILLION = "text-[#C84B31] dark:text-[#E85C40]";

export function MainDashboardView({ user, stats }: MainDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<"kana" | "vocab" | "grammar" | "conjugation">("kana");
  const [jlptExpanded, setJlptExpanded] = useState(true);

  const initials = (user.name ?? user.email).slice(0, 2).toUpperCase();

  // Heatmap months
  const months = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  const weeks: number[][] = Array.from({ length: 24 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      if (stats.streak > 0 && w === 23 && d === 6) return 2;
      if (w === 1 && (d === 2 || d === 3)) return 2;
      return 0;
    })
  );

  const hiraPercent = Math.round((stats.hiraMastered / 104) * 100) || 0;
  const kataPercent = Math.round((stats.kataMastered / 104) * 100) || 0;

  const basicHiraPct = Math.round((stats.basicHiraCount / 46) * 100) || 0;
  const dakutenHiraPct = Math.round((stats.dakutenHiraCount / 25) * 100) || 0;
  const combiHiraPct = Math.round((stats.combiHiraCount / 33) * 100) || 0;

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* ================= LEFT COLUMN ================= */}
      <div className="space-y-6 lg:col-span-4">
        {/* User — flat editorial section, hairline below */}
        <section className="border-b border-black/5 pb-5 dark:border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#C84B31] font-serif text-xl font-bold text-white dark:bg-[#E85C40]">
              {initials}
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                {user.name ?? "Aekou"}
              </h2>
              <div className="mt-1 text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
                {stats.totalMinutes >= 60
                  ? `${Math.floor(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}m`
                  : `${stats.totalMinutes}m`}{" "}
                studied
              </div>
            </div>
          </div>

          {/* Activity Heatmap */}
          <div className="mt-5 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] dark:text-[#A0A0A0]">
              Activity
            </div>

            <div className="grid grid-cols-6 text-center text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
              {months.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>

            <div className="grid grid-cols-[repeat(24,minmax(0,1fr))] gap-0.5 sm:gap-1 w-full pb-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-0.5 sm:gap-1">
                  {week.map((val, dIdx) => {
                    let bg = "bg-[#F4F4F0] dark:bg-[#1E232B]";
                    if (val === 2) bg = "bg-[#C84B31] dark:bg-[#E85C40]";
                    return <div key={dIdx} className={`w-full aspect-square rounded-[2px] ${bg}`} />;
                  })}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-1.5 text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
              <span>Less</span>
              <div className="h-2 w-2 rounded-[2px] bg-[#F4F4F0] dark:bg-[#1E232B]" />
              <div className="h-2 w-2 rounded-[2px] bg-[#C84B31]/30 dark:bg-[#E85C40]/30" />
              <div className="h-2 w-2 rounded-[2px] bg-[#C84B31]/60 dark:bg-[#E85C40]/60" />
              <div className="h-2 w-2 rounded-[2px] bg-[#C84B31] dark:bg-[#E85C40]" />
              <span>More</span>
            </div>
          </div>
        </section>

        {/* Current Step Banner — kept as the one primary interactive card */}
        <Link
          href={stats.currentStep.href}
          className="group block rounded-2xl border border-[#C84B31]/30 bg-[#C84B31]/10 p-5 transition hover:border-[#C84B31]/50 dark:border-[#E85C40]/30 dark:bg-[#E85C40]/15 dark:hover:border-[#E85C40]/50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C84B31] font-serif text-lg font-bold text-white dark:bg-[#E85C40]">
                {stats.currentStep.step === 0 ? "あ" : `${stats.currentStep.step}`}
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-[#C84B31] dark:text-[#E85C40]">
                  {stats.currentStep.step === 0 ? "Start Here" : "Current Stage"}
                </div>
                <div className="mt-1 text-sm font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                  STEP {stats.currentStep.step} · {stats.currentStep.title.toUpperCase()}
                </div>
                <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">{stats.currentStep.subtitle}</div>
              </div>
            </div>

            <span className="flex items-center gap-1 rounded-xl bg-[#C84B31] px-3.5 py-2 text-xs font-bold text-white transition group-hover:opacity-90 dark:bg-[#E85C40]">
              Go →
            </span>
          </div>
        </Link>

        {/* 3 Stats — inline text, no boxes */}
        <div className="grid grid-cols-3 gap-4 border-b border-black/5 pb-5 dark:border-white/10">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] dark:text-[#A0A0A0]">
              Streak
            </div>
            <div className="mt-1 flex items-baseline gap-1.5 text-xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
              <span>{stats.streak}</span>
              <span className="text-xs font-normal text-[#6B6B6B] dark:text-[#A0A0A0]">days</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] dark:text-[#A0A0A0]">
              Kanas
            </div>
            <div className="mt-1 flex items-baseline gap-1.5 text-xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
              <span>{stats.kanaReviews}</span>
              <span className="text-xs font-normal text-[#6B6B6B] dark:text-[#A0A0A0]">reviews</span>
            </div>
          </div>

          <div>
            <div className={`text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] dark:text-[#A0A0A0]`}>
              Favorite
            </div>
            <div className="mt-1 font-serif text-xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">あ</div>
            <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">kana</div>
          </div>
        </div>

        {/* JLPT Progress — flat panel, hairline headings */}
        <section className="space-y-4">
          <button
            type="button"
            onClick={() => setJlptExpanded(!jlptExpanded)}
            className="flex w-full items-center justify-between font-serif text-lg font-semibold text-[#1A1A1A] dark:text-[#F0F4F8]"
            aria-expanded={jlptExpanded}
          >
            <span>JLPT Progress</span>
            {jlptExpanded ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
          </button>

          {jlptExpanded && (
            <div className="space-y-4 border-t border-black/5 pt-4 text-xs dark:border-white/10">
              {stats.jlpt.map((row) => {
                const items = row.vocabMastered + row.kanjiMastered + row.grammarMastered;
                const totalItems = row.vocabTotal + row.kanjiTotal + row.grammarTotal;
                const pct = totalItems > 0 ? Math.round((items / totalItems) * 100) : 0;
                return (
                  <div key={row.level} className="space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                      <span>{row.level}</span>
                      <span>
                        {items}/{totalItems} items {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-[#C84B31] dark:bg-[#E85C40]"
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
                      <span>
                        Vocabulary: {row.vocabMastered}/{row.vocabTotal}
                      </span>
                      <span>
                        Kanji: {row.kanjiMastered}/{row.kanjiTotal}
                      </span>
                      <span>
                        Grammar: {row.grammarMastered}/{row.grammarTotal}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* ================= RIGHT MAIN AREA ================= */}
      <div className="space-y-6 lg:col-span-8">
        {/* Top Daily Task Banner — primary CTA, keeps vermillion */}
        <Link
          href="/practice/kana"
          className="flex items-center justify-between rounded-2xl bg-[#C84B31] px-5 py-3 text-white transition hover:opacity-90 dark:bg-[#E85C40]"
        >
          <div className="flex items-center gap-2 font-serif text-sm font-bold">
            <span className="text-base">あア</span>
            <span>Practice Kanas</span>
          </div>
          <span className="rounded-full bg-white/20 px-3 py-1 font-mono text-xs font-bold">
            0/5
          </span>
        </Link>

        {/* Master Kanas First — flat section, hairlines, no card */}
        <section className="space-y-5 border-b border-black/5 pb-6 dark:border-white/10">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
              Master Kanas First
            </h2>
          </div>

          <div className="space-y-3">
            {/* Hiragana Progress */}
            <div>
              <div className="flex items-center justify-between text-sm font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                <span className="font-serif">あ Hiragana</span>
                <span>{hiraPercent}%</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-[#C84B31] transition-all duration-500 dark:bg-[#E85C40]"
                  style={{ width: `${hiraPercent}%` }}
                />
              </div>
            </div>

            {/* Katakana Progress */}
            <div>
              <div className="flex items-center justify-between text-sm font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                <span className="font-serif">ア Katakana</span>
                <span>{kataPercent}%</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-[#C84B31] transition-all duration-500 dark:bg-[#E85C40]"
                  style={{ width: `${kataPercent}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Tab Switcher — hairline underline tabs, no boxed pill group */}
        <div className="flex gap-6 border-b border-black/10 dark:border-white/10" role="tablist">
          {(
            [
              { id: "kana", label: "Kana" },
              { id: "vocab", label: "Vocabulary" },
              { id: "grammar", label: "Grammar" },
              { id: "conjugation", label: "Conjugation" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 pb-2.5 text-sm font-bold transition ${
                activeTab === tab.id
                  ? "border-[#C84B31] text-[#1A1A1A] dark:border-[#E85C40] dark:text-[#F0F4F8]"
                  : "border-transparent text-[#6B6B6B] hover:text-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:text-[#F0F4F8]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: KANA */}
        {activeTab === "kana" && (
          <div className="space-y-6">
            {/* Top Stats — inline text row */}
            <div className="grid grid-cols-3 gap-4 border-b border-black/5 pb-5 text-center dark:border-white/10">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] dark:text-[#A0A0A0]">
                  Attempts
                </div>
                <div className="mt-1 text-2xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                  {stats.kanaAttempts}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] dark:text-[#A0A0A0]">
                  Answers
                </div>
                <div className="mt-1 text-2xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                  {stats.kanaAnswers}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] dark:text-[#A0A0A0]">
                  Accuracy
                </div>
                <div className={`mt-1 text-2xl font-bold ${VERMILLION}`}>
                  {stats.kanaAccuracy.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Kana Proficiency Breakdown — kept as the one content card of the tab */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                  Kana Proficiency Breakdown
                </h3>
                <Link
                  href="/progress/kana"
                  className="text-xs font-semibold text-[#6B6B6B] underline-offset-2 hover:underline hover:text-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:text-[#F0F4F8]"
                >
                  View Details →
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="border-t border-black/10 pt-3 text-center dark:border-white/10">
                  <div className="font-serif text-2xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">あ</div>
                  <div className="mt-1 text-sm font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Basic Kana</div>
                  <div
                    className={`mt-1 text-xs font-bold ${
                      basicHiraPct > 0 ? "text-[#1A1A1A] dark:text-[#FAFAFA]" : "text-[#6B6B6B] dark:text-[#A0A0A0]"
                    }`}
                  >
                    {basicHiraPct}% Mastered
                  </div>
                </div>

                <div className="border-t border-black/10 pt-3 text-center dark:border-white/10">
                  <div className="font-serif text-2xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">が</div>
                  <div className="mt-1 text-sm font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Dakuten</div>
                  <div
                    className={`mt-1 text-xs font-bold ${
                      dakutenHiraPct > 0 ? "text-[#1A1A1A] dark:text-[#FAFAFA]" : "text-[#6B6B6B] dark:text-[#A0A0A0]"
                    }`}
                  >
                    {dakutenHiraPct}% Mastered
                  </div>
                </div>

                <div className="border-t border-black/10 pt-3 text-center dark:border-white/10">
                  <div className="font-serif text-2xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">きゃ</div>
                  <div className="mt-1 text-sm font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Combinations</div>
                  <div
                    className={`mt-1 text-xs font-bold ${
                      combiHiraPct > 0 ? "text-[#1A1A1A] dark:text-[#FAFAFA]" : "text-[#6B6B6B] dark:text-[#A0A0A0]"
                    }`}
                  >
                    {combiHiraPct}% Mastered
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Practice Launcher */}
            <div className="flex gap-3">
              <Link
                href="/practice/kana"
                className="flex flex-1 items-center justify-center rounded-2xl bg-[#C84B31] py-4 text-sm font-bold text-white transition hover:opacity-90 dark:bg-[#E85C40]"
              >
                <span>Launch Kana Practice</span>
              </Link>
              <Link
                href="/practice/kana-speed"
                className="flex flex-1 items-center justify-center rounded-2xl border border-black/10 bg-white py-4 text-sm font-bold text-[#1A1A1A] transition hover:border-black/20 dark:border-white/15 dark:bg-[#161B22] dark:text-[#F0F4F8] dark:hover:border-white/25"
              >
                <span>Kana Speed Sprint</span>
              </Link>
            </div>
          </div>
        )}

        {/* Tab 2: VOCABULARY */}
        {activeTab === "vocab" && (
          <div className="space-y-5 border-b border-black/5 pb-6 dark:border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                  N5 Core Vocabulary
                </h3>
              </div>
              <Link
                href="/n5/vocabulary"
                className="rounded-xl bg-[#C84B31] px-4 py-2 text-xs font-bold text-white transition hover:opacity-90 dark:bg-[#E85C40]"
              >
                Study Vocab
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="border-t border-black/5 pt-3 dark:border-white/10">
                <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Total N5 Words</div>
                <div className="mt-1 text-2xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">697 words</div>
              </div>
              <div className="border-t border-black/5 pt-3 dark:border-white/10">
                <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Daily Study Target</div>
                <div className="mt-1 text-2xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">5 words / day</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: GRAMMAR */}
        {activeTab === "grammar" && (
          <div className="space-y-5 border-b border-black/5 pb-6 dark:border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                  Japanese Grammar Points
                </h3>
              </div>
              <Link
                href="/progress/grammar"
                className="rounded-xl bg-[#C84B31] px-4 py-2 text-xs font-bold text-white transition hover:opacity-90 dark:bg-[#E85C40]"
              >
                Explore Grammar
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="border-t border-black/5 pt-3 dark:border-white/10">
                <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">N5 Grammar Points</div>
                <div className="mt-1 text-2xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">146 points</div>
              </div>
              <div className="border-t border-black/5 pt-3 dark:border-white/10">
                <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Daily Grammar Target</div>
                <div className="mt-1 text-2xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">2 points / day</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: CONJUGATION */}
        {activeTab === "conjugation" && (
          <div className="space-y-5 border-b border-black/5 pb-6 dark:border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                  Verb Conjugation Drill
                </h3>
              </div>
              <Link
                href="/practice/conjugation"
                className="rounded-xl bg-[#C84B31] px-4 py-2 text-xs font-bold text-white transition hover:opacity-90 dark:bg-[#E85C40]"
              >
                Conjugation Drill
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="border-t border-black/5 pt-3 dark:border-white/10">
                <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Verb Groups</div>
                <div className="mt-1 text-sm font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Godan / Ichidan</div>
              </div>
              <div className="border-t border-black/5 pt-3 dark:border-white/10">
                <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Total Forms</div>
                <div className="mt-1 text-sm font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">15 Verb Forms</div>
              </div>
              <div className="border-t border-black/5 pt-3 dark:border-white/10">
                <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Progress Hub</div>
                <Link
                  href="/progress/conjugation"
                  className="mt-1 inline-block text-xs font-bold text-[#C84B31] underline-offset-2 hover:underline dark:text-[#E85C40]"
                >
                  View 15 Forms →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
