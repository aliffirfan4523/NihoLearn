"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ChevronRight } from "lucide-react";
import { jlptLevels, formatLevel } from "@/lib/routes";

// 間 (ma): flat bottom nav — kanji glyph + small label, vermillion dot marks the active item.
// No glassmorphism, no shadow, no active pill.
const navGlyphs: Record<string, string> = {
  Dashboard: "家",
  Roadmap: "道",
  Practice: "練",
  Progress: "績",
  More: "…",
};

export function BottomNavbar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isDashboard = pathname === "/";
  const isRoadmap = pathname.startsWith("/roadmap");
  const isPractice = pathname.startsWith("/practice");
  const isProgress = pathname.startsWith("/progress") || pathname.startsWith("/stats");
  const isMore =
    pathname.startsWith("/sessions") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/data");

  const navItems = [
    {
      label: "Dashboard",
      href: "/",
      active: isDashboard,
    },
    {
      label: "Roadmap",
      href: "/roadmap",
      active: isRoadmap,
    },
    {
      label: "Practice",
      href: "/practice",
      active: isPractice,
    },
    {
      label: "Progress",
      href: "/progress",
      active: isProgress,
    },
    {
      label: "More",
      onClick: () => setMoreOpen(true),
      active: isMore || moreOpen,
    },
  ];

  return (
    <>
      {/* Bottom Navigation Bar — solid, flat, hairline top border */}
      <nav
        className="fixed bottom-0 inset-x-0 z-40 border-t border-black/10 bg-[#FAFAF8] dark:border-white/10 dark:bg-[#161B22]"
        aria-label="Bottom Navigation"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
          {navItems.map((item) => {
            const content = (
              <div className="flex min-h-[44px] flex-col items-center justify-center gap-0.5 px-2">
                <span
                  aria-hidden="true"
                  className={`font-serif text-lg leading-none transition-colors ${
                    item.active
                      ? "text-[#C84B31] dark:text-[#E85C40]"
                      : "text-[#1A1A1A] dark:text-[#F0F4F8]"
                  }`}
                >
                  {navGlyphs[item.label]}
                </span>
                <span
                  className={`text-xs leading-none transition-colors ${
                    item.active
                      ? "font-semibold text-[#C84B31] dark:text-[#E85C40]"
                      : "text-[#6B6B6B] dark:text-[#A0A0A0]"
                  }`}
                >
                  {item.label}
                </span>
                {/* active marker: vermillion dot */}
                <span
                  aria-hidden="true"
                  className={`h-1 w-1 rounded-full transition-colors ${
                    item.active ? "bg-[#C84B31] dark:bg-[#E85C40]" : "bg-transparent"
                  }`}
                />
              </div>
            );

            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  prefetch={true}
                  aria-current={item.active ? "page" : undefined}
                  className="flex-1 rounded-xl text-center transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C84B31]/50 dark:focus-visible:ring-[#E85C40]/50"
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                aria-expanded={moreOpen}
                className="flex-1 rounded-xl text-center transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C84B31]/50 dark:focus-visible:ring-[#E85C40]/50"
              >
                {content}
              </button>
            );
          })}
        </div>
      </nav>

      {/* More Options Modal Sheet */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
          onClick={() => setMoreOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md rounded-t-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#161B22] sm:rounded-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/10">
              <h3 className="font-serif text-lg font-semibold text-[#1A1A1A] dark:text-[#F0F4F8]">Explore NihoLearn</h3>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="rounded-full p-2 text-[#6B6B6B] transition hover:bg-black/5 hover:text-[#1A1A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:text-[#A0A0A0] dark:hover:bg-white/5 dark:hover:text-[#F0F4F8] dark:focus-visible:ring-white/20"
                aria-label="Close menu"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Primary Additional Pages */}
              <div className="space-y-1">
                <Link
                  href="/sessions"
                  prefetch={true}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center justify-between rounded-2xl p-3.5 transition hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span aria-hidden="true" className="w-6 text-center font-serif text-lg font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">動</span>
                    <div>
                      <div className="font-semibold text-[#1A1A1A] dark:text-[#F0F4F8]">Study Sessions</div>
                      <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Practice timer & study log history</div>
                    </div>
                  </div>
                  <ChevronRight size={18} aria-hidden="true" className="text-[#6B6B6B] dark:text-[#A0A0A0]" />
                </Link>

                <Link
                  href="/data"
                  prefetch={true}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center justify-between rounded-2xl p-3.5 transition hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span aria-hidden="true" className="w-6 text-center font-serif text-lg font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">集</span>
                    <div>
                      <div className="font-semibold text-[#1A1A1A] dark:text-[#F0F4F8]">Data Editor</div>
                      <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Edit Kana & JLPT learning data</div>
                    </div>
                  </div>
                  <ChevronRight size={18} aria-hidden="true" className="text-[#6B6B6B] dark:text-[#A0A0A0]" />
                </Link>

                <Link
                  href="/profile"
                  prefetch={true}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center justify-between rounded-2xl p-3.5 transition hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span aria-hidden="true" className="w-6 text-center font-serif text-lg font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">人</span>
                    <div>
                      <div className="font-semibold text-[#1A1A1A] dark:text-[#F0F4F8]">User Profile</div>
                      <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Account settings & JLPT level target</div>
                    </div>
                  </div>
                  <ChevronRight size={18} aria-hidden="true" className="text-[#6B6B6B] dark:text-[#A0A0A0]" />
                </Link>
              </div>

              {/* Quick Hub Links */}
              <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 dark:border-white/10 dark:bg-[#1E232B]">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
                  Learning Hubs
                </div>
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <Link
                    href="/progress/kana"
                    prefetch={true}
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center justify-between rounded-xl bg-white p-3 text-sm font-medium text-[#1A1A1A] transition hover:text-[#C84B31] dark:bg-[#161B22] dark:text-[#F0F4F8] dark:hover:text-[#E85C40]"
                  >
                    <span>あ Kana Progress</span>
                    <ChevronRight size={14} aria-hidden="true" className="text-[#6B6B6B] dark:text-[#A0A0A0]" />
                  </Link>
                  <Link
                    href="/progress/kanji"
                    prefetch={true}
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center justify-between rounded-xl bg-white p-3 text-sm font-medium text-[#1A1A1A] transition hover:text-[#C84B31] dark:bg-[#161B22] dark:text-[#F0F4F8] dark:hover:text-[#E85C40]"
                  >
                    <span>漢 Kanji List</span>
                    <ChevronRight size={14} aria-hidden="true" className="text-[#6B6B6B] dark:text-[#A0A0A0]" />
                  </Link>
                </div>
              </div>

              {/* JLPT Levels Quick Roadmap */}
              <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 dark:border-white/10 dark:bg-[#1E232B]">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
                  JLPT Levels
                </div>
                <div className="mt-2.5 grid grid-cols-5 gap-1.5">
                  {jlptLevels.map((lvl) => (
                    <Link
                      key={lvl}
                      href={`/${lvl}`}
                      onClick={() => setMoreOpen(false)}
                      className="flex flex-col items-center justify-center rounded-xl bg-white py-2.5 text-xs font-bold text-[#1A1A1A] transition hover:bg-[#C84B31] hover:text-white dark:bg-[#161B22] dark:text-[#F0F4F8] dark:hover:bg-[#E85C40] dark:hover:text-white"
                    >
                      {formatLevel(lvl)}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
