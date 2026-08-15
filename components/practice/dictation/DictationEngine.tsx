"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Headphones,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Trophy,
  Flame,
  HelpCircle,
  Gauge,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { DICTATION_EXERCISES, type DictationExercise } from "@/lib/data/practice-content";
import { playJapaneseAudio } from "@/lib/audio";
import { verifyDictationInput, romajiToHiragana, sfx, type DiffChar } from "@/lib/japanese-utils";

export function DictationEngine() {
  const [selectedLevel, setSelectedLevel] = useState<"ALL" | "N5" | "N4" | "N3">("ALL");
  const [exercises, setExercises] = useState<DictationExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [playbackSpeed, setPlaybackSpeed] = useState<0.75 | 1 | 1.25>(1);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playCount, setPlayCount] = useState(0);

  // Status & Verification state
  const [status, setStatus] = useState<"idle" | "evaluating" | "answered">("idle");
  const [isCorrect, setIsCorrect] = useState(false);
  const [diffResult, setDiffResult] = useState<DiffChar[]>([]);
  const [matchScore, setMatchScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  // Stats
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [history, setHistory] = useState<
    Array<{
      exercise: DictationExercise;
      userInput: string;
      isCorrect: boolean;
      score: number;
    }>
  >([]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize exercises on level change
  useEffect(() => {
    let pool = [...DICTATION_EXERCISES];
    if (selectedLevel !== "ALL") {
      pool = pool.filter((e) => e.level === selectedLevel);
    }
    const shuffled = pool.sort(() => Math.random() - 0.5);
    setExercises(shuffled);
    setCurrentIndex(0);
    setUserInput("");
    setStatus("idle");
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setIsFinished(false);
    setHistory([]);
    setPlayCount(0);
    setShowHint(false);
    setShowTranslation(false);
  }, [selectedLevel]);

  const currentExercise = exercises[currentIndex];

  // Play audio function with rate control
  const handlePlayAudio = (rateOverride?: number) => {
    if (!currentExercise) return;
    const rate = rateOverride || (playbackSpeed === 0.75 ? 0.7 : playbackSpeed === 1.25 ? 1.15 : 0.85);

    setIsPlayingAudio(true);
    setPlayCount((p) => p + 1);

    playJapaneseAudio(currentExercise.audioPrompt || currentExercise.reading, {
      rate,
      onEnd: () => setIsPlayingAudio(false),
    });

    // Fallback reset if audio onEnd doesn't fire
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 4500);
  };

  // Auto-play audio upon question change
  useEffect(() => {
    if (currentExercise && !isFinished && status === "idle") {
      const timer = setTimeout(() => {
        handlePlayAudio();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentExercise, isFinished]);

  // Focus input automatically
  useEffect(() => {
    if (status === "idle" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, status]);

  // Handle Verify Submission
  const handleVerify = () => {
    if (!currentExercise || status !== "idle" || !userInput.trim()) return;

    setStatus("evaluating");
    const result = verifyDictationInput(userInput, currentExercise);

    setIsCorrect(result.isMatch);
    setDiffResult(result.bestDiff);
    setMatchScore(result.score);
    setStatus("answered");

    if (result.isMatch) {
      sfx.playCorrect();
      setScore((s) => s + 1);
      setStreak((st) => {
        const next = st + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
    } else {
      sfx.playWrong();
      setStreak(0);
    }

    setHistory((prev) => [
      ...prev,
      {
        exercise: currentExercise,
        userInput,
        isCorrect: result.isMatch,
        score: result.score,
      },
    ]);
  };

  // Next Question
  const handleNext = () => {
    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex((i) => i + 1);
      setUserInput("");
      setStatus("idle");
      setDiffResult([]);
      setMatchScore(0);
      setShowHint(false);
      setShowTranslation(false);
      setPlayCount(0);
    } else {
      setIsFinished(true);
    }
  };

  // Session Logging on Finish
  useEffect(() => {
    if (isFinished && exercises.length > 0) {
      const accuracy = Math.round((score / exercises.length) * 100);
      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationMinutes: Math.max(1, Math.round((exercises.length * 15) / 60)),
          level: selectedLevel === "ALL" ? "N5" : selectedLevel,
          activities: ["dictation", "listening", "transcription"],
          wordsReviewed: exercises.length,
          notes: JSON.stringify({
            score,
            total: exercises.length,
            accuracy,
            maxStreak,
            level: selectedLevel,
          }),
        }),
      }).catch(() => {});
    }
  }, [isFinished, score, exercises.length, selectedLevel, maxStreak]);

  // Romaji-to-Hiragana live typing helper
  const handleInputChange = (val: string) => {
    setUserInput(val);
  };

  // Convert current input to Hiragana
  const handleConvertToKana = () => {
    setUserInput((prev) => romajiToHiragana(prev));
  };

  if (exercises.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
        Loading dictation exercises...
      </div>
    );
  }

  // ── Finished Summary View ──
  if (isFinished) {
    const accuracy = Math.round((score / exercises.length) * 100);

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-3xl border border-black/10 bg-white p-8 text-center shadow-xl dark:border-white/15 dark:bg-[#1A1A1A]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/15 text-amber-500 shadow-xs">
            <Trophy size={40} />
          </div>

          <h2 className="mt-5 text-3xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
            Dictation Session Complete!
          </h2>
          <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
            Outstanding listening transcription practice. Here is your summary:
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-[#FAFAF8] p-4 text-center dark:bg-[#2A2A2A]">
            <div>
              <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Score</div>
              <div className="mt-1 font-mono text-2xl font-bold text-[#C84B31] dark:text-[#E85C40]">
                {score} / {exercises.length}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Accuracy</div>
              <div className="mt-1 font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {accuracy}%
              </div>
            </div>
            <div>
              <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Max Streak</div>
              <div className="mt-1 font-mono text-2xl font-bold text-purple-600 dark:text-purple-400">
                {maxStreak} 🔥
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="mt-6 space-y-3 text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
              Sentence Review ({history.length})
            </h3>
            <div className="max-h-72 space-y-2.5 overflow-y-auto pr-1">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-black/5 bg-[#FAFAF8] p-3.5 dark:border-white/5 dark:bg-[#222222]"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {item.isCorrect ? (
                        <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
                      ) : (
                        <XCircle size={16} className="shrink-0 text-rose-500" />
                      )}
                      <span className="font-serif text-sm font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                        {item.exercise.japanese}
                      </span>
                    </div>
                    <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
                      Your input:{" "}
                      <span
                        className={
                          item.isCorrect
                            ? "font-medium text-emerald-700 dark:text-emerald-300"
                            : "font-medium text-rose-600 dark:text-rose-400"
                        }
                      >
                        {item.userInput || "(blank)"}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      {item.exercise.translation}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => playJapaneseAudio(item.exercise.audioPrompt || item.exercise.reading)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/5 text-[#1A1A1A] transition hover:bg-[#C84B31] hover:text-white dark:bg-white/10 dark:text-[#FAFAFA] dark:hover:bg-[#E85C40]"
                    title="Replay Audio"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-7 flex gap-3">
            <Link
              href="/practice"
              className="flex-1 rounded-2xl border border-black/10 bg-[#FAFAF8] py-3.5 text-center text-sm font-bold text-[#1A1A1A] transition hover:bg-black/5 dark:border-white/15 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]"
            >
              Practice Dojo
            </Link>
            <button
              type="button"
              onClick={() => {
                const shuffled = [...exercises].sort(() => Math.random() - 0.5);
                setExercises(shuffled);
                setCurrentIndex(0);
                setUserInput("");
                setStatus("idle");
                setScore(0);
                setStreak(0);
                setMaxStreak(0);
                setIsFinished(false);
                setHistory([]);
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#C84B31] py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#b03e26] dark:bg-[#E85C40]"
            >
              <RotateCcw size={16} />
              <span>Practice Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/practice"
          className="flex items-center gap-1.5 text-xs font-semibold text-[#6B6B6B] transition hover:text-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:text-[#FAFAFA]"
        >
          <ArrowLeft size={16} /> Practice Dojo
        </Link>

        {/* Level Filters */}
        <div className="flex items-center gap-1 rounded-xl bg-black/5 p-1 dark:bg-white/10">
          {(["ALL", "N5", "N4", "N3"] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setSelectedLevel(lvl)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                selectedLevel === lvl
                  ? "bg-[#C84B31] text-white shadow-2xs dark:bg-[#E85C40]"
                  : "text-[#6B6B6B] hover:text-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:text-[#FAFAFA]"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Streak Indicator */}
        <div className="flex items-center gap-1 rounded-xl bg-orange-500/15 px-2.5 py-1 text-xs font-bold text-orange-600 dark:text-orange-400">
          <Flame size={15} />
          <span>{streak}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold text-[#6B6B6B] dark:text-[#A0A0A0]">
          <span>
            Sentence {currentIndex + 1} of {exercises.length}
          </span>
          <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
            {currentExercise.level}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#E5E5E5] dark:bg-[#2A2A2A]">
          <div
            className="h-full bg-[#C84B31] transition-all duration-300 dark:bg-[#E85C40]"
            style={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Dictation Studio Card */}
      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/15 dark:bg-[#1A1A1A] sm:p-8">
        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
            Audio Dictation Trainer
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Listen carefully and type the sentence in Japanese Kana/Kanji or Romaji.
          </p>

          {/* Big Audio Playback Control Area */}
          <div className="my-7 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              {isPlayingAudio && (
                <div className="absolute -inset-3 animate-ping rounded-full bg-amber-400/30" />
              )}
              <button
                type="button"
                onClick={() => handlePlayAudio()}
                disabled={isPlayingAudio}
                className={`relative flex h-24 w-24 items-center justify-center rounded-3xl shadow-xl transition hover:scale-105 active:scale-95 ${
                  isPlayingAudio
                    ? "bg-amber-600 text-white animate-pulse"
                    : "bg-amber-500 text-white hover:bg-amber-600"
                }`}
                aria-label="Play spoken sentence"
              >
                <Volume2 size={44} />
              </button>
            </div>

            {/* Variable Speed Pills */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] font-bold text-[#6B6B6B] dark:text-[#A0A0A0]">
                <Gauge size={13} /> Speed:
              </span>
              {([0.75, 1, 1.25] as const).map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => {
                    setPlaybackSpeed(spd);
                    handlePlayAudio(spd === 0.75 ? 0.7 : spd === 1.25 ? 1.15 : 0.85);
                  }}
                  className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${
                    playbackSpeed === spd
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                      : "border border-black/10 bg-[#FAFAF8] text-[#6B6B6B] hover:bg-black/5 dark:border-white/15 dark:bg-[#2A2A2A] dark:text-[#A0A0A0]"
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            <div className="text-[11px] text-[#6B6B6B] dark:text-[#A0A0A0]">
              Played: {playCount} time{playCount !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Typing Input Box */}
          <div className="space-y-3">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (status === "idle") handleVerify();
                    else if (status === "answered") handleNext();
                  }
                }}
                disabled={status !== "idle"}
                placeholder="Type Japanese reading or romaji..."
                autoComplete="off"
                autoCapitalize="off"
                spellCheck="false"
                className="w-full rounded-2xl border-2 border-black/15 bg-[#FAFAF8] px-4 py-4 text-center font-serif text-lg font-medium text-[#1A1A1A] placeholder:font-sans placeholder:text-sm placeholder:text-gray-400 focus:border-[#C84B31] focus:outline-none focus:ring-4 focus:ring-[#C84B31]/15 dark:border-white/15 dark:bg-[#2A2A2A] dark:text-[#FAFAFA] dark:focus:border-[#E85C40] dark:focus:ring-[#E85C40]/20 sm:text-xl"
              />
            </div>

            {/* Quick Action Helpers */}
            {status === "idle" && (
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleConvertToKana}
                  className="flex items-center gap-1 rounded-lg border border-black/10 bg-[#FAFAF8] px-2.5 py-1 font-semibold text-gray-700 hover:bg-black/5 dark:border-white/15 dark:bg-[#2A2A2A] dark:text-gray-300"
                >
                  <Sparkles size={13} className="text-[#C84B31] dark:text-[#E85C40]" />
                  <span>Convert Romaji → かな</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowHint((h) => !h)}
                    className="flex items-center gap-1 rounded-lg border border-black/10 bg-[#FAFAF8] px-2.5 py-1 font-semibold text-gray-700 hover:bg-black/5 dark:border-white/15 dark:bg-[#2A2A2A] dark:text-gray-300"
                  >
                    <HelpCircle size={13} className="text-amber-500" />
                    <span>{showHint ? "Hide Hint" : "Hint"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowTranslation((t) => !t)}
                    className="flex items-center gap-1 rounded-lg border border-black/10 bg-[#FAFAF8] px-2.5 py-1 font-semibold text-gray-700 hover:bg-black/5 dark:border-white/15 dark:bg-[#2A2A2A] dark:text-gray-300"
                  >
                    {showTranslation ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>{showTranslation ? "Hide English" : "Show English"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Hint Display */}
            {showHint && currentExercise.hint && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-left text-xs text-amber-900 dark:text-amber-300 animate-in fade-in duration-150">
                💡 <strong>Hint:</strong> {currentExercise.hint} (Starts with:{" "}
                <span className="font-bold">{currentExercise.reading.slice(0, 2)}</span>)
              </div>
            )}

            {/* English Translation Display */}
            {showTranslation && (
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-left text-xs text-blue-900 dark:text-blue-300 animate-in fade-in duration-150">
                🇬🇧 <strong>English:</strong> {currentExercise.translation}
              </div>
            )}
          </div>

          {/* Action Buttons: Submit / Check */}
          {status === "idle" && (
            <button
              type="button"
              onClick={handleVerify}
              disabled={!userInput.trim()}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#C84B31] py-4 text-base font-bold text-white shadow-md transition hover:bg-[#b03e26] disabled:opacity-40 disabled:pointer-events-none dark:bg-[#E85C40]"
            >
              <Check size={18} />
              <span>Verify Transcript (Enter)</span>
            </button>
          )}

          {/* ── Character-by-Character Diff Feedback ── */}
          {status === "answered" && (
            <div className="mt-6 space-y-4 rounded-2xl border border-black/10 bg-[#FAFAF8] p-5 text-left dark:border-white/15 dark:bg-[#222222] animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 size={20} />
                      <span>Excellent! ({matchScore}% Match)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-sm font-bold text-rose-600 dark:text-rose-400">
                      <XCircle size={20} />
                      <span>Review Needed ({matchScore}% Match)</span>
                    </div>
                  )}
                </div>

                <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-[11px] font-bold dark:bg-white/10">
                  {currentExercise.level}
                </span>
              </div>

              {/* Target Correct Sentence with Furigana */}
              <div className="rounded-xl border border-black/5 bg-white p-3.5 dark:border-white/5 dark:bg-[#1A1A1A]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Target Japanese:
                </div>
                <div className="mt-1 font-serif text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                  {currentExercise.japanese}
                </div>
                <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
                  {currentExercise.reading}
                </div>
                <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {currentExercise.translation}
                </div>
              </div>

              {/* Character Diff Breakdown */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Character Diff Breakdown:
                </div>
                <div className="flex flex-wrap gap-1">
                  {diffResult.map((d, i) => {
                    let badgeClass =
                      "bg-emerald-500/20 text-emerald-800 border-emerald-500/40 dark:text-emerald-300";
                    if (d.type === "missing") {
                      badgeClass =
                        "bg-amber-500/20 text-amber-800 border-amber-500/40 line-through dark:text-amber-300";
                    } else if (d.type === "extra" || d.type === "incorrect") {
                      badgeClass =
                        "bg-rose-500/20 text-rose-800 border-rose-500/40 dark:text-rose-300";
                    }

                    return (
                      <span
                        key={i}
                        className={`inline-flex items-center justify-center rounded-md border px-2 py-1 font-serif text-sm font-bold ${badgeClass}`}
                        title={`Status: ${d.type}`}
                      >
                        {d.char}
                      </span>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                autoFocus
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3.5 text-sm font-bold text-white shadow-md hover:bg-gray-800 dark:bg-white dark:text-black"
              >
                <span>Continue to Next (Enter)</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
