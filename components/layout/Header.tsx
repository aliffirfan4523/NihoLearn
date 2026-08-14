"use client";

import { Menu } from "lucide-react";
import { useStore } from "@/lib/store";

export function Header() {
  const toggleSidebar = useStore((state) => state.toggleSidebar);

  return (
    <header className="sticky top-0 z-10 border-b border-black/10 bg-[#FAFAF8]/90 px-5 py-4 backdrop-blur lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={toggleSidebar} className="rounded-xl border border-black/10 bg-white p-3 text-[#6B6B6B] shadow-sm" aria-label="Toggle sidebar">
            <Menu size={18} />
          </button>
          <div>
            <p className="text-sm font-medium text-[#C84B31]">Japanese learning progress tracker</p>
            <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">日本語トラッカー</h1>
          </div>
        </div>
        <div className="hidden rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-[#6B6B6B] sm:block">
          SQLite local mode
        </div>
      </div>
    </header>
  );
}
