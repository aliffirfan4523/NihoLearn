"use client";

import { useState, useEffect } from "react";
import { Check, Palette, Sparkles, Moon, Sun } from "lucide-react";

export interface ThemeColorOption {
  id: string;
  name: string;
  japanese: string;
  lightHex: string;
  darkHex: string;
  description: string;
}

export const THEME_COLORS: ThemeColorOption[] = [
  {
    id: "crimson",
    name: "Torii Vermilion",
    japanese: "朱色 (Shuiro)",
    lightHex: "#C84B31",
    darkHex: "#E85C40",
    description: "Traditional shrine gate cinnabar red",
  },
  {
    id: "sakura",
    name: "Sakura Rose",
    japanese: "桜色 (Sakurairo)",
    lightHex: "#E11D48",
    darkHex: "#FB7185",
    description: "Spring cherry blossom vibrant rose",
  },
  {
    id: "fuji",
    name: "Fuji Indigo",
    japanese: "藍色 (Aiiro)",
    lightHex: "#2563EB",
    darkHex: "#60A5FA",
    description: "Deep Mt. Fuji ocean blue",
  },
  {
    id: "matcha",
    name: "Matcha Green",
    japanese: "抹茶 (Matchairo)",
    lightHex: "#059669",
    darkHex: "#34D399",
    description: "Kyoto botanical green tea",
  },
  {
    id: "murasaki",
    name: "Imperial Murasaki",
    japanese: "紫 (Murasaki)",
    lightHex: "#7C3AED",
    darkHex: "#A78BFA",
    description: "Noble Heian dynasty violet",
  },
  {
    id: "amber",
    name: "Amber Gold",
    japanese: "琥珀 (Kohaku)",
    lightHex: "#D97706",
    darkHex: "#FBBF24",
    description: "Golden temple lacquer amber",
  },
  {
    id: "sumi",
    name: "Sumi Slate",
    japanese: "墨色 (Sumiiro)",
    lightHex: "#475569",
    darkHex: "#94A3B8",
    description: "Minimalist calligraphic ink",
  },
];

export function ThemeColorSelector() {
  const [activeColor, setActiveColor] = useState("crimson");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("niholearn-theme-color") || "crimson";
    setActiveColor(saved);
  }, []);

  const handleSelectColor = (colorId: string) => {
    setActiveColor(colorId);
    localStorage.setItem("niholearn-theme-color", colorId);
    document.documentElement.setAttribute("data-theme-color", colorId);
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-bold text-[#1A1A1A] dark:text-[#F1F5F9]">
        <Palette size={18} className="text-[var(--color-vermillion)]" />
        <span>Accent &amp; Theme Color</span>
      </div>

      <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
        Personalize buttons, highlights, badges, and calligraphy accents across your entire study experience.
      </p>

      {/* Color Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {THEME_COLORS.map((theme) => {
          const isSelected = activeColor === theme.id;

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => handleSelectColor(theme.id)}
              className={`group flex items-center justify-between rounded-2xl border p-3.5 text-left transition-all ${
                isSelected
                  ? "border-[var(--color-vermillion)] bg-[var(--color-vermillion)]/5 shadow-xs dark:bg-[var(--color-vermillion)]/10 ring-1 ring-[var(--color-vermillion)]"
                  : "border-black/10 bg-white hover:border-black/20 dark:border-white/10 dark:bg-[#161B22] dark:hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Color swatch circle */}
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl shadow-xs transition-transform group-hover:scale-105"
                  style={{ backgroundColor: theme.lightHex }}
                >
                  {isSelected && <Check size={16} className="text-white font-bold" />}
                </div>

                <div>
                  <div className="text-xs font-bold text-[#1A1A1A] dark:text-[#F1F5F9]">
                    {theme.name}
                  </div>
                  <div className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                    {theme.japanese}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
