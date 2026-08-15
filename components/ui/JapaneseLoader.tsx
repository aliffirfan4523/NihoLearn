"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

const LOADING_MESSAGES = [
  "Preparing your kanji...",
  "Sharpening the calligraphy brush...",
  "Tracing stroke orders & radicals...",
  "Loading Joyo & JLPT dictionary...",
  "Polishing readings and meanings...",
];

const KANJI_ANIMATION_POOL = ["日", "学", "語", "書", "道", "心", "桜", "夢", "気", "生"];

export function JapaneseLoader({ message }: { message?: string }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [kanjiIndex, setKanjiIndex] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1800);

    const kanjiInterval = setInterval(() => {
      setKanjiIndex((k) => (k + 1) % KANJI_ANIMATION_POOL.length);
    }, 900);

    return () => {
      clearInterval(msgInterval);
      clearInterval(kanjiInterval);
    };
  }, []);

  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-black/10 bg-white/50 p-8 backdrop-blur-sm dark:border-white/10 dark:bg-[#161920]/80">
      {/* Animated pulsing Kanji badge */}
      <div className="relative flex h-20 w-20 items-center justify-center">
        {/* Glowing ring animation */}
        <div className="absolute inset-0 rounded-3xl bg-[#C84B31]/15 animate-ping duration-1000 dark:bg-[#E85C40]/20" />
        <div className="absolute inset-0 rounded-3xl border-2 border-dashed border-[#C84B31]/40 animate-spin duration-3000 dark:border-[#E85C40]/40" />

        {/* Center Kanji character */}
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white font-serif text-3xl font-bold text-[#C84B31] shadow-md transition-transform duration-300 dark:bg-[#1E232E] dark:text-[#E85C40]">
          {KANJI_ANIMATION_POOL[kanjiIndex]}
        </div>
      </div>

      {/* Animated Loading Text */}
      <div className="mt-5 flex items-center gap-2 text-sm font-bold tracking-wide text-[#1A1A1A] dark:text-[#F1F5F9]">
        <Sparkles size={15} className="text-[#C84B31] animate-bounce dark:text-[#E85C40]" />
        <span>{message || LOADING_MESSAGES[msgIndex]}</span>
      </div>

      {/* Progress pulse dots */}
      <div className="mt-3 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[#C84B31] animate-pulse dark:bg-[#E85C40]" style={{ animationDelay: "0ms" }} />
        <span className="h-1.5 w-1.5 rounded-full bg-[#C84B31] animate-pulse dark:bg-[#E85C40]" style={{ animationDelay: "200ms" }} />
        <span className="h-1.5 w-1.5 rounded-full bg-[#C84B31] animate-pulse dark:bg-[#E85C40]" style={{ animationDelay: "400ms" }} />
      </div>
    </div>
  );
}
