"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Flame,
  Trophy,
  HelpCircle,
  Check,
  X,
  Layers,
  MapPin,
  Utensils,
  Train,
  ShieldAlert,
  Building,
} from "lucide-react";
import { playJapaneseAudio } from "@/lib/audio";
import { JapaneseLoader } from "@/components/ui/JapaneseLoader";
import { HowToPlay } from "@/components/practice/HowToPlay";

interface KanjiContextSnippet {
  id: string;
  level: "N5" | "N4" | "N3";
  domain: "Transit" | "Shopping & Food" | "Public Notice" | "Workplace & Study" | "Weather & Safety";
  domainEmoji: string;
  scenarioTitle: string;
  snippetText: string;
  targetKanji: string;
  targetReading: string;
  targetMeaning: string;
  kanjiBreakdown: Array<{
    char: string;
    onyomi: string;
    kunyomi: string;
    meaning: string;
  }>;
  contextQuestion: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  readingQuestion: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export function KanjiContextEngine() {
  // Config
  const [level, setLevel] = useState<string>("ALL");
  const [questionCount, setQuestionCount] = useState<number>(5);

  // Snippet pool fetched from the database
  const [dataset, setDataset] = useState<KanjiContextSnippet[]>([]);
  const [isDatasetLoading, setIsDatasetLoading] = useState<boolean>(true);

  // Session state
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [snippets, setSnippets] = useState<KanjiContextSnippet[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Per-snippet sub-question states (Step 1: Meaning in Context, Step 2: Reading of Compound)
  const [step, setStep] = useState<"context_meaning" | "reading">("context_meaning");
  const [selectedMeaningIndex, setSelectedMeaningIndex] = useState<number | null>(null);
  const [selectedReadingIndex, setSelectedReadingIndex] = useState<number | null>(null);
  const [isMeaningAnswered, setIsMeaningAnswered] = useState<boolean>(false);
  const [isReadingAnswered, setIsReadingAnswered] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Stats
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [history, setHistory] = useState<
    Array<{
      snippet: KanjiContextSnippet;
      isMeaningCorrect: boolean;
      isReadingCorrect: boolean;
    }>
  >([]);

  // Fetch the kanji context scenarios from the database on mount
  useEffect(() => {
    fetch("/api/content/kanji-context")
      .then((res) => res.json())
      .then((json) => {
        setDataset(json.data || []);
        setIsDatasetLoading(false);
      })
      .catch(() => {
        setDataset([]);
        setIsDatasetLoading(false);
      });
  }, []);

  // Start Session
  const handleStartPractice = useCallback(async () => {
    setIsLoading(true);
    try {
      const pool = dataset.filter((s) => level === "ALL" || s.level === level);
      const shuffled = [...(pool.length > 0 ? pool : dataset)]
        .sort(() => Math.random() - 0.5)
        .slice(0, questionCount);

      setSnippets(shuffled);
      setCurrentIndex(0);
      setStep("context_meaning");
      setSelectedMeaningIndex(null);
      setSelectedReadingIndex(null);
      setIsMeaningAnswered(false);
      setIsReadingAnswered(false);
      setScore(0);
      setStreak(0);
      setMaxStreak(0);
      setHistory([]);
      setIsFinished(false);
      setIsSessionActive(true);
    } catch (err) {
      console.error("Failed to prepare kanji context drills:", err);
    } finally {
      setIsLoading(false);
    }
  }, [level, questionCount, dataset]);

  const currentSnippet = snippets[currentIndex] || null;

  // Handle Step 1 Answer (Context Meaning)
  const handleSelectMeaning = (idx: number) => {
    if (isMeaningAnswered || !currentSnippet) return;

    const isRight = idx === currentSnippet.contextQuestion.correctIndex;
    setSelectedMeaningIndex(idx);
    setIsMeaningAnswered(true);

    if (isRight) {
      setScore((s) => s + 1);
      setStreak((prev) => {
        const next = prev + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
      playJapaneseAudio(currentSnippet.targetKanji);
    } else {
      setStreak(0);
    }
  };

  // Handle Step 2 Answer (Reading of Compound)
  const handleSelectReading = (idx: number) => {
    if (isReadingAnswered || !currentSnippet) return;

    const isRight = idx === currentSnippet.readingQuestion.correctIndex;
    setSelectedReadingIndex(idx);
    setIsReadingAnswered(true);

    if (isRight) {
      setScore((s) => s + 1);
      setStreak((prev) => {
        const next = prev + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
      playJapaneseAudio(currentSnippet.targetReading);
    } else {
      setStreak(0);
    }

    // Record to history
    const isMeaningCorrect = selectedMeaningIndex === currentSnippet.contextQuestion.correctIndex;
    setHistory((h) => [
      ...h,
      {
        snippet: currentSnippet,
        isMeaningCorrect,
        isReadingCorrect: isRight,
      },
    ]);
  };

  // Next Snippet
  const handleNextSnippet = () => {
    if (currentIndex + 1 >= snippets.length) {
      setIsFinished(true);
      logStudySession();
      return;
    }

    setCurrentIndex((i) => i + 1);
    setStep("context_meaning");
    setSelectedMeaningIndex(null);
    setSelectedReadingIndex(null);
    setIsMeaningAnswered(false);
    setIsReadingAnswered(false);
  };

  // Log session
  const logStudySession = () => {
    fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        durationMinutes: Math.max(1, Math.round(snippets.length * 0.5)),
        level,
        activities: JSON.stringify(["kanji", "reading"]),
        kanjiReviewed: snippets.length,
        notes: `Completed Kanji in Context Practice (${score}/${snippets.length * 2} points).`,
      }),
    }).catch(() => {});
  };

  // Highlight Target Kanji inside snippet
  const renderSnippetWithHighlight = (snippetText: string, targetKanji: string) => {
    const parts = snippetText.split(targetKanji);
    if (parts.length === 1) return <span>{snippetText}</span>;

    return (
      <span className="leading-relaxed">
        {parts[0]}
        <span className="inline-block px-2 py-0.5 mx-1 rounded-xl bg-[var(--color-vermillion)]/15 border border-[var(--color-vermillion)]/40 font-bold text-[var(--color-vermillion)] shadow-xs animate-pulse">
          {targetKanji}
        </span>
        {parts[1]}
      </span>
    );
  };

  // Domain Icon helper
  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case "Transit":
        return <Train size={16} className="text-blue-500" />;
      case "Shopping & Food":
        return <Utensils size={16} className="text-amber-500" />;
      case "Weather & Safety":
        return <ShieldAlert size={16} className="text-rose-500" />;
      default:
        return <Building size={16} className="text-purple-500" />;
    }
  };

  // 0. SNIPPET POOL LOADING STATE
  if (!isSessionActive && isDatasetLoading) {
    return <JapaneseLoader message="Loading kanji context scenarios..." />;
  }

  // 1. SETUP SCREEN
  if (!isSessionActive) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 animate-in fade-in duration-200">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--color-vermillion)]/10 text-[var(--color-vermillion)]">
            <FileText size={28} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#F0F4F8]">
            Kanji in Real-World Context
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
            Deduce readings and meanings of kanji compounds (Jukugo) from authentic signs, transit notices, and menus.
          </p>
        </div>

        <HowToPlay
          gameKey="kanji-context"
          steps={[
            "Each round shows a real-world snippet (a sign, notice, or menu) with one kanji compound highlighted inside it.",
            "Step 1: pick what the highlighted compound means in this context from the answer choices.",
            "Step 2 unlocks right after: choose the compound's correct reading (pronunciation) from the options.",
            "Every correct answer is worth 1 point and extends your streak; each scenario offers 2 points, and a miss resets the streak.",
            "After both steps, study the jukugo breakdown (each kanji with its onyomi and meaning) before moving to the next scenario.",
          ]}
          note="Tip: press the Audio button on a scenario to hear the whole snippet read aloud before you commit to an answer."
        />

        <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-xs dark:border-white/10 dark:bg-[#161B22] space-y-6">
          {/* JLPT Level Selection */}
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

          {/* Snippet Count */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              Snippets per Session
            </label>
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              {[3, 5, 8].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  className={`rounded-2xl py-2.5 text-xs font-bold transition ${
                    questionCount === count
                      ? "bg-[var(--color-vermillion)] text-white shadow-xs"
                      : "border border-black/10 bg-[#FAFAF8] text-[#1A1A1A] hover:bg-black/5 dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]"
                  }`}
                >
                  {count} Scenarios
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            type="button"
            onClick={handleStartPractice}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-vermillion)] py-4 text-sm font-bold text-white shadow-md transition hover:opacity-90 active:scale-[0.99] cursor-pointer"
          >
            {isLoading ? (
              <span>Loading Contexts...</span>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Start Kanji Context Practice</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // 2. LOADING STATE
  if (isLoading || !currentSnippet) {
    return <JapaneseLoader message="Setting up real-world Japanese scenario snippets..." />;
  }

  // 3. FINISHED / SUMMARY SCREEN
  if (isFinished) {
    const totalPossiblePoints = snippets.length * 2;
    const accuracy = Math.round((score / totalPossiblePoints) * 100);

    return (
      <div className="mx-auto max-w-2xl space-y-6 animate-in fade-in duration-300">
        <div className="rounded-3xl border border-black/10 bg-white p-8 text-center shadow-lg dark:border-white/10 dark:bg-[#161B22] space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--color-vermillion)]/10 text-[var(--color-vermillion)]">
            <Trophy size={40} />
          </div>

          <div>
            <span className="rounded-full bg-[var(--color-vermillion)]/10 px-3 py-1 text-xs font-bold text-[var(--color-vermillion)]">
              Kanji in Context Complete
            </span>
            <h2 className="mt-3 text-3xl font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
              {accuracy >= 80 ? "素晴らしい！ Master of Context!" : accuracy >= 50 ? "よくできました！ Good Deduction!" : "次回も頑張りましょう！"}
            </h2>
            <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">
              You scored {score} out of {totalPossiblePoints} points across context meanings and readings.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 dark:border-white/5 dark:bg-[#1E232B]">
              <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] block">Accuracy</span>
              <span className="text-2xl font-bold text-[var(--color-vermillion)]">{accuracy}%</span>
            </div>
            <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 dark:border-white/5 dark:bg-[#1E232B]">
              <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] block">Max Streak</span>
              <span className="text-2xl font-bold text-orange-500 flex items-center justify-center gap-1">
                <Flame size={20} />
                {maxStreak}
              </span>
            </div>
            <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 dark:border-white/5 dark:bg-[#1E232B]">
              <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] block">Points</span>
              <span className="text-2xl font-bold text-emerald-500">
                {score}/{totalPossiblePoints}
              </span>
            </div>
          </div>

          {/* Scenario Review */}
          <div className="text-left space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              Scenario Compound Review ({history.length})
            </h3>
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-black/10 bg-[#FAFAF8] p-4 text-xs dark:border-white/10 dark:bg-[#1E232B] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--color-vermillion)] text-base">
                      {item.snippet.targetKanji} ({item.snippet.targetReading})
                    </span>
                    <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      {item.snippet.domain}
                    </span>
                  </div>
                  <div className="text-[#1A1A1A] dark:text-[#F0F4F8]">
                    Meaning: {item.snippet.targetMeaning}
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-bold">
                    <span className={item.isMeaningCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                      Meaning: {item.isMeaningCorrect ? "✓ Correct" : "✗ Missed"}
                    </span>
                    <span className={item.isReadingCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                      Reading: {item.isReadingCorrect ? "✓ Correct" : "✗ Missed"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleStartPractice}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-vermillion)] py-3.5 text-xs font-bold text-white transition hover:opacity-90 shadow-md cursor-pointer"
            >
              <RotateCcw size={16} />
              <span>Practice Again</span>
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

  // 4. ACTIVE DRILL SCREEN
  const progressPercent = ((currentIndex + 1) / snippets.length) * 100;

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/practice"
          className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs font-bold text-[#1A1A1A] shadow-xs transition hover:bg-black/5 dark:border-white/10 dark:bg-[#161B22] dark:text-[#F0F4F8] dark:hover:bg-white/5"
        >
          <ArrowLeft size={14} />
          <span>Exit Context</span>
        </Link>

        <div className="flex items-center gap-3">
          {streak > 1 && (
            <div className="flex items-center gap-1 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-600 dark:text-orange-400 animate-bounce">
              <Flame size={14} />
              <span>{streak} Streak!</span>
            </div>
          )}

          <div className="rounded-full bg-black/5 px-3 py-1 text-xs font-bold text-[#1A1A1A] dark:bg-white/5 dark:text-[#F0F4F8]">
            {currentIndex + 1} / {snippets.length}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/5">
        <div
          className="h-full rounded-full bg-[var(--color-vermillion)] transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Scenario Environment Card */}
      <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-xs dark:border-white/10 dark:bg-[#161B22] space-y-6">
        {/* Scenario Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 text-sm">
              {currentSnippet.domainEmoji}
            </span>
            <div>
              <span className="font-bold text-xs text-[#1A1A1A] dark:text-[#F0F4F8] block">
                {currentSnippet.scenarioTitle}
              </span>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Domain: {currentSnippet.domain} • JLPT {currentSnippet.level}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => playJapaneseAudio(currentSnippet.snippetText)}
            className="flex items-center gap-1.5 rounded-xl border border-black/10 bg-[#FAFAF8] px-3 py-1.5 text-xs font-bold text-[#1A1A1A] transition hover:bg-[var(--color-vermillion)]/10 hover:text-[var(--color-vermillion)] dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]"
          >
            <Volume2 size={15} />
            <span>Audio</span>
          </button>
        </div>

        {/* Snippet Notice Board Style */}
        <div className="rounded-2xl border-2 border-black/10 bg-[#FAFAF8] p-6 text-lg sm:text-xl font-medium text-[#1A1A1A] dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8] text-center shadow-inner">
          {renderSnippetWithHighlight(currentSnippet.snippetText, currentSnippet.targetKanji)}
        </div>

        {/* STEP 1: CONTEXTUAL MEANING QUESTION */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              Step 1: Contextual Meaning
            </span>
            {isMeaningAnswered && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                ✓ Meaning Checked
              </span>
            )}
          </div>
          <p className="text-sm font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
            {currentSnippet.contextQuestion.prompt}
          </p>

          <div className="grid grid-cols-1 gap-2">
            {currentSnippet.contextQuestion.options.map((opt, idx) => {
              const isSelected = selectedMeaningIndex === idx;
              const isTarget = idx === currentSnippet.contextQuestion.correctIndex;

              let style =
                "border-black/10 bg-[#FAFAF8] text-[#1A1A1A] hover:border-[var(--color-vermillion)] dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]";

              if (isMeaningAnswered) {
                if (isTarget) {
                  style = "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold";
                } else if (isSelected && !isTarget) {
                  style = "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300";
                } else {
                  style = "opacity-40 border-black/5";
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isMeaningAnswered}
                  onClick={() => handleSelectMeaning(idx)}
                  className={`flex items-center justify-between rounded-xl border p-3.5 text-left text-xs transition cursor-pointer ${style}`}
                >
                  <span>{opt}</span>
                  {isMeaningAnswered && isTarget && <CheckCircle2 size={16} className="text-emerald-500" />}
                  {isMeaningAnswered && isSelected && !isTarget && <XCircle size={16} className="text-rose-500" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: READING SELECTION (Unlocked after step 1) */}
        {isMeaningAnswered && (
          <div className="space-y-3 pt-4 border-t border-black/5 dark:border-white/5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                Step 2: Jukugo Pronunciation & Reading
              </span>
              {isReadingAnswered && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  ✓ Reading Checked
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
              {currentSnippet.readingQuestion.prompt}
            </p>

            <div className="grid grid-cols-2 gap-2">
              {currentSnippet.readingQuestion.options.map((opt, idx) => {
                const isSelected = selectedReadingIndex === idx;
                const isTarget = idx === currentSnippet.readingQuestion.correctIndex;

                let style =
                  "border-black/10 bg-[#FAFAF8] text-[#1A1A1A] hover:border-[var(--color-vermillion)] dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]";

                if (isReadingAnswered) {
                  if (isTarget) {
                    style = "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold";
                  } else if (isSelected && !isTarget) {
                    style = "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300";
                  } else {
                    style = "opacity-40 border-black/5";
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isReadingAnswered}
                    onClick={() => handleSelectReading(idx)}
                    className={`flex items-center justify-between rounded-xl border p-3.5 text-center text-sm font-bold transition cursor-pointer ${style}`}
                  >
                    <span>{opt}</span>
                    {isReadingAnswered && isTarget && <CheckCircle2 size={16} className="text-emerald-500" />}
                    {isReadingAnswered && isSelected && !isTarget && <XCircle size={16} className="text-rose-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Jukugo Compound Breakdown Card (Revealed after answering both) */}
        {isReadingAnswered && (
          <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-5 dark:border-white/5 dark:bg-[#1E232B] space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              <Layers size={14} className="text-[var(--color-vermillion)]" />
              <span>Jukugo Compound Breakdown</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {currentSnippet.kanjiBreakdown.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-black/5 bg-white p-3 text-center dark:border-white/5 dark:bg-[#161B22] space-y-1"
                >
                  <div className="text-2xl font-bold text-[var(--color-vermillion)]">{item.char}</div>
                  <div className="text-[11px] font-semibold text-[#1A1A1A] dark:text-[#F0F4F8]">
                    {item.onyomi}
                  </div>
                  <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                    {item.meaning}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-xs text-[#64748B] dark:text-[#94A3B8] pt-1">
              💡 {currentSnippet.contextQuestion.explanation}
            </div>

            <button
              type="button"
              onClick={handleNextSnippet}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-vermillion)] py-3.5 text-xs font-bold text-white shadow-md transition hover:opacity-90 active:scale-[0.99] cursor-pointer"
            >
              <span>{currentIndex + 1 >= snippets.length ? "Finish & View Results" : "Next Scenario (Enter)"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
