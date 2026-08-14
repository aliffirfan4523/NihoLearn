"use client";

import { X, Play, RotateCw } from "lucide-react";
import type { KanaCharacter } from "@/types";

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

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

// Stroke order data: each kana has ordered SVG paths (viewBox 0 0 200 200)
// Colors cycle through red, blue, green, orange for each stroke
const strokeColors = ["#EF4444", "#3B82F6", "#22C55E", "#F59E0B", "#8B5CF6", "#EC4899"];

const strokeData: Record<string, string[]> = {
  あ: ["M60 40 Q100 30 140 45", "M50 80 L150 75", "M65 120 Q100 95 150 115 L125 120 Q100 130 90 110 L85 150 Q90 165 110 165"],
  い: ["M70 30 L65 165", "M110 30 L105 165"],
  う: ["M50 40 Q100 35 150 45", "M60 80 L130 140 Q140 150 155 145"],
  え: ["M55 35 L145 40", "M70 55 L100 150 Q110 165 125 160", "M150 60 Q140 100 100 115"],
  お: ["M50 40 Q100 35 150 45", "M90 35 Q95 65 85 155", "M50 120 L150 125", "M60 155 Q100 175 145 160"],
  か: ["M55 35 Q100 30 145 45", "M45 115 L140 110", "M60 80 Q100 95 140 75", "M120 115 L130 155 Q135 165 145 160"],
  き: ["M45 30 L155 35", "M50 80 L150 80", "M75 75 L75 165", "M115 75 Q120 120 125 165", "M60 110 L140 110"],
  く: ["M50 50 L140 55 L65 150"],
  け: ["M40 35 Q100 35 160 50", "M60 85 L140 145 Q145 155 155 150"],
  こ: ["M45 60 L155 60 L155 140 L45 140 Z"],
  さ: ["M50 35 L150 40", "M60 35 Q60 85 50 150"],
  し: ["M90 30 L90 30 Q75 90 75 95 Q75 160 140 155"],
  す: ["M100 35 Q100 65 55 70 Q45 80 70 100 L130 140 Q140 150 130 160"],
  せ: ["M50 35 L150 40 L150 60", "M70 60 Q100 120 70 160 Q80 175 110 165"],
  そ: ["M40 50 L160 50 L100 90 L160 130 L60 160"],
  た: ["M50 35 L150 45", "M60 80 Q100 90 140 80", "M55 125 L145 130", "M90 120 Q90 150 120 150 Q140 150 140 135"],
  ち: ["M50 40 L50 40 L55 50 L150 45", "M75 80 L75 165 Q80 175 120 170"],
  つ: ["M70 40 Q100 35 90 90 Q40 100 60 150 Q100 175 150 155"],
  て: ["M45 40 L155 45 L150 65", "M70 60 L130 145 Q140 155 150 150"],
  と: ["M50 35 Q100 35 130 60 L130 130 Q130 160 100 160 Q60 160 65 140"],
  な: ["M50 35 L150 45", "M60 30 Q60 75 60 115", "M55 115 L150 115", "M70 155 Q115 150 140 145"],
  に: ["M50 35 L150 45", "M60 40 Q60 100 60 165", "M120 40 Q120 100 120 165", "M60 110 L120 110"],
  ぬ: ["M50 35 L150 45", "M50 80 Q100 80 100 110 L100 150 Q98 170 75 165", "M140 80 Q120 95 120 160"],
  ね: ["M50 35 L150 35", "M50 100 L150 100", "M100 35 L100 165"],
  の: ["M70 40 Q140 40 90 100 Q50 140 100 160 Q150 160 130 130"],
  は: ["M50 35 L150 45", "M55 80 Q100 75 145 85", "M55 110 L55 165", "M105 95 Q105 130 145 165", "M105 130 L145 130 L145 165"],
  ひ: ["M40 50 Q100 50 100 90 L100 150 Q100 170 60 170"],
  ふ: ["M50 35 L150 45", "M55 80 L145 80", "M70 110 Q110 110 100 165", "M120 110 Q130 125 120 165"],
  へ: ["M40 60 L100 50 L160 150"],
  ほ: ["M50 35 L150 45", "M55 80 L145 80", "M55 110 Q100 105 55 165", "M105 95 Q110 130 145 165"],
  ま: ["M50 35 L150 45", "M55 30 L55 100", "M55 100 L55 160", "M100 60 L100 170", "M60 160 L140 160"],
  み: ["M50 35 Q100 35 95 70 Q90 100 90 100 Q90 140 130 160"],
  む: ["M50 50 L150 50", "M60 100 L140 100 L140 165 Q100 170 80 160"],
  め: ["M50 35 L150 165"],
  も: ["M50 35 L150 45", "M60 100 Q100 95 140 100", "M80 130 Q100 125 140 130 L140 160 Q100 165 80 160"],
  や: ["M40 40 L160 45 L100 80 L100 170"],
  ゆ: ["M50 60 L150 60 L140 100 L140 140 Q140 160 100 160 Q90 160 85 150"],
  よ: ["M50 40 Q100 35 150 45", "M90 40 L90 130 Q90 160 60 160"],
  ら: ["M50 35 Q150 35 100 70 Q50 90 50 120 Q50 160 100 160 Q140 160 140 140"],
  り: ["M60 40 Q60 80 50 165", "M120 40 L120 165 L100 140"],
  る: ["M50 35 Q150 35 100 70 L100 150 Q100 170 60 170 Q55 160 60 140"],
  れ: ["M50 35 L150 45 L140 65 L60 140 L140 140 L120 165 Q100 155 80 170"],
  ろ: ["M50 35 L150 45", "M60 80 Q100 80 100 100 L100 160 Q100 175 70 170"],
  わ: ["M50 50 L150 50 L100 85 L100 165"],
  を: ["M40 60 Q100 40 160 60 L100 90 L140 120 L100 150 Q60 150 60 130"],
  ん: ["M60 40 L60 140 Q60 160 100 160 L140 130"],
};

function StrokePreview({ character }: { character: string }) {
  const strokes = strokeData[character];
  const hasStrokes = strokes && strokes.length > 0;

  if (!hasStrokes) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-gray-50 p-3 text-center">
        <div className="font-serif text-[8rem] font-bold leading-none text-[#C84B31]/10">{character}</div>
        <span className="text-sm italic text-gray-400">Stroke data not available for this character</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl p-3 text-center">
      <svg viewBox="0 0 200 200" className="h-44 w-44" aria-label={`${character} stroke order`}>
        <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="fill-transparent stroke-gray-200 text-[128px] font-bold" style={{ fontFamily: "var(--font-noto-serif-jp)" }} strokeWidth="3">
          {character}
        </text>
        {strokes.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={strokeColors[i % strokeColors.length]}
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-draw"
            style={{ animationDelay: `${i * 700}ms` }}
          />
        ))}
      </svg>
      <span className="text-sm italic text-gray-400">Stroke {strokes.length} strokes · tracing in order</span>
    </div>
  );
}

function Illustration({ item }: { item: KanaCharacter }) {
  const isKa = item.romaji === "ka";

  return (
    <div className="relative flex h-56 items-center justify-center rounded-2xl border border-gray-100 bg-white p-4">
      <div className="absolute left-5 top-4 font-serif text-5xl font-bold text-black">{item.character}</div>
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
        <div className="font-serif text-[9rem] font-bold leading-none text-[#C84B31]/15">{item.character}</div>
      )}
    </div>
  );
}

export function KanaFlashcardModal({ item, onClose }: { item: KanaCharacter; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-auto rounded-3xl bg-white p-7 shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Close kana flashcard">
          <X size={20} />
        </button>

        <header className="text-center">
          <div className="font-serif text-7xl font-bold leading-none text-black">{item.character}</div>
          <div className="mt-3 flex items-center justify-center gap-3 text-lg text-gray-500">
            <span>{item.romaji}</span>
            <button type="button" onClick={() => speak(item.character)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7C3AED] text-white transition hover:scale-110 hover:bg-[#6D28D9]" aria-label="Play pronunciation">
              <Play size={16} fill="currentColor" />
            </button>
          </div>
        </header>

        <div className="my-6 border-t border-gray-200" />

        <div className="grid gap-6 md:grid-cols-2">
          <StrokePreview character={item.character} />
          <Illustration item={item} />
        </div>

        <div className="mt-7 rounded-2xl bg-gray-100 p-4 text-center text-gray-700">
          {mnemonic(item)}
        </div>

        <div className="mt-7 border-t border-gray-200 pt-6">
          <div className="grid grid-cols-2 text-center">
            <div>
              <div className="text-sm text-gray-500">Accuracy</div>
              <div className="mt-1 text-3xl font-bold text-[#7C3AED]">100%</div>
              <div className="mt-1 text-sm text-gray-400">9/9 total</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Streak</div>
              <div className="mt-1 text-3xl font-bold text-[#7C3AED]">9</div>
              <div className="mt-1 text-sm text-gray-400">Best: 25</div>
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
