"use client";

import Link from "next/link";

export function Header({ userMenu }: { userMenu: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-[#FAFAF8]/90 px-4 py-3.5 backdrop-blur-md sm:px-6 lg:px-8 dark:border-white/10 dark:bg-[#0E1117]/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 rounded-xl transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C84B31]/50 dark:focus-visible:ring-[#E85C40]/50">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#C84B31] font-bold text-white shadow-xs dark:bg-[#E85C40]">
            日
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#FAFAFA]">NihoLearn</span>
              <span className="rounded-md bg-[#C84B31]/10 px-1.5 py-0.5 text-xs font-semibold text-[#C84B31] dark:bg-[#E85C40]/15 dark:text-[#E85C40]">日本語</span>
            </div>
            <p className="hidden sm:block text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Japanese Learning Tracker</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {userMenu}
        </div>
      </div>
    </header>
  );
}
