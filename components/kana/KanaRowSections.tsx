"use client";

import { useState } from "react";
import { KanaFlashcardModal } from "@/components/kana/KanaFlashcardModal";
import type { KanaCharacter } from "@/types";

type KanaSection = {
  title: string;
  label: string;
  rows: string[];
};

const sections: KanaSection[] = [
  { title: "Basic Hiragana", label: "10 rows", rows: ["a", "ka", "sa", "ta", "na", "ha", "ma", "ya", "ra", "wa"] },
  { title: "Dakuten and Handakuten", label: "5 rows", rows: ["ga", "za", "da", "ba", "pa"] },
  { title: "Combination", label: "11 rows", rows: ["kya", "sha", "cha", "nya", "hya", "mya", "rya", "gya", "ja", "bya", "pya"] },
];

const katakanaSections: KanaSection[] = sections.map((section) => ({
  ...section,
  title: section.title.replace("Hiragana", "Katakana"),
}));

function sectionList(type: "hiragana" | "katakana") {
  return type === "hiragana" ? sections : katakanaSections;
}

function rowPercent(items: KanaCharacter[]) {
  if (items.length === 0) return 0;
  return Math.round((items.filter((item) => item.status === "mastered").length / items.length) * 100);
}

function avgPercent(kana: KanaCharacter[]) {
  if (kana.length === 0) return 0;
  return Math.round((kana.filter((item) => item.status === "mastered").length / kana.length) * 100);
}

function KanaRowCard({ row, items, onSelect }: { row: string; items: KanaCharacter[]; onSelect: (item: KanaCharacter) => void }) {
  const percent = rowPercent(items);
  const mastered = percent === 100;

  // Sort items by standard Japanese vowel order (a -> i -> u -> e -> o)
  const sortedItems = [...items].sort((a, b) => {
    const orderMap: Record<string, number> = { a: 1, i: 2, u: 3, e: 4, o: 5 };
    const lastA = a.romaji.slice(-1);
    const lastB = b.romaji.slice(-1);
    return (orderMap[lastA] ?? 99) - (orderMap[lastB] ?? 99);
  });

  return (
    <article className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#C84B31] dark:border-white/20 dark:bg-[#1A1A1A] dark:hover:border-[#E85C40]">
      <div className="flex items-center gap-3">
        <h3 className="mr-auto text-sm font-semibold text-[#1A1A1A] dark:text-[#FAFAFA]">{row} row</h3>
        <div className="h-2 w-24 overflow-hidden rounded-full bg-[#F0F0F0] dark:bg-[#2A2A2A]">
          <div className="h-full rounded-full bg-[#C84B31] dark:bg-[#E85C40]" style={{ width: `${percent}%` }} />
        </div>
        <span className="w-10 text-right text-xs font-semibold text-[#6B6B6B] dark:text-[#A0A0A0]">{percent}%</span>
      </div>

      <div className="mt-7 grid grid-cols-5 gap-2">
        {sortedItems.map((item) => {
          const isCombination = item.character.length > 1;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className="flex flex-col items-center justify-center rounded-xl p-2 text-center transition hover:bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#C84B31]/40 dark:hover:bg-[#2A2A2A]"
            >
              <div
                className={`flex items-center justify-center font-serif font-bold leading-none whitespace-nowrap ${
                  isCombination ? "text-2xl tracking-tighter" : "text-4xl"
                } ${mastered ? "text-[#3D7D52] dark:text-[#4D9D6A]" : "text-[#2D5F8A] dark:text-[#4A86B8]"}`}
              >
                {item.character}
              </div>
              <div className="mt-3 font-mono text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">{item.romaji}</div>
            </button>
          );
        })}
      </div>
    </article>
  );
}

export function KanaRowSections({ kana, type }: { kana: KanaCharacter[]; type: "hiragana" | "katakana" }) {
  const average = avgPercent(kana);
  const [selectedKana, setSelectedKana] = useState<KanaCharacter | null>(null);

  return (
    <div className="space-y-10">
      <header className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/20 dark:bg-[#1A1A1A]">
        <div className="pointer-events-none absolute -right-5 -top-12 font-serif text-[12rem] leading-none text-[#C84B31]/5 dark:text-[#C84B31]/10">
          {type === "hiragana" ? "あ" : "ア"}
        </div>
        <div className="relative">
          <h2 className="text-4xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#FAFAFA]">{type === "hiragana" ? "Hiragana" : "Katakana"}</h2>
          <p className="mt-2 text-[#6B6B6B] dark:text-[#A0A0A0]">Average mastery: {average}%</p>
        </div>
      </header>

      {sectionList(type).map((section) => (
        <section key={section.title}>
          <div className="mb-5 flex items-center gap-3">
            <h3 className="text-xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">{section.title}</h3>
            <span className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">{section.label}</span>
            <span className="ml-auto text-[#6B6B6B] dark:text-[#A0A0A0]">⌄</span>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {section.rows.map((row) => {
              const items = kana.filter((item) => item.row === row);
              return <KanaRowCard key={row} row={row} items={items} onSelect={setSelectedKana} />;
            })}
          </div>
        </section>
      ))}

      {selectedKana ? <KanaFlashcardModal item={selectedKana} onClose={() => setSelectedKana(null)} /> : null}
    </div>
  );
}
