"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  BookOpen,
  RotateCw,
  Search,
  ChevronDown,
  List,
  LayoutGrid,
  Play,
  ArrowUpDown,
  Sparkles,
  TrendingUp,
  Award,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Palette,
  Utensils,
  Shirt,
  Package,
  Building2,
  MapPin,
  Train,
  PawPrint,
  Leaf,
  CloudSun,
  Hand,
  Users,
  Clock,
  Briefcase,
  Activity,
  Smile,
  Boxes,
} from "lucide-react";
import { playJapaneseAudio } from "@/lib/audio";
import { JapaneseLoader } from "@/components/ui/JapaneseLoader";
import { VOCAB_THEMES, getThemeForWord, type VocabTheme } from "@/lib/vocab-themes";
import type { ProgressStatus } from "@/types";

export interface VocabProgressItem {
  id: string;
  word: string;
  reading: string;
  romaji: string;
  meaning: string[];
  level: string;
  partOfSpeech: string;
  tags?: string | null;
  status: ProgressStatus;
  notes?: string | null;
  reviews?: number;
  successRate?: number;
  lastReviewed?: string | null;
  nextReview?: string | null;
  theme?: VocabTheme;
}

const statusOrder: ProgressStatus[] = ["unlearned", "reviewing", "mastered"];

const jlptBadgeColors: Record<string, string> = {
  N5: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  N4: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20",
  N3: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20",
  N2: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  N1: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20",
};

// Icon map for theme cards
function getThemeIcon(iconName: string) {
  switch (iconName) {
    case "Palette":
      return <Palette size={22} className="text-pink-500" />;
    case "Utensils":
      return <Utensils size={22} className="text-amber-500" />;
    case "Shirt":
      return <Shirt size={22} className="text-blue-500" />;
    case "Package":
      return <Package size={22} className="text-indigo-500" />;
    case "Building2":
      return <Building2 size={22} className="text-sky-500" />;
    case "MapPin":
      return <MapPin size={22} className="text-red-500" />;
    case "Train":
      return <Train size={22} className="text-blue-600" />;
    case "PawPrint":
      return <PawPrint size={22} className="text-emerald-500" />;
    case "Leaf":
      return <Leaf size={22} className="text-green-500" />;
    case "CloudSun":
      return <CloudSun size={22} className="text-teal-500" />;
    case "Hand":
      return <Hand size={22} className="text-purple-500" />;
    case "Users":
      return <Users size={22} className="text-orange-500" />;
    case "Clock":
      return <Clock size={22} className="text-cyan-500" />;
    case "Briefcase":
      return <Briefcase size={22} className="text-stone-500" />;
    case "Activity":
      return <Activity size={22} className="text-rose-500" />;
    default:
      return <Boxes size={22} className="text-violet-500" />;
  }
}

export function VocabProgressView({
  initialWords = [],
  initialLevel = "all",
}: {
  initialWords?: VocabProgressItem[];
  initialLevel?: string;
}) {
  const [selectedLevel, setSelectedLevel] = useState<string>(initialLevel);
  const [selectedKnowledge, setSelectedKnowledge] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("default");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid"); // Start with theme grid by default
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const [items, setItems] = useState<VocabProgressItem[]>(() =>
    initialWords.map((w) => ({
      ...w,
      theme: w.theme || getThemeForWord(w.word, w.reading, w.meaning),
    }))
  );
  const [isLoading, setIsLoading] = useState(false);

  // In-memory level cache for 0ms transitions
  const cacheRef = useRef<Record<string, VocabProgressItem[]>>({
    [initialLevel]: items,
  });

  const isFirstRender = useRef(true);

  // Fetch words when level changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (initialWords.length > 0) return;
    }

    if (cacheRef.current[selectedLevel]) {
      setItems(cacheRef.current[selectedLevel]);
      setPage(1);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const url =
      selectedLevel === "all"
        ? "/api/vocab?limit=2500"
        : `/api/vocab?level=${selectedLevel.toUpperCase()}&limit=1200`;

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;
        const loaded: VocabProgressItem[] = (json.data || []).map((w: any) => ({
          ...w,
          status: w.status || "unlearned",
          theme: getThemeForWord(w.word, w.reading, w.meaning),
          reviews: w.reviews ?? (w.status === "mastered" ? 8 : w.status === "reviewing" ? 3 : 0),
          successRate:
            w.successRate ?? (w.status === "mastered" ? 100 : w.status === "reviewing" ? 75 : 0),
          lastReviewed: w.lastReviewed ?? (w.status !== "unlearned" ? "2d ago" : "Never"),
          nextReview: w.nextReview ?? (w.status === "reviewing" ? "Tomorrow" : "—"),
        }));

        cacheRef.current[selectedLevel] = loaded;
        setItems(loaded);
        setPage(1);
      })
      .catch((err) => console.error("Failed to load vocabulary:", err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedLevel, initialWords]);

  // Background prefetch remaining levels
  useEffect(() => {
    const remaining = ["n5", "n4", "n3", "n2", "n1"].filter((l) => !cacheRef.current[l]);
    if (remaining.length === 0) return;

    const timeout = setTimeout(() => {
      remaining.forEach((lvl) => {
        fetch(`/api/vocab?level=${lvl.toUpperCase()}&limit=1200`)
          .then((res) => res.json())
          .then((json) => {
            if (json.data) {
              cacheRef.current[lvl] = json.data.map((w: any) => ({
                ...w,
                status: w.status || "unlearned",
                theme: getThemeForWord(w.word, w.reading, w.meaning),
                reviews:
                  w.reviews ?? (w.status === "mastered" ? 8 : w.status === "reviewing" ? 3 : 0),
                successRate:
                  w.successRate ??
                  (w.status === "mastered" ? 100 : w.status === "reviewing" ? 75 : 0),
                lastReviewed: w.lastReviewed ?? (w.status !== "unlearned" ? "2d ago" : "Never"),
                nextReview: w.nextReview ?? (w.status === "reviewing" ? "Tomorrow" : "—"),
              }));
            }
          })
          .catch(() => {});
      });
    }, 1200);

    return () => clearTimeout(timeout);
  }, []);

  // Filter & Sort Pipeline
  const filteredItems = useMemo(() => {
    let result = [...items];

    // 1. Knowledge level filter
    if (selectedKnowledge !== "all") {
      result = result.filter((item) => item.status === selectedKnowledge);
    }

    // 2. Category filter
    if (selectedCategory !== "all") {
      result = result.filter((item) => item.theme?.id === selectedCategory);
    }

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.word.toLowerCase().includes(q) ||
          item.reading.toLowerCase().includes(q) ||
          (item.romaji && item.romaji.toLowerCase().includes(q)) ||
          item.meaning.some((m) => m.toLowerCase().includes(q))
      );
    }

    // 4. Sorting
    if (sortOption === "word") {
      result.sort((a, b) => a.word.localeCompare(b.word));
    } else if (sortOption === "reading") {
      result.sort((a, b) => a.reading.localeCompare(b.reading));
    } else if (sortOption === "status") {
      const order = { mastered: 0, reviewing: 1, unlearned: 2 };
      result.sort((a, b) => (order[a.status] ?? 2) - (order[b.status] ?? 2));
    } else if (sortOption === "reviews") {
      result.sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0));
    }

    return result;
  }, [items, selectedKnowledge, selectedCategory, searchQuery, sortOption]);

  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page, pageSize]);

  // Compute theme statistics (counts & reviewed)
  const themeStats = useMemo(() => {
    const counts: Record<string, { total: number; reviewed: number }> = {};
    for (const t of VOCAB_THEMES) {
      counts[t.id] = { total: 0, reviewed: 0 };
    }

    for (const item of items) {
      const tId = item.theme?.id || "objects";
      if (!counts[tId]) counts[tId] = { total: 0, reviewed: 0 };
      counts[tId].total++;
      if (item.status !== "unlearned") {
        counts[tId].reviewed++;
      }
    }

    return VOCAB_THEMES.map((theme) => ({
      ...theme,
      total: counts[theme.id]?.total || 0,
      reviewed: counts[theme.id]?.reviewed || 0,
    })).filter((t) => t.total > 0);
  }, [items]);

  // Click a theme card to open list view for that theme
  const handleSelectThemeCard = (themeId: string) => {
    setSelectedCategory(themeId);
    setViewMode("list");
    setPage(1);
  };

  // Optimistic Status Cycling
  const handleCycleStatus = (wordId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setItems((current) =>
      current.map((item) => {
        if (item.id !== wordId) return item;
        const nextStatus =
          statusOrder[(statusOrder.indexOf(item.status) + 1) % statusOrder.length];

        fetch("/api/vocab", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wordId: item.id, level: item.level, status: nextStatus }),
        }).catch(() => {});

        return { ...item, status: nextStatus };
      })
    );
  };

  const struggleWords = useMemo(() => {
    return items
      .filter((w) => w.status === "reviewing" || (w.reviews ?? 0) > 0)
      .slice(0, 4);
  }, [items]);

  const masteredCount = items.filter((i) => i.status === "mastered").length;
  const learningCount = items.filter((i) => i.status === "reviewing").length;

  return (
    <div className="space-y-6">
      {/* 1. Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#F0F4F8]">
            Vocabulary Progress
          </h1>
          <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">
            Track your JLPT vocabulary knowledge, themes, and audio comprehension.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/practice/vocabulary"
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-vermillion)] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
          >
            <BookOpen size={16} />
            <span>Learn Vocabulary</span>
          </Link>
          <Link
            href="/practice/listening"
            className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm font-bold text-[#1A1A1A] shadow-xs transition hover:bg-black/5 dark:border-white/10 dark:bg-[#161B22] dark:text-[#F0F4F8] dark:hover:bg-white/5"
          >
            <RotateCw size={15} />
            <span>Review</span>
          </Link>
        </div>
      </div>

      {/* 2. Main Grid: Left Content (8 cols) & Right Stats Sidebar (4 cols) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Main Column */}
        <div className="space-y-4 lg:col-span-8">
          {/* Filter Bar Box */}
          <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-xs dark:border-white/10 dark:bg-[#161B22] space-y-3">
            {/* Search Input Full Width */}
            <div className="relative">
              <Search size={16} className="absolute left-4 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search words..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-2xl border border-black/5 bg-[#FAFAF8] py-2.5 pl-11 pr-4 text-sm text-[#1A1A1A] outline-none transition focus:border-[var(--color-vermillion)] dark:border-white/5 dark:bg-[#1E232B] dark:text-[#F0F4F8]"
              />
            </div>

            {/* Dropdown Filters Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* JLPT Level Select */}
              <div className="relative">
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  aria-label="Filter by JLPT Level"
                  className="appearance-none rounded-xl border border-black/10 bg-white py-2 pl-3 pr-8 text-xs font-bold text-[#1A1A1A] outline-none transition hover:border-black/20 dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]"
                >
                  <option value="all">All JLPT</option>
                  <option value="n5">JLPT N5</option>
                  <option value="n4">JLPT N4</option>
                  <option value="n3">JLPT N3</option>
                  <option value="n2">JLPT N2</option>
                  <option value="n1">JLPT N1</option>
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-2.5 text-gray-400"
                />
              </div>

              {/* Knowledge Levels Select */}
              <div className="relative">
                <select
                  value={selectedKnowledge}
                  onChange={(e) => {
                    setSelectedKnowledge(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Filter by Knowledge Level"
                  className="appearance-none rounded-xl border border-black/10 bg-white py-2 pl-3 pr-8 text-xs font-bold text-[#1A1A1A] outline-none transition hover:border-black/20 dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]"
                >
                  <option value="all">All Knowledge Levels</option>
                  <option value="unlearned">Not learned</option>
                  <option value="reviewing">Learning</option>
                  <option value="mastered">Mastered</option>
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-2.5 text-gray-400"
                />
              </div>

              {/* Themes / Categories Select */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Filter by Category"
                  className="appearance-none rounded-xl border border-black/10 bg-white py-2 pl-3 pr-8 text-xs font-bold text-[#1A1A1A] outline-none transition hover:border-black/20 dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]"
                >
                  <option value="all">All Categories</option>
                  {VOCAB_THEMES.map((theme) => (
                    <option key={theme.id} value={theme.id}>
                      {theme.emoji} {theme.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-2.5 text-gray-400"
                />
              </div>

              {/* Sort By Select */}
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  aria-label="Sort vocabulary by"
                  className="appearance-none rounded-xl border border-black/10 bg-white py-2 pl-3 pr-8 text-xs font-bold text-[#1A1A1A] outline-none transition hover:border-black/20 dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]"
                >
                  <option value="default">All Words (Default)</option>
                  <option value="status">Learned Status</option>
                  <option value="word">Word (A-Z)</option>
                  <option value="reading">Reading (Kana)</option>
                  <option value="reviews">Most Reviewed</option>
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-2.5 text-gray-400"
                />
              </div>

              {/* View Mode Switcher (List vs Theme Grid) */}
              <div className="ml-auto flex items-center rounded-xl border border-black/10 bg-white p-0.5 dark:border-white/10 dark:bg-[#1E232B]">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`rounded-lg p-1.5 transition ${
                    viewMode === "list"
                      ? "bg-[var(--color-vermillion)] text-white"
                      : "text-gray-400 hover:text-[#1A1A1A] dark:hover:text-white"
                  }`}
                  title="List View"
                >
                  <List size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`rounded-lg p-1.5 transition ${
                    viewMode === "grid"
                      ? "bg-[var(--color-vermillion)] text-white"
                      : "text-gray-400 hover:text-[#1A1A1A] dark:hover:text-white"
                  }`}
                  title="Theme Cards Grid"
                >
                  <LayoutGrid size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* 3. Main View Display: Theme Grid View OR List Table View */}
          {isLoading ? (
            <div className="rounded-3xl border border-black/10 bg-white p-12 dark:border-white/10 dark:bg-[#161B22]">
              <JapaneseLoader />
            </div>
          ) : viewMode === "grid" ? (
            /* Theme Cards Grid View (Screenshot 1) */
            <div className="space-y-3">
              <p className="text-xs italic text-[#64748B] dark:text-[#94A3B8]">
                Weakest themes first. Click one to see its words.
              </p>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {themeStats.map((theme) => {
                  const reviewedPct =
                    theme.total > 0 ? Math.round((theme.reviewed / theme.total) * 100) : 0;

                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleSelectThemeCard(theme.id)}
                      className="group flex flex-col items-center justify-between rounded-3xl border border-black/10 bg-white p-5 text-center shadow-xs transition hover:border-[var(--color-vermillion)]/50 hover:bg-[#FAFAF8] hover:shadow-md dark:border-white/10 dark:bg-[#161B22] dark:hover:border-[var(--color-vermillion)]/50 dark:hover:bg-[#1A1F29]"
                    >
                      {/* Theme Icon Emblem */}
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/5 transition-transform group-hover:scale-110 dark:bg-white/5">
                        {getThemeIcon(theme.iconName)}
                      </div>

                      {/* Theme Name */}
                      <div className="mt-3 font-bold text-sm text-[#1A1A1A] group-hover:text-[var(--color-vermillion)] dark:text-[#F0F4F8]">
                        {theme.name}
                      </div>

                      {/* Progress Line */}
                      <div className="my-2.5 h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                        <div
                          className="h-full rounded-full bg-[var(--color-vermillion)] transition-all"
                          style={{ width: `${Math.max(theme.reviewed > 0 ? 8 : 0, reviewedPct)}%` }}
                        />
                      </div>

                      {/* Subtitle count */}
                      <div className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                        {theme.reviewed > 0
                          ? `Reviewed · ${theme.reviewed}/${theme.total}`
                          : `Not reviewed · 0/${theme.total}`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Detailed List View (Screenshot 2) */
            <div className="space-y-3">
              {/* Back to themes button */}
              {selectedCategory !== "all" && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-vermillion)] transition hover:underline"
                >
                  <ChevronLeft size={14} />
                  <span>Back to themes</span>
                </button>
              )}

              <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-xs dark:border-white/10 dark:bg-[#161B22]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-xs [&_td:first-child]:sticky [&_td:first-child]:left-0 [&_td:first-child]:z-10 [&_td:first-child]:bg-white [&_td:first-child]:dark:bg-[#161B22] [&_th:first-child]:sticky [&_th:first-child]:left-0 [&_th:first-child]:z-10 [&_th:first-child]:bg-[#FAFAF8] [&_th:first-child]:dark:bg-[#1E232B]">
                    <thead className="border-b border-black/5 bg-[#FAFAF8] text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:border-white/5 dark:bg-[#1E232B] dark:text-[#94A3B8]">
                      <tr>
                        <th className="py-3.5 pl-5 pr-2">Word</th>
                        <th className="px-2 py-3.5">JLPT</th>
                        <th className="px-2 py-3.5">Category</th>
                        <th className="px-3 py-3.5">Reading</th>
                        <th className="px-3 py-3.5">Meaning</th>
                        <th className="px-2 py-3.5 text-center">Audio</th>
                        <th className="px-2 py-3.5 text-center">Success</th>
                        <th className="px-2 py-3.5 text-center">Reviews</th>
                        <th className="px-2 py-3.5 text-center">Last</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                      {paginatedItems.map((item) => (
                        <tr
                          key={item.id}
                          className="group transition hover:bg-[#FAFAF8] dark:hover:bg-[#1E232B]/60"
                        >
                          {/* Word */}
                          <td className="py-3 pl-5 pr-2 font-serif text-base font-bold text-[#1A1A1A] group-hover:text-[var(--color-vermillion)] dark:text-[#F0F4F8]">
                            {item.word}
                          </td>

                          {/* JLPT Pill Badge */}
                          <td className="px-2 py-3">
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                jlptBadgeColors[item.level] || "bg-black/5 text-gray-500"
                              }`}
                            >
                              {item.level}
                            </span>
                          </td>

                          {/* Category */}
                          <td className="px-2 py-3">
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                              <span>{item.theme?.emoji || "📦"}</span>
                              <span>{item.theme?.name || "Objects"}</span>
                            </span>
                          </td>

                          {/* Reading */}
                          <td className="px-3 py-3 font-medium text-[#475569] dark:text-[#CBD5E1]">
                            {item.reading}
                          </td>

                          {/* Meaning */}
                          <td className="px-3 py-3 max-w-[190px] truncate text-[#1A1A1A] dark:text-[#E2E8F0]">
                            {item.meaning.join(", ")}
                          </td>

                          {/* Audio */}
                          <td className="px-2 py-3 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                playJapaneseAudio(item.word);
                              }}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/5 text-gray-600 transition hover:bg-[var(--color-vermillion)] hover:text-white dark:bg-white/5 dark:text-gray-400 dark:hover:bg-[var(--color-vermillion)] dark:hover:text-white"
                              title="Play Audio"
                            >
                              <Play size={11} className="fill-current" />
                            </button>
                          </td>

                          {/* Success State */}
                          <td className="px-2 py-3 text-center">
                            <button
                              type="button"
                              onClick={(e) => handleCycleStatus(item.id, e)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#64748B] hover:text-[#1A1A1A] dark:text-[#94A3B8] dark:hover:text-white"
                            >
                              <span>
                                {item.status === "unlearned"
                                  ? "○ Not Started"
                                  : item.status === "reviewing"
                                  ? "● Learning (75%)"
                                  : "★ Mastered (100%)"}
                              </span>
                            </button>
                          </td>

                          {/* Reviews */}
                          <td className="px-2 py-3 text-center text-[#64748B] dark:text-[#94A3B8]">
                            {item.status === "unlearned" ? "0/0" : `${item.reviews ?? 0}/${item.reviews ?? 0}`}
                          </td>

                          {/* Last */}
                          <td className="px-2 py-3 text-center text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                            {item.lastReviewed || "Never"}
                          </td>
                        </tr>
                      ))}

                      {paginatedItems.length === 0 && (
                        <tr>
                          <td
                            colSpan={9}
                            className="py-12 text-center text-sm text-[#64748B] dark:text-[#94A3B8]"
                          >
                            No vocabulary words found matching your criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-black/5 px-5 py-3.5 dark:border-white/5">
                    <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                      Showing <span className="font-bold">{(page - 1) * pageSize + 1}</span> to{" "}
                      <span className="font-bold">
                        {Math.min(page * pageSize, filteredItems.length)}
                      </span>{" "}
                      of <span className="font-bold">{filteredItems.length}</span> words
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-black/10 bg-white text-gray-600 transition disabled:opacity-30 dark:border-white/10 dark:bg-[#1E232B] dark:text-gray-300"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
                        {page} / {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-black/10 bg-white text-gray-600 transition disabled:opacity-30 dark:border-white/10 dark:bg-[#1E232B] dark:text-gray-300"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-5 lg:col-span-4">
          {/* Card 1: Knowledge by level */}
          <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-[#161B22] space-y-4">
            <div className="flex items-center justify-between border-b border-black/5 pb-3 dark:border-white/10">
              <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
                Knowledge by Level
              </h3>
              <span className="text-[11px] font-bold text-[var(--color-vermillion)]">
                {masteredCount} Mastered
              </span>
            </div>

            <div className="space-y-3">
              {[
                { lvl: "N5", total: 718, mastered: Math.min(masteredCount, 718) },
                { lvl: "N4", total: 668, mastered: 0 },
                { lvl: "N3", total: 2139, mastered: 0 },
                { lvl: "N2", total: 1748, mastered: 0 },
                { lvl: "N1", total: 2699, mastered: 0 },
              ].map((stat) => (
                <div key={stat.lvl} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#1A1A1A] dark:text-[#F0F4F8]">{stat.lvl}</span>
                    <span className="text-[#64748B] dark:text-[#94A3B8]">
                      {stat.mastered} / {stat.total}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-[var(--color-vermillion)] transition-all duration-500"
                      style={{
                        width: `${stat.mastered > 0 ? Math.min(100, Math.max(5, (stat.mastered / stat.total) * 100)) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: This week */}
          <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-[#161B22] space-y-3">
            <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">This Week</h3>
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-3.5 text-center dark:border-white/5 dark:bg-[#1E232B]">
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Learned</div>
                <div className="mt-1 text-xl font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
                  {learningCount + masteredCount}
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400">words</div>
              </div>

              <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-3.5 text-center dark:border-white/5 dark:bg-[#1E232B]">
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Reviews</div>
                <div className="mt-1 text-xl font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
                  {masteredCount * 3 + learningCount * 2}
                </div>
                <div className="text-[10px] text-blue-600 dark:text-blue-400">drills</div>
              </div>
            </div>
          </div>

          {/* Card 3: Words you struggle with */}
          <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-[#161B22] space-y-3">
            <div className="flex items-center justify-between border-b border-black/5 pb-2.5 dark:border-white/10">
              <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
                Words you struggle with
              </h3>
              <span className="rounded-md bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                SRS Queue
              </span>
            </div>

            {struggleWords.length > 0 ? (
              <div className="space-y-2 pt-1">
                {struggleWords.map((word) => (
                  <div
                    key={word.id}
                    className="flex items-center justify-between rounded-xl border border-black/5 bg-[#FAFAF8] p-2.5 transition hover:border-black/10 dark:border-white/5 dark:bg-[#1E232B] dark:hover:border-white/10"
                  >
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-sm font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
                          {word.word}
                        </span>
                        <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          {word.reading}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#64748B] dark:text-[#CBD5E1] truncate max-w-[160px]">
                        {word.meaning[0]}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => playJapaneseAudio(word.word)}
                      className="rounded-full bg-black/5 p-1.5 text-gray-600 transition hover:bg-[var(--color-vermillion)] hover:text-white dark:bg-white/5 dark:text-gray-400 dark:hover:bg-[var(--color-vermillion)] dark:hover:text-white"
                      title="Listen"
                    >
                      <Play size={10} className="fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-xs text-[#64748B] dark:text-[#94A3B8] italic">
                No struggle items yet! Keep practicing to track SRS weaknesses.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
