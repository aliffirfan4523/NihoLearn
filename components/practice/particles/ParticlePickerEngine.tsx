"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
  Filter,
  Sparkles,
  HelpCircle,
  Eye,
  EyeOff,
  BookOpen,
  Check,
} from "lucide-react";
import { playJapaneseAudio } from "@/lib/audio";
import { HowToPlay } from "@/components/practice/HowToPlay";

type LevelFilter = "ALL" | "N5" | "N4" | "N3";

interface ParticleExercise {
  id: string;
  level: "N5" | "N4" | "N3";
  japanese: string;
  reading: string;
  translation: string;
  correctParticle: string;
  options: string[];
  explanation: string;
}

interface SessionResultItem {
  exercise: ParticleExercise;
  selectedParticle: string;
  isCorrect: boolean;
}

export function ParticlePickerEngine() {
  // Settings & state
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("ALL");
  const [showFurigana, setShowFurigana] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);

  // Content pool fetched from the database
  const [allExercises, setAllExercises] = useState<ParticleExercise[]>([]);
  const [loading, setLoading] = useState(true);

  // Game state
  const [quizPool, setQuizPool] = useState<ParticleExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedParticle, setSelectedParticle] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [sessionResults, setSessionResults] = useState<SessionResultItem[]>([]);
  const [onlyMissedMode, setOnlyMissedMode] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Initialize questions based on level filter
  const startQuiz = useCallback(
    (level: LevelFilter, customPool?: ParticleExercise[]) => {
      const source = customPool ?? (level === "ALL"
        ? allExercises
        : allExercises.filter((ex) => ex.level === level));

      const shuffled = [...source].sort(() => Math.random() - 0.5);
      setQuizPool(shuffled);
      setCurrentIndex(0);
      setSelectedParticle(null);
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
        const res = await fetch("/api/content/particles");
        const json = await res.json();

        if (json.data && Array.isArray(json.data) && !cancelled) {
          setAllExercises(json.data as ParticleExercise[]);
        }
      } catch (err) {
        console.error("Failed to load particle exercises:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const currentExercise = quizPool[currentIndex];

  // Sentence with blank replaced
  const fullSentenceWithCorrect = useMemo(() => {
    if (!currentExercise) return "";
    return currentExercise.japanese.replace("[blank]", currentExercise.correctParticle);
  }, [currentExercise]);

  const fullSentenceWithSelected = useMemo(() => {
    if (!currentExercise || !selectedParticle) return "";
    return currentExercise.japanese.replace("[blank]", selectedParticle);
  }, [currentExercise, selectedParticle]);

  // Audio Playback
  const handlePlayAudio = useCallback(
    (text?: string) => {
      const textToSpeak = text || fullSentenceWithCorrect;
      if (textToSpeak) {
        playJapaneseAudio(textToSpeak);
      }
    },
    [fullSentenceWithCorrect]
  );

  // Handle particle option selection
  const handleSelectParticle = (particle: string) => {
    if (status !== "idle" || !currentExercise) return;

    setSelectedParticle(particle);
    const isCorrect = particle === currentExercise.correctParticle;

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
        selectedParticle: particle,
        isCorrect,
      },
    ]);

    if (autoPlayAudio) {
      playJapaneseAudio(
        currentExercise.japanese.replace("[blank]", currentExercise.correctParticle)
      );
    }
  };

  // Next Question
  const handleNext = () => {
    if (currentIndex + 1 < quizPool.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedParticle(null);
      setStatus("idle");
    } else {
      setIsFinished(true);
    }
  };

  // Keyboard shortcut handler (1-4 keys, Enter to continue)
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

      const keyIndex = parseInt(e.key, 10);
      if (keyIndex >= 1 && keyIndex <= currentExercise.options.length) {
        e.preventDefault();
        handleSelectParticle(currentExercise.options[keyIndex - 1]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, isFinished, currentExercise, currentIndex, quizPool.length]);

  // Session Logging to /api/sessions on quiz completion
  const loggedRef = useRef(false);
  useEffect(() => {
    if (isFinished && quizPool.length > 0 && !loggedRef.current) {
      loggedRef.current = true;
      const durationMin = Math.max(1, Math.round((Date.now() - startTime) / 60000));
      const accuracy = Math.round((score / quizPool.length) * 100);

      // 1. Batch grammar log
      const grammarBatch = quizPool.map((q) => ({
        grammarId: `particle_${q.id}`,
        level: q.level,
        status: (score / quizPool.length >= 0.7 ? "mastered" : "reviewing") as "mastered" | "reviewing",
        notes: `Particle picker: ${q.correctParticle}`,
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
          activities: ["particles", "grammar"],
          wordsReviewed: quizPool.length,
          notes: JSON.stringify({
            mode: "particle-picker",
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
        Loading particle exercises from database...
      </div>
    );
  }

  // If pool empty
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

  // ─── FINISHED / STATS VIEW ──────────────────────────────────────────────────
  if (isFinished) {
    const accuracy = Math.round((score / quizPool.length) * 100);
    const missed = sessionResults.filter((r) => !r.isCorrect);

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Results Card */}
        <div className="rounded-2xl border border-black/10 bg-white p-8 text-center shadow-xs dark:border-white/10 dark:bg-[#161B22]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 shadow-sm">
            <Trophy size={40} />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
            Particle Practice Complete!
          </h2>
          <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
            Level: <strong className="text-[#1A1A1A] dark:text-[#FAFAFA]">{levelFilter}</strong> ·
            Mastery overview
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

          {/* Action Buttons */}
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
                onClick={() => {
                  setOnlyMissedMode(true);
                  startQuiz(
                    levelFilter,
                    missed.map((m) => m.exercise)
                  );
                }}
                className="flex-1 min-w-0 sm:min-w-[140px] rounded-2xl border border-red-500/30 bg-red-500/10 py-3 text-xs font-bold text-red-700 dark:text-red-300 transition hover:bg-red-500/20"
              >
                Review {missed.length} Missed
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setOnlyMissedMode(false);
                startQuiz(levelFilter);
              }}
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
            <span>Question Review & Explanations ({sessionResults.length})</span>
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
                      {result.exercise.level} · Q{idx + 1}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      playJapaneseAudio(
                        result.exercise.japanese.replace("[blank]", result.exercise.correctParticle)
                      )
                    }
                    className="flex items-center gap-1 rounded-lg border border-black/5 bg-[#FAFAF8] px-2 py-1 text-[11px] font-semibold text-[#6B6B6B] hover:text-[#1A1A1A] dark:border-white/5 dark:bg-[#1E232B] dark:text-[#A0A0A0] dark:hover:text-white"
                  >
                    <Volume2 size={12} /> Listen
                  </button>
                </div>

                <div className="font-serif text-base font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                  {result.exercise.japanese.replace(
                    "[blank]",
                    `【 ${result.exercise.correctParticle} 】`
                  )}
                </div>

                <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
                  {result.exercise.translation}
                </div>

                <div className="rounded-xl bg-[#FAFAF8] p-3 text-xs leading-relaxed text-[#1A1A1A] dark:bg-[#1E232B] dark:text-[#FAFAFA]">
                  <strong className="text-[#C84B31] dark:text-[#E85C40]">Explanation:</strong>{" "}
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
  const parts = currentExercise.japanese.split("[blank]");

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

        {/* Level Filter Tabs */}
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

        {/* Streak & Counter */}
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
        gameKey="particle-picker"
        steps={[
          "A Japanese sentence appears with a missing particle (は, が, を, に, で...). Pick the correct one from the choices.",
          "Quick keyboard play: press 1–4 to choose an answer, then Enter / Space / → for the next question.",
          "The correct sentence is revealed after each answer, and the full sentence is read aloud — tap the speaker to replay it.",
          "Toggle furigana and the English translation with the eye buttons if you need help reading.",
          "Filter by JLPT level (ALL / N5 / N4 / N3) at the top; correct streaks build your score, and results are shown at the end.",
        ]}
        note="Tip: at 70%+ accuracy the drill marks these particles as mastered in your grammar progress."
      />

      {/* Main Question Card */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8 shadow-xs dark:border-white/10 dark:bg-[#161B22] space-y-6">
        {/* Card Header & Controls */}
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
            JLPT {currentExercise.level} Particle Drill
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
              title="Toggle Furigana Reading"
            >
              ふりがな
            </button>
            <button
              type="button"
              onClick={() => setShowTranslation(!showTranslation)}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
                showTranslation
                  ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"
                  : "border-black/10 text-gray-500 dark:border-white/10"
              }`}
              title="Toggle English Translation"
            >
              EN
            </button>
          </div>
        </div>

        {/* Prompt Sentence Area */}
        <div className="space-y-3 text-center py-4">
          <div className="font-serif text-2xl sm:text-3xl font-bold leading-relaxed text-[#1A1A1A] dark:text-[#FAFAFA] flex flex-wrap items-center justify-center gap-1.5">
            <span>{parts[0]}</span>
            <span
              className={`inline-flex min-w-[54px] items-center justify-center rounded-xl border-2 px-3 py-1 text-center transition-all ${
                status === "idle"
                  ? "border-dashed border-[#C84B31]/60 dark:border-[#E85C40]/60 bg-[#C84B31]/5 dark:bg-[#E85C40]/5 text-[#C84B31] dark:text-[#E85C40] shadow-inner"
                  : status === "correct"
                  ? "border-emerald-500 bg-emerald-500 text-white font-bold"
                  : "border-red-500 bg-red-500 text-white font-bold"
              }`}
            >
              {status === "idle" ? "?" : selectedParticle || currentExercise.correctParticle}
            </span>
            <span>{parts[1]}</span>
          </div>

          {/* Reading Subtitle */}
          {showFurigana && (
            <div className="text-xs sm:text-sm font-medium text-[#6B6B6B] dark:text-[#A0A0A0]">
              {currentExercise.reading.replace(
                "[blank]",
                status === "idle"
                  ? "____"
                  : `【 ${currentExercise.correctParticle} 】`
              )}
            </div>
          )}

          {/* English Translation */}
          {showTranslation && (
            <div className="text-xs sm:text-sm italic text-[#1A1A1A]/80 dark:text-[#FAFAFA]/80">
              &quot;{currentExercise.translation}&quot;
            </div>
          )}

          {/* Audio Pronunciation Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handlePlayAudio()}
              className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-[#FAFAF8] px-4 py-1.5 text-xs font-bold text-[#1A1A1A] shadow-2xs transition hover:border-[#C84B31] dark:border-[#E85C40] dark:border-white/10 dark:bg-[#1E232B] dark:text-[#FAFAFA]"
            >
              <Volume2 size={16} className="text-[#C84B31] dark:text-[#E85C40]" />
              <span>Listen Pronunciation</span>
            </button>
          </div>
        </div>

        {/* 4 Particle Options */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-2">
          {currentExercise.options.map((particle, idx) => {
            const isChosen = selectedParticle === particle;
            const isCorrect = particle === currentExercise.correctParticle;

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
                key={particle + idx}
                type="button"
                disabled={status !== "idle"}
                onClick={() => handleSelectParticle(particle)}
                className={`relative flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all ${btnStyle}`}
              >
                <span className="absolute left-2.5 top-2 text-[10px] font-bold opacity-60">
                  {idx + 1}
                </span>
                <span className="font-serif text-3xl font-bold">{particle}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback Alert & Grammatical Explanation */}
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
                      ? "Correct Particle!"
                      : `Correct particle: 「${currentExercise.correctParticle}」`}
                  </div>
                  <div className="text-xs opacity-80">
                    {status === "correct" ? "+1 streak gained" : "Review rule explanation below"}
                  </div>
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
            <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 text-left text-xs leading-relaxed text-[#1A1A1A] dark:border-white/5 dark:bg-[#1E232B] dark:text-[#FAFAFA] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#C84B31] dark:text-[#E85C40]">
                <Sparkles size={14} />
                <span>Particle Grammar Rule:</span>
              </div>
              <p>{currentExercise.explanation}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Helper Note */}
      <div className="text-center text-[11px] text-[#6B6B6B] dark:text-[#A0A0A0]">
        Press keys <kbd className="rounded bg-black/10 px-1 py-0.5 font-mono dark:bg-white/10">1</kbd>-<kbd className="rounded bg-black/10 px-1 py-0.5 font-mono dark:bg-white/10">4</kbd> to select particle · <kbd className="rounded bg-black/10 px-1 py-0.5 font-mono dark:bg-white/10">Enter</kbd> to continue
      </div>
    </div>
  );
}
