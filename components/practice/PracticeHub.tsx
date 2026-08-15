"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Flame,
  Zap,
  BookA,
  BookOpenCheck,
  Puzzle,
  Gamepad2,
  BookOpen,
  Headphones,
  PlayCircle,
  Edit3,
  ChevronRight,
  Sparkles,
  Lock,
  X,
  Clock,
  Target,
  Layers,
  RotateCw,
  Briefcase,
  Mic,
  EyeOff,
  FileText,
  Volume2,
  Trophy,
} from "lucide-react";
import { practiceCategories, practiceModules, type PracticeModule } from "@/lib/data/practice";

function getModuleIcon(name: string) {
  switch (name) {
    case "book-a":
      return <BookA size={16} className="text-[#C84B31] dark:text-[#E85C40]" />;
    case "zap":
      return <Zap size={16} className="text-[#7C3AED] dark:text-[#A78BFA]" />;
    case "book-open-check":
      return <BookOpenCheck size={16} className="text-[#2D5F8A] dark:text-[#60A5FA]" />;
    case "puzzle":
      return <Puzzle size={16} className="text-purple-600 dark:text-purple-400" />;
    case "gamepad-2":
      return <Gamepad2 size={16} className="text-emerald-600 dark:text-emerald-400" />;
    case "book-open":
      return <BookOpen size={16} className="text-teal-600 dark:text-teal-400" />;
    case "headphones":
      return <Headphones size={16} className="text-rose-500 dark:text-rose-400" />;
    case "target":
      return <Target size={16} className="text-orange-500 dark:text-orange-400" />;
    case "layers":
      return <Layers size={16} className="text-indigo-500 dark:text-indigo-400" />;
    case "rotate-cw":
      return <RotateCw size={16} className="text-emerald-600 dark:text-emerald-400" />;
    case "briefcase":
      return <Briefcase size={16} className="text-stone-500 dark:text-stone-400" />;
    case "mic":
      return <Mic size={16} className="text-pink-500 dark:text-pink-400" />;
    case "eye-off":
      return <EyeOff size={16} className="text-cyan-600 dark:text-cyan-400" />;
    case "file-text":
      return <FileText size={16} className="text-blue-600 dark:text-blue-400" />;
    case "volume-2":
      return <Volume2 size={16} className="text-violet-500 dark:text-violet-400" />;
    case "trophy":
      return <Trophy size={16} className="text-amber-500 dark:text-amber-400" />;
    case "flame":
      return <Flame size={16} className="text-orange-500 dark:text-orange-400" />;
    case "edit-3":
      return <Edit3 size={16} className="text-purple-500 dark:text-purple-400" />;
    default:
      return <Sparkles size={16} className="text-[#C84B31]" />;
  }
}

function getBadgeStyle(color?: "green" | "blue" | "purple" | "amber" | "gray") {
  switch (color) {
    case "green":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
    case "blue":
      return "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30";
    case "purple":
      return "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30";
    case "amber":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30";
    default:
      return "bg-black/5 text-gray-700 dark:bg-white/10 dark:text-gray-300";
  }
}

export function PracticeHub() {
  const [upcomingModalItem, setUpcomingModalItem] = useState<PracticeModule | null>(null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
            <Flame size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#FAFAFA]">
              Practice Dojo
            </h1>
            <p className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
              Interactive trainers, speed drills, grammar, listening comprehension, and arcade games.
            </p>
          </div>
        </div>

        {/* Quick Daily Dojo Button */}
        <Link
          href="/practice/daily"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-vermillion)] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:opacity-90 self-start sm:self-auto"
        >
          <Trophy size={14} />
          <span>Daily Challenge</span>
        </Link>
      </header>

      {/* Categories Grid */}
      <div className="space-y-7">
        {practiceCategories.map((cat) => {
          const modules = practiceModules.filter((m) => m.category === cat.id);

          return (
            <section key={cat.id} className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
                <span className="flex h-4 w-4 items-center justify-center rounded-md bg-[#C84B31]/10 text-[9px] font-bold text-[#C84B31] dark:bg-[#E85C40]/20 dark:text-[#E85C40]">
                  {cat.icon}
                </span>
                <span className="text-[11px] font-bold">{cat.label}</span>
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
                        className="group relative flex flex-col justify-between rounded-2xl border border-dashed border-black/15 bg-[#FAFAF8]/50 p-3.5 text-left transition-all hover:border-[#C84B31]/40 hover:bg-[#FAFAF8] dark:border-white/10 dark:bg-[#161B22]/50 dark:hover:border-[#E85C40]/40 dark:hover:bg-[#161B22]"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 opacity-70">
                              {getModuleIcon(mod.iconName)}
                            </div>
                            <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-400">
                              <Lock size={9} /> Upcoming
                            </span>
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#C84B31] dark:text-[#FAFAFA] dark:group-hover:text-[#E85C40]">
                              {mod.title}
                            </h3>
                            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[#6B6B6B] dark:text-[#A0A0A0]">
                              {mod.description}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-[10px] font-semibold text-[#6B6B6B] dark:text-[#A0A0A0]">
                          <span className="flex items-center gap-1 text-[10px] text-purple-600 dark:text-purple-400">
                            <Clock size={10} /> Soon
                          </span>
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
                      className="group flex flex-col justify-between rounded-2xl border border-black/10 bg-white p-3.5 shadow-xs transition-all hover:border-[#C84B31]/50 hover:shadow-md dark:border-white/10 dark:bg-[#161B22] dark:hover:border-[#E85C40]/50"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 transition-transform group-hover:scale-110">
                            {getModuleIcon(mod.iconName)}
                          </div>
                          {mod.badge && (
                            <span
                              className={`rounded-full border px-2 py-0.2 text-[10px] font-bold ${getBadgeStyle(
                                mod.badgeColor
                              )}`}
                            >
                              {mod.badge}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#C84B31] dark:text-[#FAFAFA] dark:group-hover:text-[#E85C40]">
                            {mod.title}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[#6B6B6B] dark:text-[#A0A0A0]">
                            {mod.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-end text-[11px] font-bold text-[#C84B31] dark:text-[#E85C40]">
                        <span className="flex items-center gap-0.5 transition-transform group-hover:translate-x-1">
                          Launch <ChevronRight size={12} />
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
            className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#161B22] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                  Feature In Development
                </span>
              </div>
              <button
                type="button"
                onClick={() => setUpcomingModalItem(null)}
                className="rounded-full p-1 text-gray-400 hover:text-black dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                {upcomingModalItem.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#6B6B6B] dark:text-[#A0A0A0]">
                {upcomingModalItem.description}
              </p>
            </div>

            <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 text-xs dark:border-white/5 dark:bg-[#1E232B] space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                <Sparkles size={14} className="text-[#C84B31]" />
                What to expect:
              </div>
              <p className="text-[#6B6B6B] dark:text-[#A0A0A0]">
                This interactive drill mode is being prepared with full database tracking, audio synthesis, and JLPT exam scoring.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setUpcomingModalItem(null)}
              className="w-full rounded-2xl bg-[var(--color-vermillion)] py-3 text-xs font-bold text-white transition hover:opacity-90"
            >
              Got it, continue practicing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
