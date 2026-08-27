"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Volume2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Trophy,
  Flame,
  RotateCcw,
  ArrowLeft,
  Trash2,
  Undo2,
  Sparkles,
  HelpCircle,
  BookOpen,
  Check,
  Layers,
} from "lucide-react";
import { playJapaneseAudio } from "@/lib/audio";
import { HowToPlay } from "@/components/practice/HowToPlay";

type LevelFilter = "ALL" | "N5" | "N4" | "N3";

interface SentenceScrambleExercise {
  id: string;
  level: "N5" | "N4" | "N3";
  fullSentence: string;
  reading: string;
  translation: string;
  tiles: string[]; // correct sequence
}

interface ScrambledTile {
  id: string;
  text: string;
  originalIndex: number;
}

interface SessionResultItem {
  exercise: SentenceScrambleExercise;
  userOrder: string[];
  isCorrect: boolean;
}

export function SentenceScrambleEngine() {
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("ALL");

  // Content pool fetched from the database
  const [allExercises, setAllExercises] = useState<SentenceScrambleExercise[]>([]);
  const [loading, setLoading] = useState(true);

  const [quizPool, setQuizPool] = useState<SentenceScrambleExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Tile states for current question
  const [availableTiles, setAvailableTiles] = useState<ScrambledTile[]>([]);
  const [placedTiles, setPlacedTiles] = useState<ScrambledTile[]>([]);

  // Feedback & Game stats
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [sessionResults, setSessionResults] = useState<SessionResultItem[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [showFurigana, setShowFurigana] = useState(true);

  // Initialize questions
  const startQuiz = useCallback(
    (level: LevelFilter, customPool?: SentenceScrambleExercise[]) => {
      const source =
        customPool ??
        (level === "ALL"
          ? allExercises
          : allExercises.filter((ex) => ex.level === level));

      const shuffled = [...source].sort(() => Math.random() - 0.5);
      setQuizPool(shuffled);
      setCurrentIndex(0);
      setStatus("idle");
      setScore(0);
      setStreak(0);
      setMaxStreak(0);
      setIsFinished(false);
      setSessionResults([]);
      setStartTime(Date.now());
    },
    [allExercises]
  );

  useEffect(() => {
    startQuiz(levelFilter);
  }, [levelFilter, startQuiz]);

  // Fetch the full exercise pool from the database once on mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/content/scramble");
        const json = await res.json();

        if (json.data && Array.isArray(json.data) && !cancelled) {
          setAllExercises(json.data as SentenceScrambleExercise[]);
        }
      } catch (err) {
        console.error("Failed to load sentence scramble exercises:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const currentExercise = quizPool[currentIndex];

  // Prepare scrambled tiles whenever the current exercise changes
  useEffect(() => {
    if (!currentExercise) return;

    const initialTiles: ScrambledTile[] = currentExercise.tiles.map((text, idx) => ({
      id: `${currentExercise.id}-tile-${idx}-${text}`,
      text,
      originalIndex: idx,
    }));

    // Shuffle tiles
    const scrambled = [...initialTiles].sort(() => Math.random() - 0.5);
    setAvailableTiles(scrambled);
    setPlacedTiles([]);
    setStatus("idle");
  }, [currentExercise, currentIndex]);

  // Click to place a tile from available pool into placed sequence
  const handlePlaceTile = (tile: ScrambledTile) => {
    if (status !== "idle") return;
    setAvailableTiles((prev) => prev.filter((t) => t.id !== tile.id));
    setPlacedTiles((prev) => [...prev, tile]);
  };

  // Click to remove a placed tile back to available pool
  const handleRemoveTile = (tile: ScrambledTile) => {
    if (status !== "idle") return;
    setPlacedTiles((prev) => prev.filter((t) => t.id !== tile.id));
    setAvailableTiles((prev) => [...prev, tile]);
  };

  // Clear all placed tiles back to pool
  const handleClearAll = () => {
    if (status !== "idle" || !currentExercise) return;
    const all = [...placedTiles, ...availableTiles];
    setPlacedTiles([]);
    setAvailableTiles(all);
  };

  // Undo last placed tile
  const handleUndo = () => {
    if (status !== "idle" || placedTiles.length === 0) return;
    const last = placedTiles[placedTiles.length - 1];
    setPlacedTiles((prev) => prev.slice(0, -1));
    setAvailableTiles((prev) => [...prev, last]);
  };

  // Verify answer
  const handleVerify = useCallback(() => {
    if (status !== "idle" || !currentExercise) return;
    if (placedTiles.length !== currentExercise.tiles.length) return;

    const assembledString = placedTiles.map((t) => t.text).join("");
    const targetString = currentExercise.tiles.join("");
    const isCorrect = assembledString === targetString;

    if (isCorrect) {
      setStatus("correct");
      setScore((s) => s + 1);
      setStreak((st) => {
        const next = st + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
      playJapaneseAudio(currentExercise.fullSentence);
    } else {
      setStatus("incorrect");
      setStreak(0);
    }

    setSessionResults((prev) => [
      ...prev,
      {
        exercise: currentExercise,
        userOrder: placedTiles.map((t) => t.text),
        isCorrect,
      },
    ]);
  }, [status, currentExercise, placedTiles, maxStreak]);

  // Next Question
  const handleNext = () => {
    if (currentIndex + 1 < quizPool.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      setIsFinished(true);
    }
  };

  // Keyboard shortcut support:
  // 1-9 to pick remaining available tiles, Backspace for undo, Enter to check or next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished || !currentExercise) return;

      if (status !== "idle") {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
          e.preventDefault();
          handleNext();
        }
        return;
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        handleUndo();
        return;
      }

      if (e.key === "Enter" && placedTiles.length === currentExercise.tiles.length) {
        e.preventDefault();
        handleVerify();
        return;
      }

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= availableTiles.length) {
        e.preventDefault();
        handlePlaceTile(availableTiles[num - 1]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    status,
    isFinished,
    currentExercise,
    availableTiles,
    placedTiles.length,
    handleVerify,
  ]);

  // Session Logging to /api/sessions
  const loggedRef = useRef(false);
  useEffect(() => {
    if (isFinished && quizPool.length > 0 && !loggedRef.current) {
      loggedRef.current = true;
      const durationMin = Math.max(1, Math.round((Date.now() - startTime) / 60000));
      const accuracy = Math.round((score / quizPool.length) * 100);

      // 1. Batch grammar log
      const grammarBatch = quizPool.map((q) => ({
        grammarId: `scramble_${q.id}`,
        level: q.level,
        status: (score / quizPool.length >= 0.7 ? "mastered" : "reviewing") as "mastered" | "reviewing",
        notes: `Sentence scramble: ${q.fullSentence}`,
      }));

      fetch("/api/grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch: grammarBatch }),
      }).catch(() => {});

      // 2. Study session log
      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationMinutes: durationMin,
          level: levelFilter === "ALL" ? "N5" : levelFilter,
          activities: ["sentence-scramble", "grammar"],
          wordsReviewed: quizPool.length * 4,
          notes: JSON.stringify({
            mode: "sentence-scramble",
            level: levelFilter,
            score,
            total: quizPool.length,
            accuracy,
            maxStreak,
          }),
        }),
      }).catch(() => {});
    }

    if (!isFinished) {
      loggedRef.current = false;
    }
  }, [isFinished, quizPool, score, levelFilter, maxStreak, startTime]);

  // While the exercise pool is being fetched
  if (loading) {
    return (
      <div className="mx-auto max-w-xl p-12 text-center text-sm text-gray-500">
        Loading sentence scramble exercises from database...
      </div>
    );
  }

  if (quizPool.length === 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-black/10 bg-white p-8 text-center shadow-xs dark:border-white/10 dark:bg-[#161B22]">
        <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">No Exercises Found</h2>
        <p className="mt-2 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
          Try switching your JLPT level filter.
        </p>
        <button
          type="button"
          onClick={() => setLevelFilter("ALL")}
          className="mt-4 rounded-xl bg-[#C84B31] dark:bg-[#E85C40] px-4 py-2 text-xs font-bold text-white shadow-xs"
        >
          Reset to ALL Levels
        </button>
      </div>
    );
  }

  // ─── FINISHED SCREEN ────────────────────────────────────────────────────────
  if (isFinished) {
    const accuracy = Math.round((score / quizPool.length) * 100);
    const missed = sessionResults.filter((r) => !r.isCorrect);

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border border-black/10 bg-white p-8 text-center shadow-xs dark:border-white/10 dark:bg-[#161B22]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 shadow-sm">
            <Trophy size={40} />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
            Sentence Scramble Complete!
          </h2>
          <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
            Japanese syntax & word order mastery overview
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-[#FAFAF8] p-4 dark:bg-[#1E232B]">
            <div>
              <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Score</div>
              <div className="mt-1 text-2xl font-bold text-[#C84B31] dark:text-[#E85C40]">
                {score} / {quizPool.length}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Accuracy</div>
              <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {accuracy}%
              </div>
            </div>
            <div>
              <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Max Streak</div>
              <div className="mt-1 text-2xl font-bold text-amber-500">{maxStreak}</div>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/practice"
              className="flex-1 min-w-0 sm:min-w-[140px] rounded-2xl border border-black/10 bg-[#FAFAF8] py-3 text-center text-xs font-bold text-[#1A1A1A] transition hover:bg-black/5 dark:border-white/10 dark:bg-[#1E232B] dark:text-[#FAFAFA]"
            >
              Practice Hub
            </Link>

            {missed.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  startQuiz(
                    levelFilter,
                    missed.map((m) => m.exercise)
                  )
                }
                className="flex-1 min-w-0 sm:min-w-[140px] rounded-2xl border border-red-500/30 bg-red-500/10 py-3 text-xs font-bold text-red-700 dark:text-red-300 transition hover:bg-red-500/20"
              >
                Retry {missed.length} Missed
              </button>
            )}

            <button
              type="button"
              onClick={() => startQuiz(levelFilter)}
              className="flex-1 min-w-0 sm:min-w-[140px] rounded-2xl bg-[#C84B31] dark:bg-[#E85C40] py-3 text-xs font-bold text-white shadow-md transition hover:opacity-90"
            >
              Practice Again
            </button>
          </div>
        </div>

        {/* Detailed Sentence Breakdown */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-[#FAFAFA] flex items-center gap-2">
            <BookOpen size={16} className="text-[#C84B31] dark:text-[#E85C40]" />
            <span>Sentence Order Review ({sessionResults.length})</span>
          </h3>

          <div className="space-y-3">
            {sessionResults.map((result, idx) => (
              <div
                key={result.exercise.id + idx}
                className="rounded-2xl border border-black/10 bg-white p-4 shadow-xs dark:border-white/10 dark:bg-[#161B22] space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {result.isCorrect ? (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <Check size={14} />
                      </span>
                    ) : (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/15 text-red-600 dark:text-red-400">
                        <XCircle size={14} />
                      </span>
                    )}
                    <span className="text-xs font-bold uppercase text-[#6B6B6B] dark:text-[#A0A0A0]">
                      {result.exercise.level} · Sentence {idx + 1}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => playJapaneseAudio(result.exercise.fullSentence)}
                    className="flex items-center gap-1 rounded-lg border border-black/5 bg-[#FAFAF8] px-2 py-1 text-[11px] font-semibold text-[#6B6B6B] hover:text-[#1A1A1A] dark:border-white/5 dark:bg-[#1E232B] dark:text-[#A0A0A0] dark:hover:text-white"
                  >
                    <Volume2 size={12} /> Audio
                  </button>
                </div>

                <div className="font-serif text-base font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                  {result.exercise.fullSentence}
                </div>

                <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
                  {result.exercise.reading}
                </div>

                <div className="text-xs italic text-[#1A1A1A]/80 dark:text-[#FAFAFA]/80">
                  &quot;{result.exercise.translation}&quot;
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── ACTIVE EXERCISE VIEW ───────────────────────────────────────────────────
  const totalRequiredTiles = currentExercise.tiles.length;
  const allPlaced = placedTiles.length === totalRequiredTiles;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Top Header & Level Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/practice"
          className="flex items-center gap-1.5 text-xs font-semibold text-[#6B6B6B] hover:text-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:text-white"
        >
          <ArrowLeft size={16} /> Practice Hub
        </Link>

        {/* Level Filters */}
        <div className="flex items-center gap-1.5 rounded-xl border border-black/10 bg-white p-1 shadow-xs dark:border-white/10 dark:bg-[#161B22]">
          {(["ALL", "N5", "N4", "N3"] as LevelFilter[]).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setLevelFilter(lvl)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                levelFilter === lvl
                  ? "bg-[#C84B31] dark:bg-[#E85C40] text-white shadow-xs"
                  : "text-[#6B6B6B] hover:text-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:text-white"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Streak and Count */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
            <Flame size={16} className={streak > 0 ? "animate-bounce" : ""} />
            <span>{streak} Streak</span>
          </div>
          <span className="text-xs font-semibold text-[#6B6B6B] dark:text-[#A0A0A0]">
            {currentIndex + 1} / {quizPool.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
        <div
          className="h-full bg-[#C84B31] dark:bg-[#E85C40] transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / quizPool.length) * 100}%` }}
        />
      </div>

      {/* How to Play */}
      <HowToPlay
        gameKey="sentence-scramble"
        steps={[
          "The words of a Japanese sentence are scrambled into tiles. Tap them in the right order to rebuild the sentence.",
          "Tap a placed tile to remove it again, or use Undo / Clear to rearrange; the English hint and furigana are shown to help.",
          "Fast keyboard play: press 1–9 to place tiles, Backspace to undo the last tile, Enter to check, and Enter again for the next sentence.",
          "When all tiles are placed, Check verifies your answer — correct sentences are pronounced aloud.",
          "Correct answers build your streak; filter by JLPT level (ALL / N5 / N4 / N3) and see your summary at the end.",
        ]}
        note="Tip: identify the particle first (は, を, に...) — its position usually anchors the rest of the sentence."
      />

      {/* Main Assembly Arena Card */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8 shadow-xs dark:border-white/10 dark:bg-[#161B22] space-y-6">
        {/* Card Header */}
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 flex items-center gap-1.5">
            <Layers size={14} />
            JLPT {currentExercise.level} Word Order
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFurigana(!showFurigana)}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
                showFurigana
                  ? "border-[#C84B31] dark:border-[#E85C40] bg-[#C84B31]/10 dark:bg-[#E85C40]/10 text-[#C84B31] dark:text-[#E85C40]"
                  : "border-black/10 text-gray-500 dark:border-white/10"
              }`}
              title="Toggle Furigana reading"
            >
              ふりがな
            </button>
          </div>
        </div>

        {/* Translation Prompt */}
        <div className="text-center space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
            Translate the sentence by ordering tiles:
          </div>
          <div className="text-lg sm:text-xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
            &quot;{currentExercise.translation}&quot;
          </div>
          {status !== "idle" && showFurigana && (
            <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0] pt-1">
              {currentExercise.reading}
            </div>
          )}
        </div>

        {/* ── 1. Target Sentence Construction Area ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#6B6B6B] dark:text-[#A0A0A0]">
            <span>Your Sentence (Tap a tile to remove):</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUndo}
                disabled={status !== "idle" || placedTiles.length === 0}
                className="flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-[#1A1A1A] disabled:opacity-30 dark:hover:text-white"
              >
                <Undo2 size={12} /> Undo
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                disabled={status !== "idle" || placedTiles.length === 0}
                className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600 disabled:opacity-30"
              >
                <Trash2 size={12} /> Clear
              </button>
            </div>
          </div>

          <div
            className={`min-h-[90px] flex flex-wrap items-center gap-2.5 rounded-2xl border-2 p-4 transition-all ${
              status === "correct"
                ? "border-emerald-500 bg-emerald-500/5"
                : status === "incorrect"
                ? "border-red-500 bg-red-500/5"
                : "border-dashed border-black/15 bg-[#FAFAF8] dark:border-white/15 dark:bg-[#1E232B]"
            }`}
          >
            {placedTiles.length === 0 && (
              <div className="w-full text-center text-xs italic text-gray-400 select-none">
                Select word tiles below to build the sentence...
              </div>
            )}

            {placedTiles.map((tile, idx) => (
              <button
                key={tile.id}
                type="button"
                disabled={status !== "idle"}
                onClick={() => handleRemoveTile(tile)}
                className={`group flex items-center gap-1.5 rounded-xl border px-3.5 py-2 font-serif text-base sm:text-lg font-bold shadow-xs transition ${
                  status === "correct"
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : status === "incorrect"
                    ? "border-red-500 bg-red-500 text-white"
                    : "border-black/10 bg-white text-[#1A1A1A] hover:border-red-500 hover:bg-red-50 dark:border-white/10 dark:bg-[#161B22] dark:text-[#FAFAFA] dark:hover:bg-red-950/30"
                }`}
              >
                <span>{tile.text}</span>
                {status === "idle" && (
                  <span className="text-[10px] opacity-40 group-hover:opacity-100 text-red-500">
                    ✕
                  </span>
                )}
              </button>
            ))}

            {/* Empty slot indicators for remaining tiles */}
            {Array.from({ length: totalRequiredTiles - placedTiles.length }).map((_, i) => (
              <div
                key={`empty-slot-${i}`}
                className="h-10 w-12 rounded-xl border border-dashed border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5 opacity-40"
              />
            ))}
          </div>
        </div>

        {/* ── 2. Available Scrambled Tiles Pool ── */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-[#6B6B6B] dark:text-[#A0A0A0]">
            Available Word Tiles (Tap to place):
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 p-2 min-h-[70px]">
            {availableTiles.map((tile, idx) => (
              <button
                key={tile.id}
                type="button"
                disabled={status !== "idle"}
                onClick={() => handlePlaceTile(tile)}
                className="relative flex items-center justify-center rounded-2xl border border-black/10 bg-[#FAFAF8] px-4 py-3 font-serif text-lg sm:text-xl font-bold text-[#1A1A1A] shadow-xs transition hover:border-[#C84B31] dark:border-[#E85C40] hover:shadow-xs dark:border-white/10 dark:bg-[#1E232B] dark:text-[#FAFAFA]"
              >
                <span className="absolute left-2 top-1.5 text-[9px] font-bold text-gray-400">
                  {idx + 1}
                </span>
                <span>{tile.text}</span>
              </button>
            ))}

            {availableTiles.length === 0 && status === "idle" && (
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-pulse">
                All tiles placed! Click &quot;Check Sentence&quot; below or press Enter.
              </div>
            )}
          </div>
        </div>

        {/* ── 3. Bottom Check & Audio Controls ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => playJapaneseAudio(currentExercise.fullSentence)}
            className="flex items-center gap-1.5 rounded-full border border-black/10 bg-[#FAFAF8] px-4 py-2 text-xs font-bold text-[#1A1A1A] shadow-2xs transition hover:border-[#C84B31] dark:border-[#E85C40] dark:border-white/10 dark:bg-[#1E232B] dark:text-[#FAFAFA]"
          >
            <Volume2 size={16} className="text-[#C84B31] dark:text-[#E85C40]" />
            <span>Audio Clue</span>
          </button>

          {status === "idle" ? (
            <button
              type="button"
              disabled={!allPlaced}
              onClick={handleVerify}
              className="flex items-center gap-2 rounded-2xl bg-[#C84B31] dark:bg-[#E85C40] px-6 py-3 text-xs font-bold text-white shadow-md transition hover:opacity-90 disabled:opacity-40"
            >
              <span>Check Sentence</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              autoFocus
              className="flex items-center gap-2 rounded-2xl bg-black px-6 py-3 text-xs font-bold text-white shadow-md transition hover:opacity-90 dark:bg-white dark:text-black"
            >
              <span>Next Question</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>

        {/* ── 4. Feedback Result Alert ── */}
        {status !== "idle" && (
          <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div
              className={`flex items-center justify-between rounded-2xl p-4 ${
                status === "correct"
                  ? "bg-emerald-500/15 text-emerald-900 dark:text-emerald-300"
                  : "bg-red-500/15 text-red-900 dark:text-red-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {status === "correct" ? (
                  <CheckCircle2 size={24} className="text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <XCircle size={24} className="text-red-600 dark:text-red-400" />
                )}
                <div>
                  <div className="text-sm font-bold">
                    {status === "correct"
                      ? "Perfect Japanese Sentence Order!"
                      : "Incorrect Word Order"}
                  </div>
                  <div className="text-xs opacity-80">
                    {status === "correct" ? "SOV Syntax Verified" : "Correct sentence sequence:"}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => playJapaneseAudio(currentExercise.fullSentence)}
                className="flex items-center gap-1 rounded-xl bg-black/10 px-3 py-1.5 text-xs font-bold transition hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20"
              >
                <Volume2 size={14} /> Listen
              </button>
            </div>

            {status === "incorrect" && (
              <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 text-xs leading-relaxed text-[#1A1A1A] dark:border-white/5 dark:bg-[#1E232B] dark:text-[#FAFAFA] space-y-1">
                <div className="font-bold text-[#C84B31] dark:text-[#E85C40]">
                  Correct Sentence Order:
                </div>
                <div className="font-serif text-base font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                  {currentExercise.fullSentence}
                </div>
                <div className="text-[#6B6B6B] dark:text-[#A0A0A0]">
                  {currentExercise.reading}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Instructions */}
      <div className="text-center text-[11px] text-[#6B6B6B] dark:text-[#A0A0A0]">
        Press keys <kbd className="rounded bg-black/10 px-1 py-0.5 font-mono dark:bg-white/10">1</kbd>-<kbd className="rounded bg-black/10 px-1 py-0.5 font-mono dark:bg-white/10">5</kbd> to place tiles · <kbd className="rounded bg-black/10 px-1 py-0.5 font-mono dark:bg-white/10">Backspace</kbd> to undo · <kbd className="rounded bg-black/10 px-1 py-0.5 font-mono dark:bg-white/10">Enter</kbd> to check
      </div>
    </div>
  );
}
