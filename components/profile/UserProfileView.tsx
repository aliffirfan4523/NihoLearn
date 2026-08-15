"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Settings,
  Clock,
  Users,
  Flame,
  PenTool,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCw,
} from "lucide-react";

interface UserProfileViewProps {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  stats: {
    kanaCount: number;
    vocabCount: number;
    kanjiCount: number;
    grammarCount: number;
    sessionCount: number;
    totalMinutes: number;
    streak: number;
  };
}

export function UserProfileView({ user, stats }: UserProfileViewProps) {
  const [jlptExpanded, setJlptExpanded] = useState(true);

  const initials = (user.name ?? user.email).slice(0, 2).toUpperCase();

  // Months for activity heatmap
  const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

  // Mock heatmap cells: 52 weeks x 7 days
  const weeks: number[][] = Array.from({ length: 48 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      if (stats.streak > 0 && w === 47 && d === 6) return 2;
      if (w === 24 && (d === 2 || d === 3)) return 2;
      return 0;
    })
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Profile Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/15 dark:bg-[#1A1A1A]">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 font-bold text-2xl text-white shadow-md ring-4 ring-pink-500/20">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
              {user.name ?? "Aekou"}
            </h1>
            <div className="mt-1 flex items-center gap-4 text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-gray-400" />
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

        <Link
          href="/profile/settings"
          className="rounded-2xl border border-black/10 bg-[#FAFAF8] p-3 text-gray-500 shadow-xs transition hover:bg-black/5 hover:text-[#1A1A1A] dark:border-white/15 dark:bg-[#2A2A2A] dark:text-gray-300 dark:hover:text-white"
          aria-label="Profile Settings"
        >
          <Settings size={20} />
        </Link>
      </div>

      {/* Activity Heatmap */}
      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/15 dark:bg-[#1A1A1A] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
            Activity
          </h2>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Refresh activity"
          >
            <RotateCw size={14} />
          </button>
        </div>

        {/* Month labels */}
        <div className="grid grid-cols-12 text-[11px] text-[#6B6B6B] dark:text-[#A0A0A0] text-center">
          {months.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1">
              {week.map((val, dIdx) => {
                let cellColor = "bg-[#F0F0F0] dark:bg-[#252525]";
                if (val === 1) cellColor = "bg-purple-300 dark:bg-purple-900";
                if (val === 2) cellColor = "bg-purple-500 dark:bg-purple-500";
                if (val >= 3) cellColor = "bg-purple-700 dark:bg-purple-400";

                return (
                  <div
                    key={dIdx}
                    className={`h-2.5 w-2.5 rounded-2xs ${cellColor} transition hover:scale-125`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1.5 text-[10px] text-gray-400">
          <span>Less</span>
          <div className="h-2 w-2 rounded-2xs bg-[#F0F0F0] dark:bg-[#252525]" />
          <div className="h-2 w-2 rounded-2xs bg-purple-300 dark:bg-purple-900" />
          <div className="h-2 w-2 rounded-2xs bg-purple-500" />
          <div className="h-2 w-2 rounded-2xs bg-purple-700 dark:bg-purple-400" />
          <span>More</span>
        </div>
      </div>

      {/* 3 Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Streak */}
        <div className="rounded-3xl border border-black/10 bg-white p-5 text-center shadow-xs dark:border-white/15 dark:bg-[#1A1A1A]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
            Streak
          </div>
          <div className="mt-2 flex items-center justify-center gap-1 text-2xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
            <span>{stats.streak}</span>
            {stats.streak > 0 && <Flame size={16} className="text-orange-500 fill-orange-500" />}
            <span className="text-xs font-normal text-gray-400">days</span>
          </div>
        </div>

        {/* Kanas Reviews */}
        <div className="rounded-3xl border border-black/10 bg-white p-5 text-center shadow-xs dark:border-white/15 dark:bg-[#1A1A1A]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
            Kanas
          </div>
          <div className="mt-2 flex items-center justify-center gap-1.5 text-2xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
            <span>{stats.kanaCount || 150}</span>
            <PenTool size={16} className="text-blue-500" />
          </div>
          <div className="text-[10px] text-gray-400">reviews</div>
        </div>

        {/* Favorite */}
        <div className="rounded-3xl border border-black/10 bg-white p-5 text-center shadow-xs dark:border-white/15 dark:bg-[#1A1A1A]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
            Favorite
          </div>
          <div className="mt-2 flex items-center justify-center gap-1 font-serif text-2xl font-bold text-pink-500">
            <span>あ</span>
            <span className="text-sm">🌸</span>
          </div>
          <div className="text-[10px] text-gray-400">kana</div>
        </div>
      </div>

      {/* JLPT Progress List */}
      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/15 dark:bg-[#1A1A1A] space-y-6">
        <button
          type="button"
          onClick={() => setJlptExpanded(!jlptExpanded)}
          className="flex w-full items-center justify-between font-bold text-base text-[#1A1A1A] dark:text-[#FAFAFA]"
        >
          <span>JLPT Progress</span>
          {jlptExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {jlptExpanded && (
          <div className="space-y-6 border-t border-black/5 pt-5 dark:border-white/10">
            {/* N5 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                <span>N5</span>
                <span>{stats.vocabCount + stats.grammarCount}/843 items 0%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      ((stats.vocabCount + stats.grammarCount) / 843) * 100
                    )}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>Vocabulary: {stats.vocabCount}/697</span>
                <span>Grammar: {stats.grammarCount}/146</span>
              </div>
            </div>

            {/* N4 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                <span>N4</span>
                <span>0/773 items 0%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "0%" }} />
              </div>
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>Vocabulary: 0/653</span>
                <span>Grammar: 0/120</span>
              </div>
            </div>

            {/* N3 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                <span>N3</span>
                <span>0/2238 items 0%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "0%" }} />
              </div>
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>Vocabulary: 0/2114</span>
                <span>Grammar: 0/124</span>
              </div>
            </div>

            {/* N2 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                <span>N2</span>
                <span>0/1968 items 0%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "0%" }} />
              </div>
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>Vocabulary: 0/1795</span>
                <span>Grammar: 0/173</span>
              </div>
            </div>

            {/* N1 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                <span>N1</span>
                <span>0/2938 items 0%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "0%" }} />
              </div>
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>Vocabulary: 0/2694</span>
                <span>Grammar: 0/244</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
