"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  BookOpen,
  BarChart3,
  MoreHorizontal,
  X,
  History,
  Database,
  User,
  Layers,
  ChevronRight
} from "lucide-react";
import { jlptLevels, formatLevel } from "@/lib/routes";

export function BottomNavbar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isDashboard = pathname === "/";
  const isRoadmap = /^\/n[1-5]$/.test(pathname);
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
      icon: LayoutDashboard,
      active: isDashboard,
    },
    {
      label: "Roadmap",
      href: "/n5",
      icon: Compass,
      active: isRoadmap,
    },
    {
      label: "Practice",
      href: "/practice",
      icon: BookOpen,
      active: isPractice,
    },
    {
      label: "Progress",
      href: "/progress",
      icon: BarChart3,
      active: isProgress,
    },
    {
      label: "More",
      onClick: () => setMoreOpen(true),
      icon: MoreHorizontal,
      active: isMore || moreOpen,
    },
  ];

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 inset-x-0 z-40 border-t border-black/10 bg-white/95 backdrop-blur-md dark:border-white/10 dark:bg-[#1A1A1A]/95 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)]"
        aria-label="Bottom Navigation"
      >
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const content = (
              <div className="flex flex-col items-center gap-1 py-1">
                <div
                  className={`flex h-8 w-12 items-center justify-center rounded-full transition-all ${
                    item.active
                      ? "bg-[#C84B31] text-white shadow-sm dark:bg-[#E85C40]"
                      : "text-[#6B6B6B] hover:text-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:text-[#FAFAFA]"
                  }`}
                >
                  <Icon size={20} />
                </div>
                <span
                  className={`text-[11px] font-medium transition-colors ${
                    item.active
                      ? "font-semibold text-[#C84B31] dark:text-[#E85C40]"
                      : "text-[#6B6B6B] dark:text-[#A0A0A0]"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );

            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex-1 text-center transition hover:opacity-80 focus:outline-none"
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
                className="flex-1 text-center transition hover:opacity-80 focus:outline-none"
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
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs sm:items-center sm:p-4"
          onClick={() => setMoreOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md rounded-t-3xl border border-black/10 bg-white p-6 shadow-2xl dark:border-white/15 dark:bg-[#1A1A1A] sm:rounded-3xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#C84B31]/10 text-[#C84B31] dark:bg-[#E85C40]/15 dark:text-[#E85C40]">
                  <Layers size={18} />
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Explore NihoLearn</h3>
              </div>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[#2A2A2A] dark:hover:text-gray-200"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Primary Additional Pages */}
              <div className="space-y-1">
                <Link
                  href="/sessions"
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center justify-between rounded-2xl p-3.5 transition hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
                      <History size={20} />
                    </div>
                    <div>
                      <div className="font-semibold text-[#1A1A1A] dark:text-[#FAFAFA]">Study Sessions</div>
                      <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Practice timer & study log history</div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </Link>

                <Link
                  href="/data"
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center justify-between rounded-2xl p-3.5 transition hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                      <Database size={20} />
                    </div>
                    <div>
                      <div className="font-semibold text-[#1A1A1A] dark:text-[#FAFAFA]">Data Editor</div>
                      <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Edit Kana & JLPT learning data</div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </Link>

                <Link
                  href="/profile"
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center justify-between rounded-2xl p-3.5 transition hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                      <User size={20} />
                    </div>
                    <div>
                      <div className="font-semibold text-[#1A1A1A] dark:text-[#FAFAFA]">User Profile</div>
                      <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Account settings & JLPT level target</div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </Link>
              </div>

              {/* Kana Quick Links */}
              <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 dark:border-white/10 dark:bg-[#2A2A2A]">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
                  Kana Charts
                </div>
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <Link
                    href="/kana/hiragana"
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center justify-between rounded-xl bg-white p-3 text-sm font-medium text-[#1A1A1A] shadow-xs hover:border-[#C84B31] hover:text-[#C84B31] dark:bg-[#1A1A1A] dark:text-[#FAFAFA] dark:hover:text-[#E85C40]"
                  >
                    <span>あ Hiragana</span>
                    <ChevronRight size={14} className="text-gray-400" />
                  </Link>
                  <Link
                    href="/kana/katakana"
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center justify-between rounded-xl bg-white p-3 text-sm font-medium text-[#1A1A1A] shadow-xs hover:border-[#C84B31] hover:text-[#C84B31] dark:bg-[#1A1A1A] dark:text-[#FAFAFA] dark:hover:text-[#E85C40]"
                  >
                    <span>ア Katakana</span>
                    <ChevronRight size={14} className="text-gray-400" />
                  </Link>
                </div>
              </div>

              {/* JLPT Levels Quick Roadmap */}
              <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 dark:border-white/10 dark:bg-[#2A2A2A]">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
                  JLPT Levels
                </div>
                <div className="mt-2.5 grid grid-cols-5 gap-1.5">
                  {jlptLevels.map((lvl) => (
                    <Link
                      key={lvl}
                      href={`/${lvl}`}
                      onClick={() => setMoreOpen(false)}
                      className="flex flex-col items-center justify-center rounded-xl bg-white py-2.5 text-xs font-bold text-[#2D5F8A] shadow-xs transition hover:bg-[#C84B31] hover:text-white dark:bg-[#1A1A1A] dark:text-[#4A86B8] dark:hover:bg-[#E85C40] dark:hover:text-white"
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
