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
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white p-5 shadow-xs dark:border-white/15 dark:bg-[#161B22]">
        <div className="flex items-center gap-3.5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#C84B31] text-xl font-bold text-white shadow-xs dark:bg-[#E85C40]">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
              {user.name ?? "Aekou"}
            </h1>
            <div className="mt-1 flex items-center gap-3 text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
              <span className="flex items-center gap-1.5">
                <Clock size={13} />
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
          className="rounded-xl border border-black/10 bg-white p-3 text-[#6B6B6B] shadow-xs transition hover:bg-black/5 hover:text-[#1A1A1A] dark:border-white/15 dark:bg-[#161B22] dark:text-[#A0A0A0] dark:hover:bg-white/5 dark:hover:text-[#F0F4F8]"
          aria-label="Profile Settings"
        >
          <Settings size={20} />
        </Link>
      </div>

      {/* Activity Heatmap */}
      <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-xs dark:border-white/15 dark:bg-[#161B22] space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] dark:text-[#A0A0A0]">
          <h2 className="text-xs font-semibold uppercase tracking-widest">Activity</h2>
          <button
            type="button"
            className="text-[#6B6B6B] hover:text-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:text-[#F0F4F8]"
            aria-label="Refresh activity"
          >
            <RotateCw size={12} />
          </button>
        </div>

        {/* Month labels */}
        <div className="grid grid-cols-12 text-[10px] text-[#6B6B6B] dark:text-[#A0A0A0] text-center">
          {months.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1">
              {week.map((val, dIdx) => {
                let cellColor = "bg-[#F4F4F0] dark:bg-[#1E232B]";
                if (val === 1) cellColor = "bg-[#C84B31]/30 dark:bg-[#E85C40]/30";
                if (val === 2) cellColor = "bg-[#C84B31]/60 dark:bg-[#E85C40]/60";
                if (val >= 3) cellColor = "bg-[#C84B31] dark:bg-[#E85C40]";

                return (
                  <div
                    key={dIdx}
                    className={`h-2.5 w-2.5 rounded-2xs ${cellColor}`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1 text-[9px] text-[#6B6B6B] dark:text-[#A0A0A0]">
          <span>Less</span>
          <div className="h-2 w-2 rounded-2xs bg-[#F4F4F0] dark:bg-[#1E232B]" />
          <div className="h-2 w-2 rounded-2xs bg-[#C84B31]/30 dark:bg-[#E85C40]/30" />
          <div className="h-2 w-2 rounded-2xs bg-[#C84B31]/60 dark:bg-[#E85C40]/60" />
          <div className="h-2 w-2 rounded-2xs bg-[#C84B31] dark:bg-[#E85C40]" />
          <span>More</span>
        </div>
      </div>

      {/* 3 Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Streak */}
        <div className="rounded-2xl border border-black/10 bg-white p-4 text-center shadow-xs dark:border-white/15 dark:bg-[#161B22]">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-[#6B6B6B] dark:text-[#A0A0A0]">
            Streak
          </div>
          <div className="mt-1 flex items-center justify-center gap-1 text-xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
            <span>{stats.streak}</span>
            {stats.streak > 0 && <Flame size={14} className="text-[#C84B31] dark:text-[#E85C40]" />}
            <span className="text-[10px] font-normal text-[#6B6B6B] dark:text-[#A0A0A0]">days</span>
          </div>
        </div>

        {/* Kanas Reviews */}
        <div className="rounded-2xl border border-black/10 bg-white p-4 text-center shadow-xs dark:border-white/15 dark:bg-[#161B22]">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-[#6B6B6B] dark:text-[#A0A0A0]">
            Kanas
          </div>
          <div className="mt-1 flex items-center justify-center gap-1 text-xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
            <span>{stats.kanaCount || 150}</span>
            <PenTool size={13} className="text-[#2D5F8A] dark:text-[#60A5FA]" />
          </div>
          <div className="text-[9px] text-[#6B6B6B] dark:text-[#A0A0A0]">reviews</div>
        </div>

        {/* Favorite */}
        <div className="rounded-2xl border border-black/10 bg-white p-4 text-center shadow-xs dark:border-white/15 dark:bg-[#161B22]">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-[#6B6B6B] dark:text-[#A0A0A0]">
            Favorite
          </div>
          <div className="mt-1 flex items-center justify-center gap-1 font-serif text-xl font-bold text-[#C84B31] dark:text-[#E85C40]">
            <span>あ</span>
            <span className="text-xs">🌸</span>
          </div>
          <div className="text-[9px] text-[#6B6B6B] dark:text-[#A0A0A0]">kana</div>
        </div>
      </div>

      {/* JLPT Progress List */}
      <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-xs dark:border-white/15 dark:bg-[#161B22] space-y-4">
        <button
          type="button"
          onClick={() => setJlptExpanded(!jlptExpanded)}
          className="flex w-full items-center justify-between font-semibold text-sm text-[#1A1A1A] dark:text-[#F0F4F8]"
        >
          <span>JLPT Progress</span>
          {jlptExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {jlptExpanded && (
          <div className="space-y-4 border-t border-black/5 pt-4 text-xs dark:border-white/10">
            {/* N5 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                <span>N5</span>
                <span>{stats.vocabCount + stats.grammarCount}/843 items 0%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                <div
                  className="h-full bg-[#2D5F8A] dark:bg-[#60A5FA] rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      ((stats.vocabCount + stats.grammarCount) / 843) * 100
                    )}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#6B6B6B] dark:text-[#A0A0A0]">
                <span>Vocabulary: {stats.vocabCount}/697</span>
                <span>Grammar: {stats.grammarCount}/146</span>
              </div>
            </div>

            {/* N4 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                <span>N4</span>
                <span>0/773 items 0%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                <div className="h-full bg-[#2D5F8A] dark:bg-[#60A5FA] rounded-full" style={{ width: "0%" }} />
              </div>
              <div className="flex justify-between text-[10px] text-[#6B6B6B] dark:text-[#A0A0A0]">
                <span>Vocabulary: 0/653</span>
                <span>Grammar: 0/120</span>
              </div>
            </div>

            {/* N3 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                <span>N3</span>
                <span>0/2238 items 0%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                <div className="h-full bg-[#2D5F8A] dark:bg-[#60A5FA] rounded-full" style={{ width: "0%" }} />
              </div>
              <div className="flex justify-between text-[10px] text-[#6B6B6B] dark:text-[#A0A0A0]">
                <span>Vocabulary: 0/2114</span>
                <span>Grammar: 0/124</span>
              </div>
            </div>

            {/* N2 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                <span>N2</span>
                <span>0/1968 items 0%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                <div className="h-full bg-[#2D5F8A] dark:bg-[#60A5FA] rounded-full" style={{ width: "0%" }} />
              </div>
              <div className="flex justify-between text-[10px] text-[#6B6B6B] dark:text-[#A0A0A0]">
                <span>Vocabulary: 0/1795</span>
                <span>Grammar: 0/173</span>
              </div>
            </div>

            {/* N1 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                <span>N1</span>
                <span>0/2938 items 0%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                <div className="h-full bg-[#2D5F8A] dark:bg-[#60A5FA] rounded-full" style={{ width: "0%" }} />
              </div>
              <div className="flex justify-between text-[10px] text-[#6B6B6B] dark:text-[#A0A0A0]">
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
