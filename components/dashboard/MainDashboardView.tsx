"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Users,
  PenTool,
  RotateCw,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  BookA,
  BookOpen,
  BookOpenCheck,
  GitFork,
  Flame,
  CheckCircle2,
  Sparkles,
  BarChart2,
  Lock,
} from "lucide-react";

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
        {/* User Card */}
        <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-xs dark:border-white/15 dark:bg-[#1A1A1A]">
          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-xl font-bold text-white shadow-md ring-2 ring-pink-500/20">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                {user.name ?? "Aekou"}
              </h2>
              <div className="mt-1 flex items-center gap-3 text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-gray-400" />
                  <span>
                    {stats.totalMinutes >= 60
                      ? `${Math.floor(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}m`
                      : `${stats.totalMinutes}m`}{" "}
                    studied
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Activity Heatmap */}
          <div className="mt-5 border-t border-black/5 pt-4 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
              <span>Activity</span>
              <RotateCw size={12} className="text-gray-400" />
            </div>

            <div className="grid grid-cols-6 text-[10px] text-center text-[#6B6B6B] dark:text-[#A0A0A0]">
              {months.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>

            <div className="flex gap-1 overflow-x-auto pb-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((val, dIdx) => {
                    let bg = "bg-[#F0F0F0] dark:bg-[#252525]";
                    if (val === 2) bg = "bg-purple-500";
                    return <div key={dIdx} className={`h-2.5 w-2.5 rounded-2xs ${bg}`} />;
                  })}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-1 text-[9px] text-gray-400">
              <span>Less</span>
              <div className="h-2 w-2 rounded-2xs bg-[#F0F0F0] dark:bg-[#252525]" />
              <div className="h-2 w-2 rounded-2xs bg-purple-300 dark:bg-purple-900" />
              <div className="h-2 w-2 rounded-2xs bg-purple-500" />
              <div className="h-2 w-2 rounded-2xs bg-purple-700 dark:bg-purple-400" />
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Current Step Banner */}
        <Link
          href={stats.currentStep.href}
          className="group block rounded-3xl border border-[#C84B31]/30 bg-gradient-to-r from-[#C84B31]/10 to-orange-500/10 p-5 shadow-xs transition hover:shadow-md dark:border-[#E85C40]/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C84B31] text-white font-serif text-lg font-bold shadow-sm dark:bg-[#E85C40]">
                {stats.currentStep.step === 0 ? "あ" : `${stats.currentStep.step}`}
              </div>
              <div>
                <span className="rounded bg-[#C84B31]/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#C84B31] dark:text-[#E85C40]">
                  {stats.currentStep.step === 0 ? "Start Here" : "Current Stage"}
                </span>
                <div className="text-xs font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                  STEP {stats.currentStep.step} · {stats.currentStep.title.toUpperCase()}
                </div>
                <div className="text-[11px] text-[#6B6B6B] dark:text-[#A0A0A0]">{stats.currentStep.subtitle}</div>
              </div>
            </div>

            <div className="flex items-center gap-1 rounded-xl bg-[#C84B31] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition group-hover:bg-[#b03e26] dark:bg-[#E85C40]">
              <span>Go</span>
              <ArrowRight size={12} />
            </div>
          </div>
        </Link>

        {/* 3 Stats Summary */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-2xl border border-black/10 bg-white p-3.5 text-center shadow-xs dark:border-white/15 dark:bg-[#1A1A1A]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
              Streak
            </div>
            <div className="mt-1 flex items-center justify-center gap-1 text-xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
              <span>{stats.streak}</span>
              {stats.streak > 0 && <Flame size={14} className="text-orange-500 fill-orange-500" />}
              <span className="text-[10px] font-normal text-gray-400">days</span>
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-3.5 text-center shadow-xs dark:border-white/15 dark:bg-[#1A1A1A]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
              Kanas
            </div>
            <div className="mt-1 flex items-center justify-center gap-1 text-xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
              <span>{stats.kanaReviews}</span>
              <PenTool size={13} className="text-blue-500" />
            </div>
            <div className="text-[9px] text-gray-400">reviews</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-3.5 text-center shadow-xs dark:border-white/15 dark:bg-[#1A1A1A]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
              Favorite
            </div>
            <div className="mt-1 flex items-center justify-center gap-1 font-serif text-xl font-bold text-pink-500">
              <span>あ</span>
              <span className="text-xs">🌸</span>
            </div>
            <div className="text-[9px] text-gray-400">kana</div>
          </div>
        </div>

        {/* JLPT Progress Breakdown (N5 to N1) */}
        <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-xs dark:border-white/15 dark:bg-[#1A1A1A] space-y-4">
          <button
            type="button"
            onClick={() => setJlptExpanded(!jlptExpanded)}
            className="flex w-full items-center justify-between font-bold text-sm text-[#1A1A1A] dark:text-[#FAFAFA]"
          >
            <span>JLPT Progress</span>
            {jlptExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
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
        </div>
      </div>

      {/* ================= RIGHT MAIN AREA ================= */}
      <div className="space-y-6 lg:col-span-8">
        {/* Top Daily Task Banner */}
        <Link
          href="/practice/kana"
          className="flex items-center justify-between rounded-2xl bg-purple-600 px-5 py-3 text-white shadow-md transition hover:bg-purple-700"
        >
          <div className="flex items-center gap-2 font-serif text-sm font-bold">
            <span className="text-base">あア</span>
            <span>Practice Kanas</span>
          </div>
          <span className="rounded-full bg-white/20 px-3 py-1 font-mono text-xs font-bold">
            0/5
          </span>
        </Link>

        {/* Master Kanas First Card */}
        <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-xs dark:border-white/15 dark:bg-[#1A1A1A] space-y-5">
          <div>
            <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
              Master Kanas First
            </h2>
            <p className="mt-1 text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
              You need to master both Hiragana and Katakana before unlocking vocabulary and grammar lessons.
            </p>
          </div>

          <div className="space-y-3">
            {/* Hiragana Progress */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                <span className="font-serif">あ Hiragana</span>
                <span>{hiraPercent}%</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${hiraPercent}%` }}
                />
              </div>
            </div>

            {/* Katakana Progress */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                <span className="font-serif">ア Katakana</span>
                <span>{kataPercent}%</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${kataPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-2xl border border-black/10 bg-white p-1.5 shadow-xs dark:border-white/15 dark:bg-[#1A1A1A]">
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
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition ${
                activeTab === tab.id
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-[#6B6B6B] hover:text-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:text-[#FAFAFA]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: KANA */}
        {activeTab === "kana" && (
          <div className="space-y-6">
            {/* Top Stats Bar */}
            <div className="grid grid-cols-3 gap-3 rounded-3xl border border-black/10 bg-white p-6 shadow-xs dark:border-white/15 dark:bg-[#1A1A1A] text-center">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
                  Attempts
                </div>
                <div className="mt-1 text-2xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                  {stats.kanaAttempts}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
                  Answers
                </div>
                <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.kanaAnswers}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
                  Accuracy
                </div>
                <div className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.kanaAccuracy.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Kana Proficiency Breakdown */}
            <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-xs dark:border-white/15 dark:bg-[#1A1A1A] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                  Kana Proficiency Breakdown
                </h3>
                <Link
                  href="/progress/kana"
                  className="text-xs font-semibold text-purple-600 hover:underline dark:text-purple-400"
                >
                  View Details ➔
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 text-center dark:border-white/10 dark:bg-[#2A2A2A]">
                  <div className="font-serif text-2xl font-bold text-[#C84B31] dark:text-[#E85C40]">あ</div>
                  <div className="mt-1 text-xs font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Basic Kana</div>
                  <div
                    className={`mt-2 text-[11px] font-bold ${
                      basicHiraPct > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"
                    }`}
                  >
                    {basicHiraPct}% Mastered
                  </div>
                </div>

                <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 text-center dark:border-white/10 dark:bg-[#2A2A2A]">
                  <div className="font-serif text-2xl font-bold text-[#2D5F8A] dark:text-[#4A86B8]">が</div>
                  <div className="mt-1 text-xs font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Dakuten</div>
                  <div
                    className={`mt-2 text-[11px] font-bold ${
                      dakutenHiraPct > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"
                    }`}
                  >
                    {dakutenHiraPct}% Mastered
                  </div>
                </div>

                <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 text-center dark:border-white/10 dark:bg-[#2A2A2A]">
                  <div className="font-serif text-2xl font-bold text-purple-600 dark:text-purple-400">きゃ</div>
                  <div className="mt-1 text-xs font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Combinations</div>
                  <div
                    className={`mt-2 text-[11px] font-bold ${
                      combiHiraPct > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"
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
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-purple-600 py-4 text-sm font-bold text-white shadow-md transition hover:bg-purple-700"
              >
                <RotateCw size={16} />
                <span>Launch Kana Practice</span>
              </Link>
              <Link
                href="/practice/kana-speed"
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white py-4 text-sm font-bold text-[#1A1A1A] shadow-xs transition hover:border-purple-600 dark:border-white/15 dark:bg-[#1A1A1A] dark:text-[#FAFAFA]"
              >
                <Flame size={16} className="text-orange-500" />
                <span>Kana Speed Sprint</span>
              </Link>
            </div>
          </div>
        )}

        {/* Tab 2: VOCABULARY */}
        {activeTab === "vocab" && (
          <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-xs dark:border-white/15 dark:bg-[#1A1A1A] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                  N5 Core Vocabulary
                </h3>
                <p className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
                  Study high-frequency Japanese words with audio pronunciation and flashcards.
                </p>
              </div>
              <Link
                href="/n5/vocabulary"
                className="rounded-xl bg-[#2D5F8A] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#234b6e]"
              >
                Study Vocab
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 dark:border-white/10 dark:bg-[#2A2A2A]">
                <div className="text-xs text-gray-400">Total N5 Words</div>
                <div className="mt-1 text-2xl font-bold text-[#2D5F8A] dark:text-[#60A5FA]">697 words</div>
              </div>
              <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 dark:border-white/10 dark:bg-[#2A2A2A]">
                <div className="text-xs text-gray-400">Daily Study Target</div>
                <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">5 words / day</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: GRAMMAR */}
        {activeTab === "grammar" && (
          <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-xs dark:border-white/15 dark:bg-[#1A1A1A] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                  Japanese Grammar Points
                </h3>
                <p className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
                  Learn sentence structure, particles (は, が, を, に), and formality levels.
                </p>
              </div>
              <Link
                href="/progress/grammar"
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
              >
                Explore Grammar
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 dark:border-white/10 dark:bg-[#2A2A2A]">
                <div className="text-xs text-gray-400">N5 Grammar Points</div>
                <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">146 points</div>
              </div>
              <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 dark:border-white/10 dark:bg-[#2A2A2A]">
                <div className="text-xs text-gray-400">Daily Grammar Target</div>
                <div className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">2 points / day</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: CONJUGATION */}
        {activeTab === "conjugation" && (
          <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-xs dark:border-white/15 dark:bg-[#1A1A1A] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                  Verb Conjugation Drill
                </h3>
                <p className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
                  Practice 15 forms: Polite, Negative, Past, Te-form, Passive, Potential, etc.
                </p>
              </div>
              <Link
                href="/practice/conjugation"
                className="rounded-xl bg-[#C84B31] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#b03e26] dark:bg-[#E85C40]"
              >
                Conjugation Drill
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 text-center dark:border-white/10 dark:bg-[#2A2A2A]">
                <div className="text-xs text-gray-400">Verb Groups</div>
                <div className="mt-1 font-bold text-sm text-[#1A1A1A] dark:text-[#FAFAFA]">Godan / Ichidan</div>
              </div>
              <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 text-center dark:border-white/10 dark:bg-[#2A2A2A]">
                <div className="text-xs text-gray-400">Total Forms</div>
                <div className="mt-1 font-bold text-sm text-purple-600 dark:text-purple-400">15 Verb Forms</div>
              </div>
              <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 text-center dark:border-white/10 dark:bg-[#2A2A2A]">
                <div className="text-xs text-gray-400">Progress Hub</div>
                <Link
                  href="/progress/conjugation"
                  className="mt-1 inline-block text-xs font-bold text-[#C84B31] hover:underline dark:text-[#E85C40]"
                >
                  View 15 Forms ➔
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
