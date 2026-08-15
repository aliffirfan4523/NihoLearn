"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  RotateCw,
  Sparkles,
  Puzzle,
  X,
  ChevronDown,
  ArrowRight
} from "lucide-react";
import {
  n5KanjiRequirementsList,
  radicalsTableList,
  type KanjiRequirementItem,
} from "@/lib/data/kanji-progress";

export function KanjiProgressGrid() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("N5");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showRadicalsModal, setShowRadicalsModal] = useState(false);
  const [selectedKanji, setSelectedKanji] = useState<KanjiRequirementItem | null>(null);

  const filteredKanji = n5KanjiRequirementsList.filter((k) => {
    if (selectedLevel !== "all" && k.level !== selectedLevel) return false;
    if (selectedStatus !== "all" && k.status !== selectedStatus) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchKanji = k.kanji.includes(q);
      const matchMeaning = k.meaning.some((m) => m.toLowerCase().includes(q));
      const matchOnyomi = k.onyomi.some((o) => o.toLowerCase().includes(q));
      const matchKunyomi = k.kunyomi.some((ku) => ku.toLowerCase().includes(q));
      return matchKanji || matchMeaning || matchOnyomi || matchKunyomi;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-5 dark:border-white/10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#FAFAFA]">
            JLPT Kanji Requirements
          </h1>
          <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
            Master essential JLPT Kanji, readings, meanings, stroke orders, and radicals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowRadicalsModal(true)}
            className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm font-bold text-[#1A1A1A] shadow-xs transition hover:border-[#C84B31] dark:border-white/15 dark:bg-[#1A1A1A] dark:text-[#FAFAFA]"
          >
            <Puzzle size={16} className="text-purple-600 dark:text-purple-400" />
            <span>Radicals Table</span>
          </button>

          <Link
            href="/practice/kanji"
            className="flex items-center gap-2 rounded-2xl bg-[#C84B31] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#b03e26] dark:bg-[#E85C40]"
          >
            <RotateCw size={16} />
            <span>Practice Kanji</span>
          </Link>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-xs dark:border-white/15 dark:bg-[#1A1A1A]">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search kanji, meaning, or reading..."
            className="w-full rounded-xl border border-black/10 bg-[#FAFAF8] pl-10 pr-4 py-2 text-sm text-[#1A1A1A] focus:border-[#C84B31] focus:outline-none dark:border-white/15 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]"
          />
        </div>

        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="rounded-xl border border-black/10 bg-[#FAFAF8] px-4 py-2 text-sm font-semibold text-[#1A1A1A] focus:outline-none dark:border-white/15 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]"
        >
          <option value="N5">N5 Level</option>
          <option value="N4">N4 Level</option>
          <option value="all">All Levels</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded-xl border border-black/10 bg-[#FAFAF8] px-4 py-2 text-sm font-semibold text-[#1A1A1A] focus:outline-none dark:border-white/15 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]"
        >
          <option value="all">All Status</option>
          <option value="unlearned">Not Started</option>
          <option value="learning">Learning</option>
          <option value="mastered">Mastered</option>
        </select>
      </div>

      {/* Kanji Cards Grid Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-[#C84B31] px-2.5 py-0.5 text-xs font-bold text-white dark:bg-[#E85C40]">
            N5 Kanji
          </span>
          <span className="text-xs font-semibold text-[#6B6B6B] dark:text-[#A0A0A0]">
            {filteredKanji.length} characters
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredKanji.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedKanji(item)}
              className="group relative flex flex-col items-center justify-center rounded-2xl border border-black/10 bg-white p-5 shadow-xs transition hover:-translate-y-1 hover:border-[#C84B31] hover:shadow-md dark:border-white/15 dark:bg-[#1A1A1A] dark:hover:border-[#E85C40]"
            >
              <div className="font-serif text-5xl font-bold leading-none text-[#1A1A1A] transition group-hover:scale-110 group-hover:text-[#C84B31] dark:text-[#FAFAFA] dark:group-hover:text-[#E85C40]">
                {item.kanji}
              </div>

              <div className="mt-4 flex items-center gap-1.5 text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
                <span>{item.masteryPercent}%</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Kanji Details Modal */}
      {selectedKanji && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => setSelectedKanji(null)}
          role="dialog"
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-black/10 bg-white p-7 shadow-2xl dark:border-white/15 dark:bg-[#1A1A1A] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedKanji(null)}
              className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
            >
              <X size={20} />
            </button>

            <div className="text-center">
              <div className="font-serif text-8xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                {selectedKanji.kanji}
              </div>
              <div className="mt-2 text-lg font-bold text-[#C84B31] dark:text-[#E85C40]">
                {selectedKanji.meaning.join(", ")}
              </div>
              <div className="mt-1 text-xs text-gray-400">{selectedKanji.strokes} strokes</div>
            </div>

            <div className="mt-6 space-y-3 rounded-2xl bg-[#FAFAF8] p-4 text-xs dark:bg-[#2A2A2A]">
              <div>
                <span className="font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Onyomi:</span>{" "}
                <span className="text-[#2D5F8A] dark:text-[#4A86B8]">{selectedKanji.onyomi.join("、") || "—"}</span>
              </div>
              <div>
                <span className="font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Kunyomi:</span>{" "}
                <span className="text-[#3D7D52] dark:text-[#4D9D6A]">{selectedKanji.kunyomi.join("、") || "—"}</span>
              </div>
              <div>
                <span className="font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Common Words:</span>{" "}
                <span className="text-gray-600 dark:text-gray-300">{selectedKanji.examples.join("、")}</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/practice/kanji"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#C84B31] py-3 text-sm font-bold text-white shadow-md hover:bg-[#b03e26] dark:bg-[#E85C40]"
              >
                <span>Practice this Kanji</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Radicals Table Modal */}
      {showRadicalsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => setShowRadicalsModal(false)}
          role="dialog"
        >
          <div
            className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-3xl border border-black/10 bg-white shadow-2xl dark:border-white/15 dark:bg-[#1A1A1A]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/10 p-5 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Puzzle size={20} className="text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                  Kanji Radicals Table (部首)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRadicalsModal(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {radicalsTableList.map((rad) => (
                  <div
                    key={rad.name}
                    className="flex items-center gap-4 rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 dark:border-white/10 dark:bg-[#2A2A2A]"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 font-serif text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {rad.radical}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#1A1A1A] dark:text-[#FAFAFA]">{rad.name}</div>
                      <div className="text-xs text-[#C84B31] dark:text-[#E85C40]">{rad.meaning} ({rad.strokes} strokes)</div>
                      <div className="mt-1 text-[11px] text-gray-400">
                        In: {rad.examples.join(", ")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
