"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { jlptLevels, levelSections, mainNav, formatLevel } from "@/lib/routes";
import { useStore } from "@/lib/store";

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useStore();

  return (
    <>
      <button
        type="button"
        onClick={toggleSidebar}
        className="fixed left-4 top-4 z-50 rounded-xl border border-black/10 bg-white p-3 text-[#1A1A1A] shadow-xs transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 lg:hidden dark:border-white/15 dark:bg-[#161B22] dark:text-[#F0F4F8] dark:hover:bg-white/5 dark:focus-visible:ring-white/20"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={`${sidebarOpen ? "translate-x-0 lg:w-72 lg:px-5" : "-translate-x-full lg:w-0 lg:translate-x-0 lg:px-0"} fixed inset-y-0 left-0 z-40 w-72 shrink-0 overflow-hidden border-r border-black/10 bg-white/95 px-5 py-6 shadow-xl transition-all duration-300 lg:static lg:shadow-none dark:border-white/10 dark:bg-[#161B22]/95`}>
        <div className="flex items-center gap-3">
          <Link href="/" className="block flex-1 rounded-2xl bg-[#C84B31] px-4 py-4 text-white shadow-xs dark:bg-[#E85C40]">
            <span className="block text-sm font-medium opacity-90">日本語トラッカー</span>
            <span className="block text-2xl font-bold tracking-tight">NihoLearn</span>
          </Link>
          <button type="button" onClick={toggleSidebar} className="hidden rounded-xl border border-black/10 bg-[#FAFAF8] p-3 text-[#6B6B6B] transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 lg:block dark:border-white/15 dark:bg-[#1E232B] dark:text-[#A0A0A0] dark:hover:bg-white/5 dark:focus-visible:ring-white/20" aria-label="Collapse sidebar">
            <X size={18} />
          </button>
        </div>

        <nav className="mt-8 space-y-8 text-sm">
          <section className="space-y-1">
            {mainNav.map((item) => (
              <Link key={item.href} href={item.href} className="block rounded-xl px-3 py-2 font-medium text-[#1A1A1A] hover:bg-[#FAFAF8] hover:text-[#C84B31] dark:text-[#F0F4F8] dark:hover:bg-[#1E232B] dark:hover:text-[#E85C40]">
                {item.label}
              </Link>
            ))}
          </section>

          <section>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] dark:text-[#A0A0A0]">JLPT Mastery</p>
            <div className="space-y-4">
              {jlptLevels.map((level) => (
                <div key={level} className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-3 dark:border-white/10 dark:bg-[#1E232B]">
                  <Link href={`/${level}`} className="font-semibold text-[#2D5F8A] hover:text-[#C84B31] dark:text-[#60A5FA] dark:hover:text-[#E85C40]">
                    {formatLevel(level)} Overview
                  </Link>
                  <div className="mt-2 space-y-1">
                    {levelSections.map((section) => (
                      <Link key={section} href={`/${level}/${section}`} className="block rounded-lg px-2 py-1 capitalize text-[#6B6B6B] hover:bg-white hover:text-[#C84B31] dark:text-[#A0A0A0] dark:hover:bg-[#161B22] dark:hover:text-[#E85C40]">
                        {section}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </nav>
      </aside>
    </>
  );
}
