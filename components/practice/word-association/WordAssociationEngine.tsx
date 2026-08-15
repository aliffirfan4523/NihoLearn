"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Puzzle,
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Flame,
  Trophy,
  Zap,
  Layers,
  Grid,
  Check,
  X,
  Clock,
  Shuffle,
} from "lucide-react";
import { playJapaneseAudio } from "@/lib/audio";
import { JapaneseLoader } from "@/components/ui/JapaneseLoader";
import { WORD_PAIRS, type WordPair } from "@/lib/data/vocab-practice-suite";
import { VOCAB_THEMES, type VocabTheme } from "@/lib/vocab-themes";

export type AssociationMode = "matrix_match" | "antonyms_opposites" | "category_sort";

interface MatrixCard {
  id: string;
  pairId: string;
  type: "japanese" | "meaning_or_opposite";
  text: string;
  subText?: string;
  audioText?: string;
  isMatched: boolean;
}

export function WordAssociationEngine() {
  // Config
  const [mode, setMode] = useState<AssociationMode>("matrix_match");
  const [level, setLevel] = useState<string>("N5");
  const [cardCount, setCardCount] = useState<number>(12);

  // Session state
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Matrix Game State
  const [cards, setCards] = useState<MatrixCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [mismatchedCardIds, setMismatchedCardIds] = useState<string[]>([]);

  // Antonym Quiz State
  const [antonymQuestions, setAntonymQuestions] = useState<
    Array<{
      pair: WordPair;
      options: WordPair["wordB"][];
    }>
  >([]);
  const [antonymIndex, setAntonymIndex] = useState<number>(0);
  const [antonymSelectedOption, setAntonymSelectedOption] = useState<string | null>(null);
  const [antonymIsAnswered, setAntonymIsAnswered] = useState<boolean>(false);

  // Category Sort State
  const [categoryQuestions, setCategoryQuestions] = useState<
    Array<{
      word: string;
      reading: string;
      meaning: string;
      correctTheme: VocabTheme;
      options: VocabTheme[];
    }>
  >([]);
  const [categoryIndex, setCategoryIndex] = useState<number>(0);
  const [categorySelectedOption, setCategorySelectedOption] = useState<string | null>(null);
  const [categoryIsAnswered, setCategoryIsAnswered] = useState<boolean>(false);

  // Stats & Combo
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  // Timer runner
  useEffect(() => {
    let interval: any = null;
    if (isSessionActive && !isFinished) {
      interval = setInterval(() => {
        setTimerSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, isFinished]);

  // Start Session
  const handleStartPractice = useCallback(async () => {
    setIsLoading(true);
    setTimerSeconds(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setMoves(0);
    setSelectedCardId(null);
    setMismatchedCardIds([]);
    setIsEvaluating(false);

    try {
      if (mode === "matrix_match") {
        // Fetch or use curated pairs
        let pairsPool = WORD_PAIRS.filter((p) => level === "ALL" || p.level === level);
        if (pairsPool.length < 6) {
          pairsPool = WORD_PAIRS;
        }

        const selectedPairs = [...pairsPool].sort(() => Math.random() - 0.5).slice(0, cardCount / 2);
        const cardList: MatrixCard[] = [];

        selectedPairs.forEach((pair) => {
          cardList.push({
            id: `a-${pair.id}`,
            pairId: pair.id,
            type: "japanese",
            text: pair.wordA.kanji,
            subText: pair.wordA.reading,
            audioText: pair.wordA.kanji,
            isMatched: false,
          });
          cardList.push({
            id: `b-${pair.id}`,
            pairId: pair.id,
            type: "meaning_or_opposite",
            text: pair.wordB.kanji,
            subText: `${pair.wordB.reading} (${pair.wordB.meaning})`,
            audioText: pair.wordB.kanji,
            isMatched: false,
          });
        });

        setCards(cardList.sort(() => Math.random() - 0.5));
      } else if (mode === "antonyms_opposites") {
        let pool = WORD_PAIRS.filter((p) => p.type === "antonym" && (level === "ALL" || p.level === level));
        if (pool.length < 4) pool = WORD_PAIRS.filter((p) => p.type === "antonym");

        const qList = pool.map((pair) => {
          const others = pool.filter((p) => p.id !== pair.id).map((p) => p.wordB);
          const distractors = others.sort(() => Math.random() - 0.5).slice(0, 3);
          const options = [pair.wordB, ...distractors].sort(() => Math.random() - 0.5);
          return { pair, options };
        });

        setAntonymQuestions(qList.sort(() => Math.random() - 0.5));
        setAntonymIndex(0);
        setAntonymSelectedOption(null);
        setAntonymIsAnswered(false);
      } else if (mode === "category_sort") {
        // Fetch vocabulary and associate with themes
        const res = await fetch(level === "ALL" ? `/api/vocab?limit=100` : `/api/vocab?level=${level}&limit=100`);
        const json = await res.json();
        const vocabList = json.data || [];

        const catQ: typeof categoryQuestions = [];
        for (const item of vocabList.slice(0, 15)) {
          const mStr = Array.isArray(item.meaning) ? item.meaning.join(" ") : String(item.meaning || "");
          const combined = `${item.word || ""} ${item.reading || ""} ${mStr}`.toLowerCase();
          const matchedTheme =
            VOCAB_THEMES.find((t) => t.keywords.some((k) => combined.includes((k || "").toLowerCase()))) || VOCAB_THEMES[0];

          const otherThemes = VOCAB_THEMES.filter((t) => t.id !== matchedTheme.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

          const options = [matchedTheme, ...otherThemes].sort(() => Math.random() - 0.5);

          catQ.push({
            word: item.word,
            reading: item.reading,
            meaning: item.meaning.join(", "),
            correctTheme: matchedTheme,
            options,
          });
        }

        setCategoryQuestions(catQ);
        setCategoryIndex(0);
        setCategorySelectedOption(null);
        setCategoryIsAnswered(false);
      }

      setIsFinished(false);
      setIsSessionActive(true);
    } catch (err) {
      console.error("Failed to prepare word association practice:", err);
    } finally {
      setIsLoading(false);
    }
  }, [mode, level, cardCount]);

  // Matrix Card Click Handler
  const handleCardClick = (card: MatrixCard) => {
    if (isEvaluating || card.isMatched || card.id === selectedCardId) return;

    if (!selectedCardId) {
      // First card selection
      setSelectedCardId(card.id);
      if (card.audioText) playJapaneseAudio(card.audioText);
      return;
    }

    // Second card selection
    setMoves((m) => m + 1);
    const firstCard = cards.find((c) => c.id === selectedCardId);
    if (!firstCard) return;

    if (firstCard.pairId === card.pairId && firstCard.id !== card.id) {
      // MATCH SUCCESS!
      setIsEvaluating(true);
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo > maxCombo) setMaxCombo(nextCombo);

      const pointsEarned = Math.round(100 * (1 + nextCombo * 0.2));
      setScore((s) => s + pointsEarned);

      if (card.audioText) playJapaneseAudio(card.audioText);

      setTimeout(() => {
        setCards((prev) =>
          prev.map((c) => (c.pairId === card.pairId ? { ...c, isMatched: true } : c))
        );
        setSelectedCardId(null);
        setIsEvaluating(false);

        // Check if all cards matched
        const remainingUnmatched = cards.filter((c) => !c.isMatched && c.pairId !== card.pairId);
        if (remainingUnmatched.length === 0) {
          setIsFinished(true);
          logStudySession();
        }
      }, 500);
    } else {
      // MISMATCH
      setIsEvaluating(true);
      setCombo(0);
      setMismatchedCardIds([selectedCardId, card.id]);

      setTimeout(() => {
        setMismatchedCardIds([]);
        setSelectedCardId(null);
        setIsEvaluating(false);
      }, 800);
    }
  };

  // Antonym Answer Handler
  const handleAntonymSelect = (option: WordPair["wordB"]) => {
    if (antonymIsAnswered) return;
    const currentQ = antonymQuestions[antonymIndex];
    if (!currentQ) return;

    const isRight = option.kanji === currentQ.pair.wordB.kanji;
    setAntonymSelectedOption(option.kanji);
    setAntonymIsAnswered(true);

    if (isRight) {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo > maxCombo) setMaxCombo(nextCombo);
      setScore((s) => s + Math.round(100 * (1 + nextCombo * 0.2)));
      playJapaneseAudio(option.kanji);
    } else {
      setCombo(0);
      playJapaneseAudio(currentQ.pair.wordB.kanji);
    }
  };

  const handleNextAntonym = () => {
    if (antonymIndex + 1 >= antonymQuestions.length) {
      setIsFinished(true);
      logStudySession();
      return;
    }
    setAntonymIndex((i) => i + 1);
    setAntonymSelectedOption(null);
    setAntonymIsAnswered(false);
  };

  // Category Sort Answer Handler
  const handleCategorySelect = (themeObj: VocabTheme) => {
    if (categoryIsAnswered) return;
    const currentQ = categoryQuestions[categoryIndex];
    if (!currentQ) return;

    const isRight = themeObj.id === currentQ.correctTheme.id;
    setCategorySelectedOption(themeObj.id);
    setCategoryIsAnswered(true);

    if (isRight) {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo > maxCombo) setMaxCombo(nextCombo);
      setScore((s) => s + Math.round(100 * (1 + nextCombo * 0.2)));
      playJapaneseAudio(currentQ.word);
    } else {
      setCombo(0);
      playJapaneseAudio(currentQ.word);
    }
  };

  const handleNextCategory = () => {
    if (categoryIndex + 1 >= categoryQuestions.length) {
      setIsFinished(true);
      logStudySession();
      return;
    }
    setCategoryIndex((i) => i + 1);
    setCategorySelectedOption(null);
    setCategoryIsAnswered(false);
  };

  // Log session
  const logStudySession = () => {
    fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        durationMinutes: Math.max(1, Math.round(timerSeconds / 60)),
        level,
        activities: JSON.stringify(["vocabulary", "arcade_daily"]),
        wordsReviewed: cardCount,
        notes: `Completed Word Association (${mode}) game: ${score} pts, Max Combo: ${maxCombo}x.`,
      }),
    }).catch(() => {});
  };

  // Format timer
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins}:${remSecs.toString().padStart(2, "0")}`;
  };

  // 1. SETUP SCREEN
  if (!isSessionActive) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 animate-in fade-in duration-200">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--color-vermillion)]/10 text-[var(--color-vermillion)]">
            <Puzzle size={28} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#F0F4F8]">
            Word Association Matrix
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
            Test semantic connections, antonym pairs, and thematic vocabulary categories with combo multipliers!
          </p>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-xs dark:border-white/10 dark:bg-[#161B22] space-y-6">
          {/* Mode Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              Association Game Mode
            </label>
            <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setMode("matrix_match")}
                className={`flex flex-col items-start gap-1 rounded-2xl p-4 text-left transition ${
                  mode === "matrix_match"
                    ? "bg-[var(--color-vermillion)] text-white shadow-xs"
                    : "border border-black/10 bg-[#FAFAF8] text-[#1A1A1A] hover:bg-black/5 dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]"
                }`}
              >
                <Grid size={18} />
                <span className="font-bold text-xs">Card Matrix Grid</span>
                <span className={`text-[11px] ${mode === "matrix_match" ? "text-white/80" : "text-[#64748B] dark:text-[#94A3B8]"}`}>
                  Match & clear card pairs
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMode("antonyms_opposites")}
                className={`flex flex-col items-start gap-1 rounded-2xl p-4 text-left transition ${
                  mode === "antonyms_opposites"
                    ? "bg-[var(--color-vermillion)] text-white shadow-xs"
                    : "border border-black/10 bg-[#FAFAF8] text-[#1A1A1A] hover:bg-black/5 dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]"
                }`}
              >
                <Shuffle size={18} />
                <span className="font-bold text-xs">Opposite Antonyms</span>
                <span className={`text-[11px] ${mode === "antonyms_opposites" ? "text-white/80" : "text-[#64748B] dark:text-[#94A3B8]"}`}>
                  Match counter pairs (大 ↔ 小)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMode("category_sort")}
                className={`flex flex-col items-start gap-1 rounded-2xl p-4 text-left transition ${
                  mode === "category_sort"
                    ? "bg-[var(--color-vermillion)] text-white shadow-xs"
                    : "border border-black/10 bg-[#FAFAF8] text-[#1A1A1A] hover:bg-black/5 dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]"
                }`}
              >
                <Layers size={18} />
                <span className="font-bold text-xs">Semantic Themes</span>
                <span className={`text-[11px] ${mode === "category_sort" ? "text-white/80" : "text-[#64748B] dark:text-[#94A3B8]"}`}>
                  Categorize by subject topic
                </span>
              </button>
            </div>
          </div>

          {/* Level Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              Select JLPT Level
            </label>
            <div className="mt-2.5 grid grid-cols-4 gap-2">
              {["N5", "N4", "N3", "ALL"].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  className={`rounded-2xl py-2.5 text-xs font-bold transition ${
                    level === lvl
                      ? "bg-[var(--color-vermillion)] text-white shadow-xs"
                      : "border border-black/10 bg-[#FAFAF8] text-[#1A1A1A] hover:bg-black/5 dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Card Matrix Size (if matrix mode) */}
          {mode === "matrix_match" && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                Grid Matrix Size
              </label>
              <div className="mt-2.5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCardCount(12)}
                  className={`rounded-2xl py-3 text-xs font-bold transition ${
                    cardCount === 12
                      ? "bg-[var(--color-vermillion)] text-white"
                      : "border border-black/10 bg-[#FAFAF8] text-[#1A1A1A] dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]"
                  }`}
                >
                  12 Cards (6 Pairs)
                </button>
                <button
                  type="button"
                  onClick={() => setCardCount(16)}
                  className={`rounded-2xl py-3 text-xs font-bold transition ${
                    cardCount === 16
                      ? "bg-[var(--color-vermillion)] text-white"
                      : "border border-black/10 bg-[#FAFAF8] text-[#1A1A1A] dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]"
                  }`}
                >
                  16 Cards (8 Pairs)
                </button>
              </div>
            </div>
          )}

          {/* Start Button */}
          <button
            type="button"
            onClick={handleStartPractice}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-vermillion)] py-4 text-sm font-bold text-white shadow-md transition hover:opacity-90 active:scale-[0.99] cursor-pointer"
          >
            {isLoading ? (
              <span>Shuffling Cards...</span>
            ) : (
              <>
                <Zap size={18} />
                <span>Launch Word Association Matrix</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // 2. LOADING STATE
  if (isLoading) {
    return <JapaneseLoader message="Shuffling word association pairs and semantic matrix..." />;
  }

  // 3. FINISHED SUMMARY SCREEN
  if (isFinished) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 animate-in fade-in duration-300">
        <div className="rounded-3xl border border-black/10 bg-white p-8 text-center shadow-lg dark:border-white/10 dark:bg-[#161B22] space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--color-vermillion)]/10 text-[var(--color-vermillion)]">
            <Trophy size={40} />
          </div>

          <div>
            <span className="rounded-full bg-[var(--color-vermillion)]/10 px-3 py-1 text-xs font-bold text-[var(--color-vermillion)]">
              Association Matrix Clear!
            </span>
            <h2 className="mt-3 text-3xl font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
              見事です！ Outstanding Clear!
            </h2>
            <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">
              You matched all Japanese semantic associations in {formatTime(timerSeconds)}.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 dark:border-white/5 dark:bg-[#1E232B]">
              <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] block">Total Score</span>
              <span className="text-2xl font-bold text-[var(--color-vermillion)]">{score} pts</span>
            </div>
            <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 dark:border-white/5 dark:bg-[#1E232B]">
              <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] block">Max Combo</span>
              <span className="text-2xl font-bold text-orange-500 flex items-center justify-center gap-1">
                <Flame size={20} />
                {maxCombo}x
              </span>
            </div>
            <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 dark:border-white/5 dark:bg-[#1E232B]">
              <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] block">Time Elapsed</span>
              <span className="text-2xl font-bold text-blue-500 flex items-center justify-center gap-1">
                <Clock size={20} />
                {formatTime(timerSeconds)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={handleStartPractice}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-vermillion)] py-3.5 text-xs font-bold text-white transition hover:opacity-90 shadow-md cursor-pointer"
            >
              <RotateCcw size={16} />
              <span>Play Another Round</span>
            </button>
            <Link
              href="/practice"
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-[#FAFAF8] py-3.5 text-xs font-bold text-[#1A1A1A] hover:bg-black/5 dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8] dark:hover:bg-white/5"
            >
              <ArrowLeft size={16} />
              <span>Back to Practice Dojo</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. ACTIVE GAMEPLAY SCREENS
  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in duration-200">
      {/* Top Bar Navigation & Stats */}
      <div className="flex items-center justify-between">
        <Link
          href="/practice"
          className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs font-bold text-[#1A1A1A] shadow-xs transition hover:bg-black/5 dark:border-white/10 dark:bg-[#161B22] dark:text-[#F0F4F8] dark:hover:bg-white/5"
        >
          <ArrowLeft size={14} />
          <span>Exit Matrix</span>
        </Link>

        {/* Live Score, Combo, & Timer */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1 text-xs font-bold text-[#1A1A1A] dark:bg-white/5 dark:text-[#F0F4F8]">
            <Clock size={13} className="text-blue-500" />
            <span>{formatTime(timerSeconds)}</span>
          </div>

          {combo > 1 && (
            <div className="flex items-center gap-1 rounded-full bg-orange-500/15 px-3 py-1 text-xs font-bold text-orange-600 dark:text-orange-400 animate-bounce">
              <Flame size={14} />
              <span>{combo}x Combo!</span>
            </div>
          )}

          <div className="rounded-full bg-[var(--color-vermillion)]/10 px-3 py-1 text-xs font-bold text-[var(--color-vermillion)]">
            {score} pts
          </div>
        </div>
      </div>

      {/* GAMEPLAY MODE 1: MATRIX MATCH */}
      {mode === "matrix_match" && (
        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-[#161B22] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
              Select 2 matching cards (Japanese word & corresponding opposite / pair):
            </span>
            <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
              {cards.filter((c) => c.isMatched).length / 2} / {cards.length / 2} Pairs
            </span>
          </div>

          {/* Matrix Grid Display */}
          <div className={`grid gap-3 ${cards.length === 16 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3"}`}>
            {cards.map((card) => {
              const isSelected = selectedCardId === card.id;
              const isMismatched = mismatchedCardIds.includes(card.id);

              let style =
                "border-black/10 bg-[#FAFAF8] hover:border-[var(--color-vermillion)] hover:bg-[var(--color-vermillion)]/5 text-[#1A1A1A] dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]";

              if (card.isMatched) {
                style =
                  "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 opacity-60 pointer-events-none scale-[0.98]";
              } else if (isMismatched) {
                style =
                  "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300 animate-shake";
              } else if (isSelected) {
                style =
                  "border-[var(--color-vermillion)] bg-[var(--color-vermillion)]/15 text-[var(--color-vermillion)] shadow-md scale-[1.02]";
              }

              return (
                <button
                  key={card.id}
                  type="button"
                  disabled={card.isMatched || isEvaluating}
                  onClick={() => handleCardClick(card)}
                  className={`flex flex-col items-center justify-center min-h-[90px] sm:min-h-[110px] rounded-2xl border p-3 text-center transition-all cursor-pointer ${style}`}
                >
                  <span className="text-xl sm:text-2xl font-bold">{card.text}</span>
                  {card.subText && (
                    <span className="mt-1 text-[11px] text-[#64748B] dark:text-[#94A3B8] line-clamp-1">
                      {card.subText}
                    </span>
                  )}
                  {card.isMatched && (
                    <CheckCircle2 size={14} className="mt-1 text-emerald-500 animate-in zoom-in" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* GAMEPLAY MODE 2: ANTONYM OPPOSITES */}
      {mode === "antonyms_opposites" && antonymQuestions[antonymIndex] && (
        <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-xs dark:border-white/10 dark:bg-[#161B22] space-y-6">
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-[var(--color-vermillion)]/30 bg-[var(--color-vermillion)]/10 px-3 py-0.5 text-xs font-bold text-[var(--color-vermillion)]">
              Opposite Antonym Drill
            </span>
            <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
              {antonymIndex + 1} / {antonymQuestions.length}
            </span>
          </div>

          <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-7 text-center dark:border-white/5 dark:bg-[#1E232B] space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              Target Japanese Word
            </span>
            <div className="flex items-center justify-center gap-3">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
                {antonymQuestions[antonymIndex].pair.wordA.kanji}
              </h2>
              <button
                type="button"
                onClick={() => playJapaneseAudio(antonymQuestions[antonymIndex].pair.wordA.kanji)}
                className="rounded-xl border border-black/10 bg-white p-2 text-[#1A1A1A] shadow-xs hover:text-[var(--color-vermillion)] dark:border-white/10 dark:bg-[#161B22] dark:text-[#F0F4F8]"
              >
                <Volume2 size={16} />
              </button>
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              {antonymQuestions[antonymIndex].pair.wordA.reading} ({antonymQuestions[antonymIndex].pair.wordA.meaning})
            </p>
          </div>

          {/* Antonym 4 Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {antonymQuestions[antonymIndex].options.map((opt) => {
              const isSelected = antonymSelectedOption === opt.kanji;
              const isTarget = opt.kanji === antonymQuestions[antonymIndex].pair.wordB.kanji;

              let style =
                "border-black/10 bg-[#FAFAF8] text-[#1A1A1A] hover:border-[var(--color-vermillion)] hover:bg-[var(--color-vermillion)]/5 dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]";

              if (antonymIsAnswered) {
                if (isTarget) {
                  style = "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shadow-xs";
                } else if (isSelected && !isTarget) {
                  style = "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300";
                } else {
                  style = "opacity-40 border-black/5 bg-[#FAFAF8] dark:bg-[#1E232B] dark:border-white/5";
                }
              }

              return (
                <button
                  key={opt.kanji}
                  type="button"
                  disabled={antonymIsAnswered}
                  onClick={() => handleAntonymSelect(opt)}
                  className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all cursor-pointer ${style}`}
                >
                  <div>
                    <div className="text-xl font-bold">{opt.kanji}</div>
                    <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                      {opt.reading} • {opt.meaning}
                    </div>
                  </div>
                  {antonymIsAnswered && isTarget && <CheckCircle2 size={20} className="text-emerald-500" />}
                  {antonymIsAnswered && isSelected && !isTarget && <XCircle size={20} className="text-rose-500" />}
                </button>
              );
            })}
          </div>

          {antonymIsAnswered && (
            <button
              type="button"
              onClick={handleNextAntonym}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-vermillion)] py-3.5 text-xs font-bold text-white shadow-md transition hover:opacity-90 active:scale-[0.99] cursor-pointer"
            >
              <span>{antonymIndex + 1 >= antonymQuestions.length ? "Finish & View Results" : "Next Word Pair"}</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      )}

      {/* GAMEPLAY MODE 3: CATEGORY SORT */}
      {mode === "category_sort" && categoryQuestions[categoryIndex] && (
        <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-xs dark:border-white/10 dark:bg-[#161B22] space-y-6">
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-[var(--color-vermillion)]/30 bg-[var(--color-vermillion)]/10 px-3 py-0.5 text-xs font-bold text-[var(--color-vermillion)]">
              Semantic Category Sort
            </span>
            <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
              {categoryIndex + 1} / {categoryQuestions.length}
            </span>
          </div>

          <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-7 text-center dark:border-white/5 dark:bg-[#1E232B] space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              Which theme category does this word belong to?
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
              {categoryQuestions[categoryIndex].word}
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              {categoryQuestions[categoryIndex].reading} ({categoryQuestions[categoryIndex].meaning})
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categoryQuestions[categoryIndex].options.map((themeObj) => {
              const isSelected = categorySelectedOption === themeObj.id;
              const isTarget = themeObj.id === categoryQuestions[categoryIndex].correctTheme.id;

              let style =
                "border-black/10 bg-[#FAFAF8] text-[#1A1A1A] hover:border-[var(--color-vermillion)] hover:bg-[var(--color-vermillion)]/5 dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]";

              if (categoryIsAnswered) {
                if (isTarget) {
                  style = "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shadow-xs";
                } else if (isSelected && !isTarget) {
                  style = "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300";
                } else {
                  style = "opacity-40 border-black/5 bg-[#FAFAF8] dark:bg-[#1E232B] dark:border-white/5";
                }
              }

              return (
                <button
                  key={themeObj.id}
                  type="button"
                  disabled={categoryIsAnswered}
                  onClick={() => handleCategorySelect(themeObj)}
                  className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all cursor-pointer ${style}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{themeObj.emoji}</span>
                    <div>
                      <div className="text-sm font-bold">{themeObj.name}</div>
                      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] line-clamp-1">
                        {themeObj.description}
                      </div>
                    </div>
                  </div>
                  {categoryIsAnswered && isTarget && <CheckCircle2 size={20} className="text-emerald-500" />}
                  {categoryIsAnswered && isSelected && !isTarget && <XCircle size={20} className="text-rose-500" />}
                </button>
              );
            })}
          </div>

          {categoryIsAnswered && (
            <button
              type="button"
              onClick={handleNextCategory}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-vermillion)] py-3.5 text-xs font-bold text-white shadow-md transition hover:opacity-90 active:scale-[0.99] cursor-pointer"
            >
              <span>{categoryIndex + 1 >= categoryQuestions.length ? "Finish & View Results" : "Next Word"}</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
