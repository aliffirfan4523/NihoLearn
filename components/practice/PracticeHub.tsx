"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  X,
  Lock,
} from "lucide-react";
import { practiceCategories, practiceModules, type PracticeModule } from "@/lib/data/practice";

// Module icons → single kanji glyph in serif. Monochrome ink, vermillion reserved for CTAs/active.
function getModuleIcon(name: string) {
  const kanjiMap: Record<string, string> = {
    "book-a": "読",
    "zap": "迅",
    "book-open-check": "確",
    "puzzle": "組",
    "gamepad-2": "遊",
    "book-open": "本",
    "headphones": "聴",
    "target": "的",
    "layers": "重",
    "rotate-cw": "復",
    "briefcase": "篭",
    "mic": "声",
    "eye-off": "隠",
    "file-text": "書",
    "volume-2": "音",
    "trophy": "賞",
    "flame": "炎",
    "edit-3": "編",
    "sparkles": "綺",
  };
  return (
    <span className="font-serif text-lg font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
      {kanjiMap[name] ?? "✦"}
    </span>
  );
}

export function PracticeHub() {
  const [upcomingModalItem, setUpcomingModalItem] = useState<PracticeModule | null>(null);

  return (
    <div className="space-y-8">
      {/* Header — flat, no icon-in-rounded-box */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#FAFAFA]">
            練 Practice Dojo
          </h1>
          <p className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
            Interactive trainers, speed drills, grammar, listening comprehension, and arcade games.
          </p>
        </div>

        {/* Quick Daily Dojo Button */}
        <Link
          href="/practice/daily"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#C84B31] px-3.5 py-2 text-xs font-bold text-white transition hover:opacity-90 self-start sm:self-auto dark:bg-[#E85C40]"
        >
          <span className="font-serif">賞</span>
          <span>Daily Challenge</span>
        </Link>
      </header>

      {/* Categories Grid */}
      <div className="space-y-7">
        {practiceCategories.map((cat) => {
          const modules = practiceModules.filter((m) => m.category === cat.id);

          return (
            <section key={cat.id} className="space-y-3">
              <div className="flex items-center gap-2 border-b border-black/5 pb-2 dark:border-white/10">
                <span className="font-serif text-base font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
                  {cat.icon}
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] dark:text-[#A0A0A0]">
                  {cat.label}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {modules.map((mod) => {
                  const isUpcoming = mod.isUpcoming;

                  if (isUpcoming) {
                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => setUpcomingModalItem(mod)}
                        className="group relative flex flex-col justify-between rounded-2xl border border-dashed border-black/15 bg-[#FAFAF8]/50 p-3.5 text-left transition hover:border-[#C84B31]/40 hover:bg-[#FAFAF8] dark:border-white/10 dark:bg-[#161B22]/50 dark:hover:border-[#E85C40]/40 dark:hover:bg-[#161B22]"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 opacity-70">
                              {getModuleIcon(mod.iconName)}
                            </div>
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#6B6B6B] dark:text-[#A0A0A0]">
                              <Lock size={10} aria-hidden="true" /> Upcoming
                            </span>
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#C84B31] dark:text-[#FAFAFA] dark:group-hover:text-[#E85C40]">
                              {mod.title}
                            </h3>
                            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#6B6B6B] dark:text-[#A0A0A0]">
                              {mod.description}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs font-semibold text-[#6B6B6B] dark:text-[#A0A0A0]">
                          <span>Soon</span>
                          <span className="font-bold underline decoration-dotted group-hover:text-[#C84B31] dark:group-hover:text-[#E85C40]">
                            Preview
                          </span>
                        </div>
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={mod.id}
                      href={mod.href}
                      prefetch={true}
                      className="group flex flex-col justify-between rounded-2xl border border-black/10 bg-white p-3.5 transition hover:border-[#C84B31]/50 dark:border-white/10 dark:bg-[#161B22] dark:hover:border-[#E85C40]/50"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/5 transition-colors group-hover:bg-[#C84B31]/10 dark:bg-white/5 dark:group-hover:bg-[#E85C40]/10">
                            {getModuleIcon(mod.iconName)}
                          </div>
                          {mod.badge && (
                            <span className="text-xs font-bold text-[#6B6B6B] dark:text-[#A0A0A0]">
                              {mod.badge}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#C84B31] dark:text-[#FAFAFA] dark:group-hover:text-[#E85C40]">
                            {mod.title}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#6B6B6B] dark:text-[#A0A0A0]">
                            {mod.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-end text-xs font-bold text-[#C84B31] dark:text-[#E85C40]">
                        <span className="flex items-center gap-0.5 transition-transform group-hover:translate-x-1">
                          Launch <ChevronRight size={12} aria-hidden="true" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Upcoming Modal Info */}
      {upcomingModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setUpcomingModalItem(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#161B22] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#6B6B6B] dark:text-[#A0A0A0]">
                  Feature In Development
                </span>
              </div>
              <button
                type="button"
                onClick={() => setUpcomingModalItem(null)}
                className="rounded-full p-1 text-[#6B6B6B] hover:text-black dark:text-[#A0A0A0] dark:hover:text-white"
                aria-label="Close"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div>
              <h3 className="font-serif text-xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                {upcomingModalItem.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#6B6B6B] dark:text-[#A0A0A0]">
                {upcomingModalItem.description}
              </p>
            </div>

            <div className="border-t border-black/5 pt-4 text-xs dark:border-white/10 space-y-2">
              <div className="font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                What to expect:
              </div>
              <p className="text-[#6B6B6B] dark:text-[#A0A0A0]">
                This interactive drill mode is being prepared with full database tracking, audio synthesis, and JLPT exam scoring.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setUpcomingModalItem(null)}
              className="w-full rounded-2xl bg-[#C84B31] py-3 text-xs font-bold text-white transition hover:opacity-90 dark:bg-[#E85C40]"
            >
              Got it, continue practicing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
