"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  Sparkles,
  BookOpen,
  Check,
  MessageSquareQuote,
  Lightbulb,
} from "lucide-react";
import { playJapaneseAudio } from "@/lib/audio";
import { HowToPlay } from "@/components/practice/HowToPlay";

type LevelFilter = "ALL" | "N5" | "N4" | "N3";

interface GrammarPatternExercise {
  id: string;
  level: "N5" | "N4" | "N3";
  scenario: string;
  sentence: string;
  correctPattern: string;
  options: string[];
  meaning: string;
  explanation: string;
}

interface SessionResultItem {
  exercise: GrammarPatternExercise;
  selectedOption: string;
  isCorrect: boolean;
}

export function GrammarPatternsEngine() {
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("ALL");

  // Content pool fetched from the database
  const [allExercises, setAllExercises] = useState<GrammarPatternExercise[]>([]);
  const [loading, setLoading] = useState(true);

  const [quizPool, setQuizPool] = useState<GrammarPatternExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [sessionResults, setSessionResults] = useState<SessionResultItem[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Initialize quiz pool based on level filter
  const startQuiz = useCallback(
    (level: LevelFilter, customPool?: GrammarPatternExercise[]) => {
      const source =
        customPool ??
        (level === "ALL"
          ? allExercises
          : allExercises.filter((ex) => ex.level === level));

      const shuffled = [...source].sort(() => Math.random() - 0.5);
      setQuizPool(shuffled);
      setCurrentIndex(0);
      setSelectedOption(null);
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
        const res = await fetch("/api/content/grammar-patterns");
        const json = await res.json();

        if (json.data && Array.isArray(json.data) && !cancelled) {
          setAllExercises(json.data as GrammarPatternExercise[]);
        }
      } catch (err) {
        console.error("Failed to load grammar pattern exercises:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const currentExercise = quizPool[currentIndex];

  // Completed sentence audio text
  const getCompletedSentence = (exercise: GrammarPatternExercise, pattern: string) => {
    // Strips the "〜" tilde if present to form a natural sentence
    const cleanPattern = pattern.replace(/^〜/, "");
    return exercise.sentence.replace("___", cleanPattern);
  };

  // Handle option selection
  const handleSelectOption = (option: string) => {
    if (status !== "idle" || !currentExercise) return;

    setSelectedOption(option);
    const isCorrect = option === currentExercise.correctPattern;

    if (isCorrect) {
      setStatus("correct");
      setScore((s) => s + 1);
      setStreak((st) => {
        const next = st + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
    } else {
      setStatus("incorrect");
      setStreak(0);
    }

    setSessionResults((prev) => [
      ...prev,
      {
        exercise: currentExercise,
        selectedOption: option,
        isCorrect,
      },
    ]);

    // Play pronunciation of completed sentence
    playJapaneseAudio(getCompletedSentence(currentExercise, currentExercise.correctPattern));
  };

  // Next Question
  const handleNext = () => {
    if (currentIndex + 1 < quizPool.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setStatus("idle");
    } else {
      setIsFinished(true);
    }
  };

  // Keyboard shortcut listener (1-4 and Enter)
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

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= currentExercise.options.length) {
        e.preventDefault();
        handleSelectOption(currentExercise.options[num - 1]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, isFinished, currentExercise, currentIndex, quizPool.length]);

  // Session Logging to /api/sessions
  const loggedRef = useRef(false);
  useEffect(() => {
    if (isFinished && quizPool.length > 0 && !loggedRef.current) {
      loggedRef.current = true;
      const durationMin = Math.max(1, Math.round((Date.now() - startTime) / 60000));
      const accuracy = Math.round((score / quizPool.length) * 100);

      // 1. Batch grammar log
      const grammarBatch = quizPool.map((q) => ({
        grammarId: `pattern_${q.id}`,
        level: q.level,
        status: (score / quizPool.length >= 0.7 ? "mastered" : "reviewing") as "mastered" | "reviewing",
        notes: `Grammar pattern: ${q.correctPattern}`,
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
          activities: ["grammar-patterns", "grammar"],
          wordsReviewed: quizPool.length * 3,
          notes: JSON.stringify({
            mode: "grammar-patterns",
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
        Loading grammar pattern exercises from database...
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
            Grammar Pattern Matcher Complete!
          </h2>
          <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
            JLPT Grammar structures & contextual usage review
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
                Review {missed.length} Missed
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

        {/* Detailed Breakdown Review */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-[#FAFAFA] flex items-center gap-2">
            <BookOpen size={16} className="text-[#C84B31] dark:text-[#E85C40]" />
            <span>Grammar Pattern Breakdown & Explanations ({sessionResults.length})</span>
          </h3>

          <div className="space-y-3">
            {sessionResults.map((result, idx) => (
              <div
                key={result.exercise.id + idx}
                className="rounded-2xl border border-black/10 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-[#161B22] space-y-2.5"
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
                      {result.exercise.level} · Pattern {idx + 1}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      playJapaneseAudio(
                        getCompletedSentence(result.exercise, result.exercise.correctPattern)
                      )
                    }
                    className="flex items-center gap-1 rounded-lg border border-black/5 bg-[#FAFAF8] px-2 py-1 text-[11px] font-semibold text-[#6B6B6B] hover:text-[#1A1A1A] dark:border-white/5 dark:bg-[#1E232B] dark:text-[#A0A0A0] dark:hover:text-white"
                  >
                    <Volume2 size={12} /> Audio
                  </button>
                </div>

                <div className="text-xs font-medium text-purple-700 dark:text-purple-300">
                  <strong>Scenario:</strong> {result.exercise.scenario}
                </div>

                <div className="font-serif text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                  {getCompletedSentence(result.exercise, result.exercise.correctPattern)}
                </div>

                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Target Pattern: {result.exercise.correctPattern} ({result.exercise.meaning})
                </div>

                <div className="rounded-xl bg-[#FAFAF8] p-3 text-xs leading-relaxed text-[#1A1A1A] dark:bg-[#1E232B] dark:text-[#FAFAFA]">
                  <strong className="text-[#C84B31] dark:text-[#E85C40]">Rule Breakdown:</strong>{" "}
                  {result.exercise.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── ACTIVE EXERCISE VIEW ───────────────────────────────────────────────────
  const parts = currentExercise.sentence.split("___");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Top Header & Navigation */}
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

      <HowToPlay
        gameKey="grammar-patterns"
        steps={[
          "Read the conversational scenario, then pick the grammar pattern that correctly fills the blank in the Japanese sentence.",
          "Click an option or press keys 1-4 — the completed sentence is pronounced the moment you answer.",
          "Each answer reveals the pattern rule and its nuance; click Continue or press Enter to move on.",
          "Correct answers build your streak; a wrong answer resets it. Switch the N5-N3 filter to restart with a fresh set.",
          "At the end you get score, accuracy, and max streak, plus a per-pattern breakdown — replay only the ones you missed.",
        ]}
        note="Tip: the Listen Sentence button reads the completed sentence aloud, so you can judge it by ear before answering."
      />

      {/* Main Question Card */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8 shadow-xs dark:border-white/10 dark:bg-[#161B22] space-y-6">
        {/* Scenario Banner */}
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4 text-xs dark:border-purple-500/30 dark:bg-purple-500/15 space-y-1">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
            <MessageSquareQuote size={14} />
            <span>Conversational Scenario · JLPT {currentExercise.level}</span>
          </div>
          <p className="text-sm font-semibold text-[#1A1A1A] dark:text-[#FAFAFA]">
            {currentExercise.scenario}
          </p>
        </div>

        {/* Target Sentence Area */}
        <div className="text-center py-2 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
            Complete with the correct grammar pattern:
          </div>

          <div className="font-serif text-2xl sm:text-3xl font-bold leading-relaxed text-[#1A1A1A] dark:text-[#FAFAFA] flex flex-wrap items-center justify-center gap-1.5">
            <span>{parts[0]}</span>
            <span
              className={`inline-flex min-w-[90px] items-center justify-center rounded-xl border-2 px-3 py-1 text-center transition-all ${
                status === "idle"
                  ? "border-dashed border-[#C84B31]/60 dark:border-[#E85C40]/60 bg-[#C84B31]/5 dark:bg-[#E85C40]/5 text-[#C84B31] dark:text-[#E85C40] shadow-inner"
                  : status === "correct"
                  ? "border-emerald-500 bg-emerald-500 text-white font-bold"
                  : "border-red-500 bg-red-500 text-white font-bold"
              }`}
            >
              {status === "idle"
                ? "____"
                : (selectedOption || currentExercise.correctPattern).replace(/^〜/, "")}
            </span>
            <span>{parts[1]}</span>
          </div>

          {/* Audio Pronunciation helper button */}
          <div>
            <button
              type="button"
              onClick={() =>
                playJapaneseAudio(
                  getCompletedSentence(currentExercise, currentExercise.correctPattern)
                )
              }
              className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-[#FAFAF8] px-4 py-1.5 text-xs font-bold text-[#1A1A1A] shadow-2xs transition hover:border-[#C84B31] dark:border-[#E85C40] dark:border-white/10 dark:bg-[#1E232B] dark:text-[#FAFAFA]"
            >
              <Volume2 size={16} className="text-[#C84B31] dark:text-[#E85C40]" />
              <span>Listen Sentence</span>
            </button>
          </div>
        </div>

        {/* 4 Pattern Options */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2">
          {currentExercise.options.map((option, idx) => {
            const isChosen = selectedOption === option;
            const isCorrect = option === currentExercise.correctPattern;

            let btnStyle =
              "border-black/10 bg-[#FAFAF8] text-[#1A1A1A] hover:border-[#C84B31] dark:border-[#E85C40] hover:bg-black/5 dark:border-white/10 dark:bg-[#1E232B] dark:text-[#FAFAFA] dark:hover:bg-white/5";

            if (status !== "idle") {
              if (isCorrect) {
                btnStyle =
                  "border-emerald-500 bg-emerald-500 text-white font-bold scale-[1.02] shadow-md";
              } else if (isChosen && !isCorrect) {
                btnStyle = "border-red-500 bg-red-500 text-white font-bold";
              } else {
                btnStyle = "opacity-40 border-black/5 dark:border-white/5";
              }
            }

            return (
              <button
                key={option + idx}
                type="button"
                disabled={status !== "idle"}
                onClick={() => handleSelectOption(option)}
                className={`relative flex items-center justify-between rounded-2xl border p-4 text-left font-serif text-lg font-bold transition-all shadow-xs ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-black/5 text-xs font-mono font-bold dark:bg-white/10">
                    {idx + 1}
                  </span>
                  <span>{option}</span>
                </div>
                {status !== "idle" && isCorrect && (
                  <CheckCircle2 size={18} className="text-white" />
                )}
                {status !== "idle" && isChosen && !isCorrect && (
                  <XCircle size={18} className="text-white" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback Alert & Grammar Rule Breakdown */}
        {status !== "idle" && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
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
                      ? "Correct Grammar Pattern!"
                      : `Target Pattern: ${currentExercise.correctPattern}`}
                  </div>
                  <div className="text-xs opacity-80">{currentExercise.meaning}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                autoFocus
                className="flex items-center gap-1.5 rounded-xl bg-black px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:opacity-90 dark:bg-white dark:text-black"
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Explanation box */}
            <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 text-left text-xs leading-relaxed text-[#1A1A1A] dark:border-white/5 dark:bg-[#1E232B] dark:text-[#FAFAFA] space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[#C84B31] dark:text-[#E85C40]">
                <Lightbulb size={14} />
                <span>Pattern Rule & Nuance:</span>
              </div>
              <p>{currentExercise.explanation}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Instructions */}
      <div className="text-center text-[11px] text-[#6B6B6B] dark:text-[#A0A0A0]">
        Press keys <kbd className="rounded bg-black/10 px-1 py-0.5 font-mono dark:bg-white/10">1</kbd>-<kbd className="rounded bg-black/10 px-1 py-0.5 font-mono dark:bg-white/10">4</kbd> to pick pattern · <kbd className="rounded bg-black/10 px-1 py-0.5 font-mono dark:bg-white/10">Enter</kbd> to continue
      </div>
    </div>
  );
}
