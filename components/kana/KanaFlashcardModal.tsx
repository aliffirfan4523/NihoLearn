"use client";

import { X, Play, RotateCw, Volume2 } from "lucide-react";
import type { KanaCharacter } from "@/types";
import { getStrokes, strokeColors } from "@/components/kana/strokeData";
import { getKanaExample } from "@/lib/data/kana-mnemonics";
import { playJapaneseAudio } from "@/lib/audio";

function speak(text: string) {
  playJapaneseAudio(text);
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
        <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-black/5 bg-[#F4F4F0] p-4 text-center dark:border-white/10 dark:bg-[#1E232B]">
          <div className="font-serif text-6xl font-bold leading-none text-[#C84B31]/15 dark:text-[#E85C40]/25">
            {character}
          </div>
          <span className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
            Combination character
          </span>
        </div>
      );
    }

    return (
      <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-black/5 bg-[#F4F4F0] p-4 text-center dark:border-white/10 dark:bg-[#1E232B]">
        <svg viewBox="0 0 218 109" className="h-36 w-60" aria-label={`${character} stroke order`}>
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
        <span className="mt-2 text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
          {totalStrokesCount} strokes ({s1.length} + {s2.length}) · drawn in order
        </span>
      </div>
    );
  }

  const strokes = getStrokes({ character, romaji: "" });
  const hasStrokes = strokes && strokes.length > 0;

  if (!hasStrokes) {
    return (
      <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-black/5 bg-[#F4F4F0] p-4 text-center dark:border-white/10 dark:bg-[#1E232B]">
        <div className="font-serif text-7xl font-bold leading-none text-[#C84B31]/15 dark:text-[#E85C40]/25">
          {character}
        </div>
        <span className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
          Stroke animation
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-black/5 bg-[#F4F4F0] p-4 text-center dark:border-white/10 dark:bg-[#1E232B]">
      <svg viewBox="0 0 109 109" className="h-36 w-36" aria-label={`${character} stroke order`}>
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
      <span className="mt-2 text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
        {strokes.length} stroke{strokes.length > 1 ? "s" : ""} · drawn in order
      </span>
    </div>
  );
}

function ExampleWordCard({ item }: { item: KanaCharacter }) {
  const example = getKanaExample(item.character, item.romaji);

  return (
    <div className="relative flex h-56 flex-col justify-between overflow-hidden rounded-2xl border border-black/10 bg-white p-5 shadow-xs dark:border-white/15 dark:bg-[#161B22]">
      {/* Top Header Tag */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#2D5F8A]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#2D5F8A] dark:bg-[#60A5FA]/15 dark:text-[#60A5FA]">
            語彙例 · Example Word
          </span>
        </div>
        <button
          type="button"
          onClick={() => speak(example.word)}
          className="flex items-center gap-1 rounded-xl bg-black/5 px-2.5 py-1 text-xs font-semibold text-[#1A1A1A] hover:bg-[#C84B31] hover:text-white transition dark:bg-white/10 dark:text-[#F0F4F8] dark:hover:bg-[#E85C40]"
          aria-label={`Play audio for ${example.word}`}
        >
          <Volume2 size={13} />
          <span>Audio</span>
        </button>
      </div>

      {/* Main Vocabulary Word Showcase */}
      <div className="flex items-center gap-4 my-auto">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#F4F4F0] text-3xl shadow-xs ring-1 ring-black/10 dark:bg-[#1E232B] dark:ring-white/10">
          {example.emoji}
        </div>

        <div className="space-y-0.5 min-w-0">
          <div className="flex items-baseline gap-2">
            <h3 className="font-serif text-2xl font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
              {example.word}
            </h3>
            {example.kanji && example.kanji !== example.word && (
              <span className="font-serif text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
                ({example.kanji})
              </span>
            )}
          </div>

          <div className="text-xs font-semibold text-[#2D5F8A] dark:text-[#60A5FA]">
            {example.wordRomaji}
          </div>

          <div className="text-xs font-medium text-[#1A1A1A] dark:text-[#F0F4F8]">
            {example.meaning}
          </div>
        </div>
      </div>

      {/* Secondary Example Word footer if available */}
      {example.secondaryWord ? (
        <div className="flex items-center justify-between border-t border-black/5 pt-2 text-[11px] text-[#6B6B6B] dark:border-white/10 dark:text-[#A0A0A0]">
          <span>Also in:</span>
          <button
            type="button"
            onClick={() => speak(example.secondaryWord!.word)}
            className="flex items-center gap-1 font-bold text-[#1A1A1A] hover:text-[#C84B31] dark:text-[#F0F4F8] dark:hover:text-[#E85C40]"
          >
            <span>{example.secondaryWord.emoji}</span>
            <span className="font-serif">{example.secondaryWord.word}</span>
            <span className="text-[10px] font-normal text-[#6B6B6B] dark:text-[#A0A0A0]">({example.secondaryWord.meaning})</span>
          </button>
        </div>
      ) : (
        <div className="text-[10px] text-[#6B6B6B] dark:text-[#A0A0A0] italic">
          High-frequency JLPT vocabulary
        </div>
      )}
    </div>
  );
}

export function KanaFlashcardModal({ item, onClose }: { item: KanaCharacter; onClose: () => void }) {
  const example = getKanaExample(item.character, item.romaji);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-h-[92vh] w-full max-w-2xl overflow-auto rounded-2xl border border-black/10 bg-white p-6 md:p-8 shadow-2xl dark:border-white/15 dark:bg-[#161B22] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-[#6B6B6B] hover:bg-black/5 hover:text-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:bg-white/10 dark:hover:text-[#F0F4F8]"
          aria-label="Close kana flashcard"
        >
          <X size={20} />
        </button>

        {/* Character Title & Sound Play Button */}
        <header className="text-center">
          <div className="font-serif text-7xl md:text-8xl font-bold leading-none text-[#1A1A1A] dark:text-[#F0F4F8]">
            {item.character}
          </div>
          <div className="mt-3 flex items-center justify-center gap-3 text-lg font-bold text-[#6B6B6B] dark:text-[#A0A0A0]">
            <span>{item.romaji}</span>
            <button
              type="button"
              onClick={() => speak(item.character)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C84B31] text-white shadow-xs transition hover:opacity-90 dark:bg-[#E85C40]"
              aria-label={`Play pronunciation for ${item.character}`}
            >
              <Play size={16} fill="currentColor" />
            </button>
          </div>
        </header>

        <div className="my-6 border-t border-black/10 dark:border-white/10" />

        {/* Left: Stroke Order / Right: Example Word Card */}
        <div className="grid gap-4 sm:grid-cols-2">
          <StrokePreview character={item.character} />
          <ExampleWordCard item={item} />
        </div>

        {/* Mnemonic Memory Hook Banner */}
        <div className="mt-5 rounded-2xl border border-black/5 bg-[#F4F4F0] p-4 text-xs leading-relaxed text-[#1A1A1A] dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]">
          <div className="flex items-start gap-2.5">
            <span className="text-base leading-none">💡</span>
            <div>
              <strong className="text-[#2D5F8A] dark:text-[#60A5FA]">Memory Mnemonic:</strong>{" "}
              <span>{example.mnemonic}</span>
            </div>
          </div>
        </div>

        {/* Progress & Accuracy Stats */}
        <div className="mt-6 border-t border-black/10 pt-5 dark:border-white/10">
          <div className="grid grid-cols-2 text-center">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
                Accuracy
              </div>
              <div className="mt-1 text-2xl md:text-3xl font-bold text-[#C84B31] dark:text-[#E85C40]">
                {item.status === "mastered"
                  ? `${item.accuracy ?? 100}%`
                  : item.status === "reviewing"
                  ? `${item.accuracy ?? 75}%`
                  : item.accuracy != null
                  ? `${item.accuracy}%`
                  : "0%"}
              </div>
              <div className="mt-1 text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
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
              <div className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
                Streak
              </div>
              <div className="mt-1 text-2xl md:text-3xl font-bold text-[#C84B31] dark:text-[#E85C40]">
                {item.status === "mastered"
                  ? (item.streak ?? 5)
                  : item.status === "reviewing"
                  ? (item.streak ?? 2)
                  : (item.streak ?? 0)}
              </div>
              <div className="mt-1 text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
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

export function StrokeReplayButton() {
  return (
    <button
      type="button"
      className="flex items-center gap-1 text-xs text-[#6B6B6B] hover:text-[#C84B31] dark:text-[#A0A0A0] dark:hover:text-[#E85C40]"
    >
      <RotateCw size={12} /> Replay
    </button>
  );
}
