"use client";

import { Moon, Sun } from "lucide-react";
import { useStore } from "@/lib/store";

export function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useStore();

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-[#6B6B6B] shadow-sm transition hover:bg-[#FAFAF8] dark:border-white/20 dark:bg-[#2A2A2A] dark:text-[#A0A0A0] dark:hover:bg-[#1A1A1A]"
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