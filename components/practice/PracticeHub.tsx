"use client";

import Link from "next/link";
import {
  Flame,
  Zap,
  BookA,
  BookOpenCheck,
  Puzzle,
  Gamepad2,
  Calculator,
  BookOpen,
  Headphones,
  PlayCircle,
  Edit3,
  PenTool,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { practiceCategories, practiceModules, type PracticeModule } from "@/lib/data/practice";

function getModuleIcon(name: string) {
  switch (name) {
    case "book-a":
      return <BookA size={20} className="text-[#C84B31] dark:text-[#E85C40]" />;
    case "zap":
      return <Zap size={20} className="text-[#7C3AED] dark:text-[#A78BFA]" />;
    case "book-open-check":
      return <BookOpenCheck size={20} className="text-[#2D5F8A] dark:text-[#60A5FA]" />;
    case "puzzle":
      return <Puzzle size={20} className="text-amber-600 dark:text-amber-400" />;
    case "gamepad-2":
      return <Gamepad2 size={20} className="text-emerald-600 dark:text-emerald-400" />;
    case "calculator":
      return <Calculator size={20} className="text-amber-600 dark:text-amber-400" />;
    case "book-open":
      return <BookOpen size={20} className="text-amber-600 dark:text-amber-400" />;
    case "headphones":
      return <Headphones size={20} className="text-amber-500 dark:text-amber-400" />;
    case "play-circle":
      return <PlayCircle size={20} className="text-blue-500 dark:text-blue-400" />;
    case "edit-3":
      return <Edit3 size={20} className="text-rose-500 dark:text-rose-400" />;
    case "pen-tool":
      return <PenTool size={20} className="text-rose-500 dark:text-rose-400" />;
    default:
      return <Sparkles size={20} className="text-[#C84B31]" />;
  }
}

function getBadgeStyle(color?: "green" | "blue" | "purple" | "amber") {
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
  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
          <Flame size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#FAFAFA]">Practice</h1>
          <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
            Interactive trainers, speed drills, grammar conjugation, and audio comprehension.
          </p>
        </div>
      </header>

      {/* Categories Grid */}
      <div className="space-y-9">
        {practiceCategories.map((cat) => {
          const modules = practiceModules.filter((m) => m.category === cat.id);

          return (
            <section key={cat.id} className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#C84B31]/10 text-[10px] font-bold text-[#C84B31] dark:bg-[#E85C40]/20 dark:text-[#E85C40]">
                  {cat.icon}
                </span>
                <span>{cat.label}</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {modules.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="group relative flex items-start gap-4 rounded-2xl border border-black/10 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-[#C84B31] hover:shadow-md dark:border-white/15 dark:bg-[#1A1A1A] dark:hover:border-[#E85C40]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAFAF8] shadow-2xs transition group-hover:scale-105 dark:bg-[#2A2A2A]">
                      {getModuleIcon(item.iconName)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[#1A1A1A] transition group-hover:text-[#C84B31] dark:text-[#FAFAFA] dark:group-hover:text-[#E85C40]">
                          {item.title}
                        </h3>
                        {item.badge && (
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getBadgeStyle(
                              item.badgeColor
                            )}`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-[#6B6B6B] line-clamp-2 dark:text-[#A0A0A0]">
                        {item.description}
                      </p>
                    </div>

                    <ChevronRight
                      size={18}
                      className="shrink-0 text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#C84B31] dark:text-gray-600 dark:group-hover:text-[#E85C40]"
                    />
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
