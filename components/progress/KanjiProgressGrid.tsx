"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  RotateCw,
  Sparkles,
  Puzzle,
  X,
  Volume2,
  CheckCircle2,
  Clock,
  BookOpen,
} from "lucide-react";
import { radicalsTableList } from "@/lib/data/kanji-progress";
import { playJapaneseAudio } from "@/lib/audio";
import { JapaneseLoader } from "@/components/ui/JapaneseLoader";
import { KanjiDetailModal, type KanjiDetailData } from "@/components/kanji/KanjiDetailModal";
import type { ProgressStatus } from "@/types";

export interface DbKanjiItem {
  id: string;
  character: string;
  strokes: number;
  radicalNumber?: number | null;
  frequency?: number | null;
  jlpt: string;
  meaning: string;
  onyomi: string[];
  kunyomi: string[];
  examples: Array<{ word: string; reading: string; meaning: string }>;
  description?: string | null;
  status: ProgressStatus;
  notes?: string | null;
}

const statusBadgeStyles: Record<ProgressStatus, string> = {
  unlearned: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300",
  reviewing: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30",
  mastered: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30",
};

export function KanjiProgressGrid({ initialKanji = [] }: { initialKanji?: DbKanjiItem[] }) {
  const [kanjiList, setKanjiList] = useState<DbKanjiItem[]>(initialKanji);
  const [loading, setLoading] = useState(initialKanji.length === 0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("N5");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showRadicalsModal, setShowRadicalsModal] = useState(false);
  const [selectedKanji, setSelectedKanji] = useState<KanjiDetailData | null>(null);

  // High-speed client cache for instant 0ms switching
  const cacheRef = useRef<Record<string, DbKanjiItem[]>>({
    N5: initialKanji.length > 0 ? initialKanji : [],
  });

  const isFirstRender = useRef(true);

  const fetchLevelKanji = useCallback(async (level: string) => {
    // If cached in memory, load immediately in 0ms!
    if (cacheRef.current[level] && cacheRef.current[level].length > 0) {
      setKanjiList(cacheRef.current[level]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const url = level === "all" ? "/api/kanji" : `/api/kanji?level=${encodeURIComponent(level)}`;

    try {
      const res = await fetch(url);
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        cacheRef.current[level] = json.data;
        setKanjiList(json.data);
      }
    } catch (err) {
      console.error("Failed to load kanji from database:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Level switch effect
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (initialKanji.length > 0) {
        cacheRef.current["N5"] = initialKanji;
        // Background prefetch other levels during browser idle
        setTimeout(() => {
          ["N4", "N3", "N2", "N1"].forEach((lvl) => {
            fetch(`/api/kanji?level=${lvl}`)
              .then((r) => r.json())
              .then((j) => {
                if (j.data) cacheRef.current[lvl] = j.data;
              })
              .catch(() => {});
          });
        }, 1200);
        return;
      }
    }

    fetchLevelKanji(selectedLevel);
  }, [selectedLevel, initialKanji, fetchLevelKanji]);

  const handleStatusChange = (kanjiId: string, nextStatus: ProgressStatus) => {
    setKanjiList((prev) =>
      prev.map((k) => (k.id === kanjiId ? { ...k, status: nextStatus } : k))
    );

    // Update active modal state
    if (selectedKanji?.id === kanjiId) {
      setSelectedKanji((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }

    // Update in-memory cache
    if (cacheRef.current[selectedLevel]) {
      cacheRef.current[selectedLevel] = cacheRef.current[selectedLevel].map((k) =>
        k.id === kanjiId ? { ...k, status: nextStatus } : k
      );
    }

    // Save to database
    const targetKanji = kanjiList.find((k) => k.id === kanjiId);
    if (targetKanji) {
      fetch("/api/kanji", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kanjiId: targetKanji.character,
          level: targetKanji.jlpt,
          status: nextStatus,
        }),
      }).catch(() => {});
    }
  };

  const filteredKanji = kanjiList.filter((k) => {
    if (selectedStatus !== "all" && k.status !== selectedStatus) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchChar = k.character.includes(q);
      const matchMeaning = (k.meaning || "").toLowerCase().includes(q);
      const matchOnyomi = (k.onyomi || []).some((o) => o.toLowerCase().includes(q));
      const matchKunyomi = (k.kunyomi || []).some((ku) => ku.toLowerCase().includes(q));
      return matchChar || matchMeaning || matchOnyomi || matchKunyomi;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-5 dark:border-white/10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#FAFAFA]">
            JLPT Kanji Dictionary &amp; Progress
          </h1>
          <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
            Database-backed JLPT Kanji across levels N5 to N1 with interactive stroke orders, readings, meanings, and vocabulary compounds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowRadicalsModal(true)}
            className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm font-bold text-[#1A1A1A] shadow-xs transition hover:border-[#C84B31] dark:border-white/15 dark:bg-[#1A1A1A] dark:text-[#FAFAFA]"
          >
            <Puzzle size={16} className="text-purple-600 dark:text-purple-400" />
            <span>Radicals Reference</span>
          </button>

          <Link
            href="/practice/kanji"
            className="flex items-center gap-2 rounded-2xl bg-[#C84B31] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#b03e26] dark:bg-[#E85C40]"
          >
            <RotateCw size={16} />
            <span>Practice Kanji Quiz</span>
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
            placeholder="Search kanji (人), meaning (person), or reading (ひと)..."
            className="w-full rounded-xl border border-black/10 bg-[#FAFAF8] pl-10 pr-4 py-2 text-sm text-[#1A1A1A] focus:border-[#C84B31] focus:outline-none dark:border-white/15 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]"
          />
        </div>

        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="rounded-xl border border-black/10 bg-[#FAFAF8] px-4 py-2 text-sm font-semibold text-[#1A1A1A] focus:outline-none dark:border-white/15 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]"
        >
          <option value="N5">JLPT N5 (Beginner)</option>
          <option value="N4">JLPT N4 (Elementary)</option>
          <option value="N3">JLPT N3 (Intermediate)</option>
          <option value="N2">JLPT N2 (Pre-Advanced)</option>
          <option value="N1">JLPT N1 (Advanced)</option>
          <option value="all">All JLPT Levels (2,136 Kanji)</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded-xl border border-black/10 bg-[#FAFAF8] px-4 py-2 text-sm font-semibold text-[#1A1A1A] focus:outline-none dark:border-white/15 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]"
        >
          <option value="all">All Progress Status</option>
          <option value="unlearned">Not Started</option>
          <option value="reviewing">Learning</option>
          <option value="mastered">Mastered</option>
        </select>
      </div>

      {/* Kanji Cards Grid Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-[#C84B31] px-2.5 py-0.5 text-xs font-bold text-white dark:bg-[#E85C40]">
              {selectedLevel === "all" ? "All Levels" : `${selectedLevel} Kanji`}
            </span>
            <span className="text-xs font-semibold text-[#6B6B6B] dark:text-[#A0A0A0]">
              {loading ? "Loading..." : `${filteredKanji.length} characters`}
            </span>
          </div>
        </div>

        {loading ? (
          <JapaneseLoader message={`Preparing ${selectedLevel === "all" ? "all JLPT" : selectedLevel} Kanji records...`} />
        ) : filteredKanji.length === 0 ? (
          <div className="rounded-3xl border border-black/10 bg-white p-12 text-center text-sm text-[#6B6B6B] dark:border-white/15 dark:bg-[#1A1A1A] dark:text-[#A0A0A0]">
            No matching Kanji characters found.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredKanji.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedKanji(item)}
                className="group relative flex flex-col items-center justify-center rounded-2xl border border-black/10 bg-white p-5 shadow-xs transition hover:-translate-y-1 hover:border-[#C84B31] hover:shadow-md dark:border-white/15 dark:bg-[#1A1A1A] dark:hover:border-[#E85C40]"
              >
                {/* Strokes Count Badge */}
                <div className="absolute right-3 top-3 rounded-md bg-black/5 px-1.5 py-0.5 text-[10px] font-bold text-[#6B6B6B] dark:bg-white/10 dark:text-[#A0A0A0]">
                  {item.strokes}画
                </div>

                <div className="font-serif text-5xl font-bold leading-none text-[#1A1A1A] transition group-hover:scale-110 group-hover:text-[#C84B31] dark:text-[#FAFAFA] dark:group-hover:text-[#E85C40]">
                  {item.character}
                </div>

                <div className="mt-3 text-center">
                  <div className="text-xs font-bold text-[#1A1A1A] line-clamp-1 dark:text-[#FAFAFA]">
                    {item.meaning}
                  </div>
                  <div className="mt-0.5 text-[11px] text-[#6B6B6B] line-clamp-1 dark:text-[#A0A0A0]">
                    {(item.kunyomi && item.kunyomi[0]) || (item.onyomi && item.onyomi[0]) || "—"}
                  </div>
                </div>

                <div className="mt-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                      statusBadgeStyles[item.status]
                    }`}
                  >
                    {item.status === "reviewing" ? "Learning" : item.status === "unlearned" ? "Not started" : item.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Kanji Modal with Stroke Orders, Readings, Radicals & Stats */}
      {selectedKanji && (
        <KanjiDetailModal
          kanji={selectedKanji}
          onClose={() => setSelectedKanji(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Radicals Reference Table Modal */}
      {showRadicalsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => setShowRadicalsModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-black/10 bg-white p-7 shadow-2xl dark:border-white/15 dark:bg-[#1A1A1A]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/10 pb-4 dark:border-white/10">
              <div className="flex items-center gap-2 font-bold text-lg text-[#1A1A1A] dark:text-[#FAFAFA]">
                <Puzzle size={20} className="text-purple-600 dark:text-purple-400" />
                <span>Kangxi Radicals Reference Table</span>
              </div>
              <button
                type="button"
                onClick={() => setShowRadicalsModal(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {radicalsTableList.map((rad) => (
                <div
                  key={rad.radicalNumber}
                  className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-3.5 dark:border-white/5 dark:bg-[#2A2A2A]"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-serif text-2xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                      {rad.radical}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">
                      #{rad.radicalNumber} · {rad.strokes}s
                    </span>
                  </div>
                  <div className="mt-1 text-xs font-semibold text-[#1A1A1A] dark:text-[#FAFAFA]">
                    {rad.name} ({rad.meaning})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
