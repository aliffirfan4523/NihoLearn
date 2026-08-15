"use client";

import { X, Play, RotateCw } from "lucide-react";
import type { KanaCharacter } from "@/types";
import { getStrokes, strokeColors } from "@/components/kana/strokeData";

function mnemonic(item: KanaCharacter) {
  const key = item.romaji.toLowerCase();
  const examples: Record<string, string> = {
    a: "あ opens your mouth: AH.",
    i: "い looks like two eels saying EE.",
    u: "う looks like a boxer getting punched: OO.",
    e: "え looks like an energetic runner: EH.",
    o: "お looks like an old person leaning: OH.",
    ka: "か is a KAt (cat) playing with a toy.",
    ki: "き looks like a KEY with extra teeth.",
    ku: "く is a Cuckoo beak saying KU.",
    ke: "け looks like a KEg tap.",
    ko: "こ is two COins stacked.",
    sa: "さ looks like a sign saying SA.",
    shi: "し is a fishing hook: SHI.",
    su: "す looks like a swirl of SOUp.",
    se: "せ looks like a setting table: SE.",
    so: "そ is a zigzag sewing thread: SO.",
  };

  return examples[key] ?? `${item.character} makes the ${item.romaji.toUpperCase()} sound.`;
}

function kataToHira(str: string): string {
  return str.replace(/[\u30a1-\u30f6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

function speak(text: string) {
  if (typeof window === "undefined") return;

  // Convert Katakana to Hiragana so speech engines & TTS streams synthesize audio properly
  const spokenText = kataToHira(text);

  // 1. Synchronously trigger Web Speech API inside user click gesture
  if ("speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = "ja-JP";
      utterance.rate = 0.8;
      utterance.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const jaVoice = voices.find(
        (v) => v.lang.toLowerCase().includes("ja") || v.lang.toLowerCase().includes("jp")
      );
      if (jaVoice) {
        utterance.voice = jaVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("SpeechSynthesis error:", err);
    }
  }

  // 2. Also play CORS-enabled Japanese TTS audio stream
  try {
    const ttsUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(spokenText)}&le=jap`;
    const audio = new Audio(ttsUrl);
    audio.volume = 1.0;
    audio.play().catch(() => {});
  } catch {}
}

function StrokePreview({ character }: { character: string }) {
  const isCombination = character.length === 2;

  if (isCombination) {
    const c1 = character[0];
    const c2 = character[1];
    const s1 = getStrokes({ character: c1, romaji: "" });
    const s2 = getStrokes({ character: c2, romaji: "" });
    const totalStrokesCount = s1.length + s2.length;

    if (totalStrokesCount === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-gray-50 p-3 text-center dark:bg-[#2A2A2A]">
          <div className="font-serif text-6xl font-bold leading-none text-[#C84B31]/10 dark:text-[#E85C40]/20">{character}</div>
          <span className="text-sm italic text-gray-400 dark:text-gray-500">Stroke data not available for this character</span>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl p-3 text-center">
        <svg viewBox="0 0 218 109" className="h-44 w-72" aria-label={`${character} stroke order`}>
          <g transform="translate(0, 0)">
            {s1.map((d, i) => (
              <path
                key={`c1-${i}`}
                d={d}
                pathLength={1000}
                fill="none"
                stroke={strokeColors[i % strokeColors.length]}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="stroke-draw"
                style={{ animationDelay: `${i * 600}ms` }}
              />
            ))}
          </g>
          <g transform="translate(109, 14) scale(0.8)">
            {s2.map((d, i) => {
              const globalIndex = s1.length + i;
              return (
                <path
                  key={`c2-${i}`}
                  d={d}
                  pathLength={1000}
                  fill="none"
                  stroke={strokeColors[globalIndex % strokeColors.length]}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="stroke-draw"
                  style={{ animationDelay: `${globalIndex * 600}ms` }}
                />
              );
            })}
          </g>
        </svg>
        <span className="text-sm italic text-gray-400 dark:text-gray-500">
          {totalStrokesCount} strokes ({s1.length} + {s2.length}) · drawn in order
        </span>
      </div>
    );
  }

  const strokes = getStrokes({ character, romaji: "" });
  const hasStrokes = strokes && strokes.length > 0;

  if (!hasStrokes) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-gray-50 p-3 text-center dark:bg-[#2A2A2A]">
        <div className="font-serif text-[8rem] font-bold leading-none text-[#C84B31]/10 dark:text-[#E85C40]/20">{character}</div>
        <span className="text-sm italic text-gray-400 dark:text-gray-500">Stroke data not available for this character</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl p-3 text-center">
      <svg viewBox="0 0 109 109" className="h-44 w-44" aria-label={`${character} stroke order`}>
        {strokes.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1000}
            fill="none"
            stroke={strokeColors[i % strokeColors.length]}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-draw"
            style={{ animationDelay: `${i * 700}ms` }}
          />
        ))}
      </svg>
      <span className="text-sm italic text-gray-400 dark:text-gray-500">
        {strokes.length} stroke{strokes.length > 1 ? "s" : ""} · drawn in order
      </span>
    </div>
  );
}

function Illustration({ item }: { item: KanaCharacter }) {
  const isKa = item.romaji === "ka";
  const isCombination = item.character.length > 1;

  return (
    <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 dark:border-white/10 dark:bg-[#2A2A2A]">
      <div className="absolute left-5 top-4 font-serif text-4xl font-bold text-black dark:text-[#FAFAFA]">{item.character}</div>
      {isKa ? (
        <svg viewBox="0 0 220 180" className="h-full w-full" aria-label="cat mnemonic illustration">
          <path d="M102 54 C84 48, 64 60, 58 82 C50 116, 78 145, 112 143 C146 141, 166 112, 156 83 C149 63, 126 49, 102 54Z" fill="#111" />
          <path d="M78 65 L88 38 L101 63Z" fill="#111" />
          <path d="M126 63 L142 38 L146 72Z" fill="#111" />
          <ellipse cx="89" cy="86" rx="8" ry="10" fill="#F6E58D" />
          <ellipse cx="129" cy="86" rx="8" ry="10" fill="#F6E58D" />
          <circle cx="89" cy="86" r="3" fill="#111" />
          <circle cx="129" cy="86" r="3" fill="#111" />
          <path d="M108 102 Q112 108 116 102" fill="none" stroke="#F8B4B4" strokeWidth="3" strokeLinecap="round" />
          <path d="M155 46 C196 58, 198 98, 170 118" fill="none" stroke="#111" strokeWidth="8" strokeLinecap="round" />
          <ellipse cx="173" cy="119" rx="15" ry="9" fill="#F8FAFC" stroke="#111" strokeWidth="3" />
          <circle cx="184" cy="116" r="2" fill="#111" />
        </svg>
      ) : (
        <div className={`select-none font-serif font-bold leading-none text-[#C84B31]/15 whitespace-nowrap dark:text-[#E85C40]/25 ${isCombination ? "text-[5.5rem]" : "text-[9rem]"}`}>
          {item.character}
        </div>
      )}
    </div>
  );
}

export function KanaFlashcardModal({ item, onClose }: { item: KanaCharacter; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 dark:bg-black/70" role="dialog" aria-modal="true">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-auto rounded-3xl bg-white p-7 shadow-2xl dark:bg-[#1A1A1A]">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-[#2A2A2A] dark:hover:text-gray-200" aria-label="Close kana flashcard">
          <X size={20} />
        </button>

        <header className="text-center">
          <div className="font-serif text-7xl font-bold leading-none text-black dark:text-[#FAFAFA]">{item.character}</div>
          <div className="mt-3 flex items-center justify-center gap-3 text-lg text-gray-500 dark:text-[#A0A0A0]">
            <span>{item.romaji}</span>
            <button type="button" onClick={() => speak(item.character)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7C3AED] text-white transition hover:scale-110 hover:bg-[#6D28D9]" aria-label="Play pronunciation">
              <Play size={16} fill="currentColor" />
            </button>
          </div>
        </header>

        <div className="my-6 border-t border-gray-200 dark:border-white/10" />

        <div className="grid gap-6 md:grid-cols-2">
          <StrokePreview character={item.character} />
          <Illustration item={item} />
        </div>

        <div className="mt-7 rounded-2xl bg-gray-100 p-4 text-center text-gray-700 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]">
          {mnemonic(item)}
        </div>

        <div className="mt-7 border-t border-gray-200 pt-6 dark:border-white/10">
          <div className="grid grid-cols-2 text-center">
            <div>
              <div className="text-sm text-gray-500 dark:text-[#A0A0A0]">Accuracy</div>
              <div className="mt-1 text-3xl font-bold text-[#7C3AED]">
                {item.status === "mastered"
                  ? `${item.accuracy ?? 100}%`
                  : item.status === "reviewing"
                  ? `${item.accuracy ?? 75}%`
                  : item.accuracy != null
                  ? `${item.accuracy}%`
                  : "0%"}
              </div>
              <div className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                {item.status === "mastered"
                  ? `${item.correctAnswers ?? 5}/${item.totalAnswers ?? 5} total`
                  : item.status === "reviewing"
                  ? `${item.correctAnswers ?? 3}/${item.totalAnswers ?? 4} total`
                  : item.totalAnswers != null
                  ? `${item.correctAnswers ?? 0}/${item.totalAnswers} total`
                  : "0/0 total"}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-[#A0A0A0]">Streak</div>
              <div className="mt-1 text-3xl font-bold text-[#7C3AED]">
                {item.status === "mastered"
                  ? (item.streak ?? 5)
                  : item.status === "reviewing"
                  ? (item.streak ?? 2)
                  : (item.streak ?? 0)}
              </div>
              <div className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                Best:{" "}
                {item.status === "mastered"
                  ? (item.bestStreak ?? 10)
                  : item.status === "reviewing"
                  ? (item.bestStreak ?? 5)
                  : (item.bestStreak ?? 0)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Re-export for stroke replay button
export function StrokeReplayButton() {
  return (
    <button type="button" className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#7C3AED]">
      <RotateCw size={12} /> Replay
    </button>
  );
}
