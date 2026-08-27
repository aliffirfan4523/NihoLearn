"use client";

import { Moon, Sun } from "lucide-react";
import { useStore } from "@/lib/store";

export function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useStore();

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-[#6B6B6B] shadow-xs transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:border-white/15 dark:bg-[#2A2A2A] dark:text-[#A0A0A0] dark:hover:bg-white/5 dark:focus-visible:ring-white/20"
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? (
        <Sun size={18} className="text-[#FFD700]" />
      ) : (
        <Moon size={18} />
      )}
    </button>
  );
}