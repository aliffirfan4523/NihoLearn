"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import {
  RotateCw,
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Flame,
  Trophy,
  Keyboard,
  ListFilter,
  Check,
  X,
  Languages,
  BookOpen,
} from "lucide-react";
import { playJapaneseAudio } from "@/lib/audio";
import { JapaneseLoader } from "@/components/ui/JapaneseLoader";
import { VOCAB_THEMES, type VocabTheme } from "@/lib/vocab-themes";
import type { ProgressStatus } from "@/types";
import { HowToPlay } from "@/components/practice/HowToPlay";

export type ReverseMode = "multiple_choice" | "typing";

interface VocabItem {
  id: string;
  word: string;
  reading: string;
  romaji: string;
  meaning: string[];
  level: string;
  partOfSpeech: string;
  status: ProgressStatus;
}

export function ReverseTranslationEngine() {
  // Config
  const [level, setLevel] = useState<string>("N5");
  const [theme, setTheme] = useState<string>("all");
  const [mode, setMode] = useState<ReverseMode>("multiple_choice");
  const [questionCount, setQuestionCount] = useState<number>(10);

  // Session state
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [vocabPool, setVocabPool] = useState<VocabItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [typedInput, setTypedInput] = useState<string>("");
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Stats
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [history, setHistory] = useState<
    Array<{
      item: VocabItem;
      isCorrect: boolean;
      userAnswer: string;
    }>
  >([]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Start Session
  const handleStartPractice = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = level === "ALL" ? `/api/vocab?limit=300` : `/api/vocab?level=${level}&limit=300`;
      const res = await fetch(url);
      const json = await res.json();
      let list: VocabItem[] = json.data || [];

      // Fallback if empty
      if (list.length === 0) {
        list = [
          { id: "v1", word: "食べる", reading: "たべる", romaji: "taberu", meaning: ["to eat"], level: "N5", partOfSpeech: "verb", status: "unlearned" },
          { id: "v2", word: "飲む", reading: "のむ", romaji: "nomu", meaning: ["to drink"], level: "N5", partOfSpeech: "verb", status: "unlearned" },
          { id: "v3", word: "本", reading: "ほん", romaji: "hon", meaning: ["book"], level: "N5", partOfSpeech: "noun", status: "unlearned" },
          { id: "v4", word: "学校", reading: "がっこう", romaji: "gakkou", meaning: ["school"], level: "N5", partOfSpeech: "noun", status: "unlearned" },
          { id: "v5", word: "高い", reading: "たかい", romaji: "takai", meaning: ["expensive", "high", "tall"], level: "N5", partOfSpeech: "adjective", status: "unlearned" },
          { id: "v6", word: "新しい", reading: "あたらしい", romaji: "atarashii", meaning: ["new"], level: "N5", partOfSpeech: "adjective", status: "unlearned" },
          { id: "v7", word: "先生", reading: "せんせい", romaji: "sensei", meaning: ["teacher", "master"], level: "N5", partOfSpeech: "noun", status: "unlearned" },
          { id: "v8", word: "学生", reading: "がくせい", romaji: "gakusei", meaning: ["student"], level: "N5", partOfSpeech: "noun", status: "unlearned" },
        ];
      }

      // Filter by theme if selected
      if (theme !== "all") {
        const themeObj = VOCAB_THEMES.find((t) => t.id === theme);
        if (themeObj) {
          const themeFiltered = list.filter((item) => {
            const mStr = Array.isArray(item.meaning) ? item.meaning.join(" ") : String(item.meaning || "");
            const combined = `${item.word || ""} ${item.reading || ""} ${mStr}`.toLowerCase();
            return themeObj.keywords.some((kw) => combined.includes((kw || "").toLowerCase()));
          });
          if (themeFiltered.length >= 4) {
            list = themeFiltered;
          }
        }
      }

      const shuffled = [...list].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));

      setVocabPool(selected);
      setCurrentIndex(0);
      setScore(0);
      setStreak(0);
      setMaxStreak(0);
      setHistory([]);
      setSelectedOption(null);
      setTypedInput("");
      setIsAnswered(false);
      setIsCorrect(false);
      setIsFinished(false);
      setIsSessionActive(true);
    } catch (err) {
      console.error("Failed to load reverse translation vocab:", err);
    } finally {
      setIsLoading(false);
    }
  }, [level, theme, questionCount]);

  const currentItem = vocabPool[currentIndex] || null;

  // Auto-focus input when in typing mode and question changes
  useEffect(() => {
    if (mode === "typing" && !isAnswered && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, mode, isAnswered]);

  // Generate 4 Japanese choice options for Multiple Choice mode
  const multipleChoiceOptions = useMemo(() => {
    if (!currentItem || mode !== "multiple_choice") return [];
    const correct = currentItem;
    const others = vocabPool
      .filter((v) => v.id !== currentItem.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    return [correct, ...others].sort(() => Math.random() - 0.5);
  }, [currentItem, vocabPool, mode]);

  // Handle Multiple Choice Answer
  const handleSelectOption = (item: VocabItem) => {
    if (isAnswered || !currentItem) return;

    const isRight = item.id === currentItem.id;
    setSelectedOption(item.id);
    setIsAnswered(true);
    setIsCorrect(isRight);

    if (isRight) {
      setScore((s) => s + 1);
      setStreak((prev) => {
        const next = prev + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
      playJapaneseAudio(currentItem.word);
      recordWordProgress(currentItem.id, currentItem.level, "mastered");
    } else {
      setStreak(0);
      playJapaneseAudio(currentItem.word);
      recordWordProgress(currentItem.id, currentItem.level, "reviewing");
    }

    setHistory((h) => [...h, { item: currentItem, isCorrect: isRight, userAnswer: item.word }]);
  };

  // Handle Typing Submission
  const handleCheckTyping = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAnswered || !currentItem || !typedInput.trim()) return;

    const clean = typedInput.trim().toLowerCase().replace(/\s+/g, "");
    const correctWord = (currentItem.word || "").toLowerCase().replace(/\s+/g, "");
    const correctReading = (currentItem.reading || "").toLowerCase().replace(/\s+/g, "");
    const correctRomaji = (currentItem.romaji || "").toLowerCase().replace(/\s+/g, "");

    const isRight =
      clean === correctWord ||
      clean === correctReading ||
      (correctRomaji ? clean === correctRomaji : false);

    setIsAnswered(true);
    setIsCorrect(isRight);

    if (isRight) {
      setScore((s) => s + 1);
      setStreak((prev) => {
        const next = prev + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
      playJapaneseAudio(currentItem.word);
      recordWordProgress(currentItem.id, currentItem.level, "mastered");
    } else {
      setStreak(0);
      playJapaneseAudio(currentItem.word);
      recordWordProgress(currentItem.id, currentItem.level, "reviewing");
    }

    setHistory((h) => [...h, { item: currentItem, isCorrect: isRight, userAnswer: typedInput }]);
  };

  // Keyboard Shortcuts (1-4 for MC and Enter to proceed)
  useEffect(() => {
    if (!isSessionActive || isFinished || !currentItem) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === "multiple_choice" && !isAnswered) {
        const keyNum = parseInt(e.key, 10);
        if (keyNum >= 1 && keyNum <= multipleChoiceOptions.length) {
          e.preventDefault();
          handleSelectOption(multipleChoiceOptions[keyNum - 1]);
        }
      } else if (isAnswered) {
        if (e.key === "Enter") {
          e.preventDefault();
          handleNextQuestion();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSessionActive, isFinished, isAnswered, mode, currentItem, multipleChoiceOptions]);

  // Next Question
  const handleNextQuestion = () => {
    if (currentIndex + 1 >= vocabPool.length) {
      setIsFinished(true);
      logStudySession();
      return;
    }

    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);
    setSelectedOption(null);
    setTypedInput("");
    setIsAnswered(false);
    setIsCorrect(false);
  };

  // Sync to database
  const recordWordProgress = (wordId: string, itemLevel: string, status: ProgressStatus) => {
    fetch("/api/vocab", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordId, level: itemLevel, status }),
    }).catch(() => {});
  };

  // Log session
  const logStudySession = () => {
    fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        durationMinutes: Math.max(1, Math.round(vocabPool.length * 0.35)),
        level,
        activities: JSON.stringify(["vocabulary"]),
        wordsReviewed: vocabPool.length,
        notes: `Completed Reverse Translation (${mode}) drill: ${score}/${vocabPool.length} correct.`,
      }),
    }).catch(() => {});
  };

  // 1. SETUP SCREEN
  if (!isSessionActive) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 animate-in fade-in duration-200">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C84B31]/10 dark:bg-[#E85C40]/10 text-[#C84B31] dark:text-[#E85C40]">
            <RotateCw size={28} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#F0F4F8]">
            Reverse Translation Recall
          </h1>
          <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
            See the English meaning and recall the Japanese expression. Test your active production memory!
          </p>
        </div>

        <HowToPlay
          gameKey="reverse-translation"
          steps={[
            "You are shown an English meaning — recall the Japanese word that expresses it.",
            "In Multiple Choice mode, pick the matching Japanese word from four options; keys 1-4 also work.",
            "In Typing Recall mode, type your answer in kana, kanji, or romaji and press Submit.",
            "After each answer the target word is shown and pronounced; press Enter for the next one.",
            "Correct answers grow your streak and are saved as mastered in your vocabulary progress.",
          ]}
          note="Tip: set your JLPT level, theme, and question count first — warm up in Multiple Choice, then switch to Typing Recall for a real challenge."
        />

        <div className="rounded-2xl border border-black/10 bg-white p-7 shadow-xs dark:border-white/10 dark:bg-[#161B22] space-y-6">
          {/* Mode Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
              Input Mode
            </label>
            <div className="mt-2.5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode("multiple_choice")}
                className={`flex items-center justify-center gap-2 rounded-2xl p-3.5 text-xs font-bold transition ${
                  mode === "multiple_choice"
                    ? "bg-[#C84B31] dark:bg-[#E85C40] text-white shadow-xs"
                    : "border border-black/10 bg-[#FAFAF8] text-[#1A1A1A] hover:bg-black/5 dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]"
                }`}
              >
                <ListFilter size={16} />
                <span>Multiple Choice</span>
              </button>

              <button
                type="button"
                onClick={() => setMode("typing")}
                className={`flex items-center justify-center gap-2 rounded-2xl p-3.5 text-xs font-bold transition ${
                  mode === "typing"
                    ? "bg-[#C84B31] dark:bg-[#E85C40] text-white shadow-xs"
                    : "border border-black/10 bg-[#FAFAF8] text-[#1A1A1A] hover:bg-black/5 dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]"
                }`}
              >
                <Keyboard size={16} />
                <span>Typing Recall</span>
              </button>
            </div>
          </div>

          {/* JLPT Level */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
              Select JLPT Level
            </label>
            <div className="mt-2.5 grid grid-cols-6 gap-2">
              {["N5", "N4", "N3", "N2", "N1", "ALL"].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  className={`rounded-2xl py-2.5 text-xs font-bold transition ${
                    level === lvl
                      ? "bg-[#C84B31] dark:bg-[#E85C40] text-white shadow-xs"
                      : "border border-black/10 bg-[#FAFAF8] text-[#1A1A1A] hover:bg-black/5 dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
              Vocabulary Category Theme
            </label>
            <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTheme("all")}
                className={`rounded-xl py-2 px-3 text-xs font-bold text-left transition ${
                  theme === "all"
                    ? "bg-[#C84B31] dark:bg-[#E85C40] text-white"
                    : "border border-black/10 bg-[#FAFAF8] text-[#1A1A1A] dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]"
                }`}
              >
                🌟 All Themes
              </button>
              {VOCAB_THEMES.slice(0, 5).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={`rounded-xl py-2 px-3 text-xs font-bold text-left truncate transition ${
                    theme === t.id
                      ? "bg-[#C84B31] dark:bg-[#E85C40] text-white"
                      : "border border-black/10 bg-[#FAFAF8] text-[#1A1A1A] dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]"
                  }`}
                >
                  {t.emoji} {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
              Number of Questions
            </label>
            <div className="mt-2.5 grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  className={`rounded-2xl py-2.5 text-xs font-bold transition ${
                    questionCount === count
                      ? "bg-[#C84B31] dark:bg-[#E85C40] text-white shadow-xs"
                      : "border border-black/10 bg-[#FAFAF8] text-[#1A1A1A] hover:bg-black/5 dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]"
                  }`}
                >
                  {count} Words
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            type="button"
            onClick={handleStartPractice}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#C84B31] dark:bg-[#E85C40] py-4 text-sm font-bold text-white shadow-md transition hover:opacity-90 cursor-pointer"
          >
            {isLoading ? (
              <span>Preparing Words...</span>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Start Reverse Translation Recall</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // 2. LOADING STATE
  if (isLoading || !currentItem) {
    return <JapaneseLoader message="Gathering vocabulary definitions for reverse recall..." />;
  }

  // 3. FINISHED / SUMMARY SCREEN
  if (isFinished) {
    const accuracy = Math.round((score / vocabPool.length) * 100);

    return (
      <div className="mx-auto max-w-2xl space-y-6 animate-in fade-in duration-300">
        <div className="rounded-2xl border border-black/10 bg-white p-8 text-center shadow-xs dark:border-white/10 dark:bg-[#161B22] space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#C84B31]/10 dark:bg-[#E85C40]/10 text-[#C84B31] dark:text-[#E85C40]">
            <Trophy size={40} />
          </div>

          <div>
            <span className="rounded-full bg-[#C84B31]/10 dark:bg-[#E85C40]/10 px-3 py-1 text-xs font-bold text-[#C84B31] dark:text-[#E85C40]">
              {level} Reverse Translation Drill Complete
            </span>
            <h2 className="mt-3 text-3xl font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
              {accuracy >= 80 ? "素晴らしい！ Perfect Recall!" : accuracy >= 50 ? "よくできました！ Great Memory!" : "練習を続けましょう！ Keep Going!"}
            </h2>
            <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
              You correctly produced {score} out of {vocabPool.length} Japanese expressions.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 dark:border-white/5 dark:bg-[#1E232B]">
              <span className="text-xs font-bold text-[#6B6B6B] dark:text-[#A0A0A0] block">Accuracy</span>
              <span className="text-2xl font-bold text-[#C84B31] dark:text-[#E85C40]">{accuracy}%</span>
            </div>
            <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 dark:border-white/5 dark:bg-[#1E232B]">
              <span className="text-xs font-bold text-[#6B6B6B] dark:text-[#A0A0A0] block">Max Streak</span>
              <span className="text-2xl font-bold text-amber-500 flex items-center justify-center gap-1">
                <Flame size={20} />
                {maxStreak}
              </span>
            </div>
            <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 dark:border-white/5 dark:bg-[#1E232B]">
              <span className="text-xs font-bold text-[#6B6B6B] dark:text-[#A0A0A0] block">Score</span>
              <span className="text-2xl font-bold text-emerald-500">
                {score}/{vocabPool.length}
              </span>
            </div>
          </div>

          {/* Answer Review */}
          <div className="text-left space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
              Review Expressions ({history.length})
            </h3>
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between rounded-2xl border p-3.5 text-xs transition ${
                    item.isCorrect
                      ? "border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10"
                      : "border-red-500/20 bg-red-500/5 dark:bg-red-500/10"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-bold text-[#1A1A1A] dark:text-[#F0F4F8] flex items-center gap-2">
                      <span className="text-[#C84B31] dark:text-[#E85C40]">{item.item.word}</span>
                      <span className="text-[#6B6B6B] dark:text-[#A0A0A0]">({item.item.reading})</span>
                      <button
                        type="button"
                        onClick={() => playJapaneseAudio(item.item.word)}
                        className="rounded-lg p-1 text-[#6B6B6B] hover:text-[#C84B31] dark:text-[#A0A0A0] dark:hover:text-[#E85C40]"
                      >
                        <Volume2 size={13} />
                      </button>
                    </div>
                    <div className="text-[11px] text-[#6B6B6B] dark:text-[#A0A0A0]">
                      Meaning: {item.item.meaning.join(", ")}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 font-bold">
                    {item.isCorrect ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check size={14} /> Correct
                      </span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                        <X size={14} /> Answered: {item.userAnswer || "None"}
                      </span>
                    )}
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
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#C84B31] dark:bg-[#E85C40] py-3.5 text-xs font-bold text-white transition hover:opacity-90 shadow-md cursor-pointer"
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
  const progressPercent = ((currentIndex + 1) / vocabPool.length) * 100;

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-in fade-in duration-200">
      {/* Top Bar Navigation & Stats */}
      <div className="flex items-center justify-between">
        <Link
          href="/practice"
          className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs font-bold text-[#1A1A1A] shadow-xs transition hover:bg-black/5 dark:border-white/10 dark:bg-[#161B22] dark:text-[#F0F4F8] dark:hover:bg-white/5"
        >
          <ArrowLeft size={14} />
          <span>Exit Recall</span>
        </Link>

        <div className="flex items-center gap-3">
          {streak > 1 && (
            <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 animate-bounce">
              <Flame size={14} />
              <span>{streak} Streak!</span>
            </div>
          )}

          <div className="rounded-full bg-black/5 px-3 py-1 text-xs font-bold text-[#1A1A1A] dark:bg-white/5 dark:text-[#F0F4F8]">
            {currentIndex + 1} / {vocabPool.length}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/5">
        <div
          className="h-full rounded-full bg-[#C84B31] dark:bg-[#E85C40] transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* English Prompt Card */}
      <div className="rounded-2xl border border-black/10 bg-white p-7 shadow-xs dark:border-white/10 dark:bg-[#161B22] space-y-6">
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-[#C84B31]/30 dark:border-[#E85C40]/30 bg-[#C84B31]/10 dark:bg-[#E85C40]/10 px-3 py-0.5 text-xs font-bold text-[#C84B31] dark:text-[#E85C40]">
            {currentItem.level} • {currentItem.partOfSpeech || "Vocabulary"}
          </span>

          <span className="text-xs font-semibold text-[#6B6B6B] dark:text-[#A0A0A0]">
            Recall the Japanese expression
          </span>
        </div>

        {/* English Definition Display */}
        <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-7 text-center dark:border-white/5 dark:bg-[#1E232B] space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
            English Meaning
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#F0F4F8] capitalize">
            {currentItem.meaning.join(", ")}
          </h2>
        </div>

        {/* Mode A: Multiple Choice Selection */}
        {mode === "multiple_choice" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {multipleChoiceOptions.map((opt, idx) => {
              const isSelected = selectedOption === opt.id;
              const isTarget = opt.id === currentItem.id;

              let cardStyle =
                "border-black/10 bg-[#FAFAF8] text-[#1A1A1A] hover:border-[#C84B31] dark:border-[#E85C40] hover:bg-[#C84B31]/5 dark:bg-[#E85C40]/5 dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]";

              if (isAnswered) {
                if (isTarget) {
                  cardStyle =
                    "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shadow-xs";
                } else if (isSelected && !isTarget) {
                  cardStyle = "border-red-500 bg-red-500/15 text-red-700 dark:text-red-300";
                } else {
                  cardStyle = "opacity-40 border-black/5 bg-[#FAFAF8] dark:bg-[#1E232B] dark:border-white/5";
                }
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(opt)}
                  className={`group relative flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${cardStyle} cursor-pointer`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-black/5 text-[11px] font-bold text-[#6B6B6B] dark:bg-white/5 dark:text-[#A0A0A0]">
                        {idx + 1}
                      </span>
                      <span className="text-xl font-bold">{opt.word}</span>
                    </div>
                    <div className="pl-7 text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
                      {opt.reading} {opt.romaji ? `(${opt.romaji})` : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAnswered && isTarget && <CheckCircle2 size={20} className="text-emerald-500" />}
                    {isAnswered && isSelected && !isTarget && <XCircle size={20} className="text-red-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Mode B: Typing Input Mode */}
        {mode === "typing" && (
          <form onSubmit={handleCheckTyping} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#6B6B6B] dark:text-[#A0A0A0] block">
                Type in Kana, Kanji, or Romaji:
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={typedInput}
                  disabled={isAnswered}
                  onChange={(e) => setTypedInput(e.target.value)}
                  placeholder="e.g. たべる or taberu or 食べる"
                  className="w-full rounded-2xl border border-black/10 bg-[#FAFAF8] px-5 py-4 text-lg font-bold text-[#1A1A1A] outline-hidden transition focus:border-[#C84B31] dark:border-[#E85C40] focus:bg-white dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8] dark:focus:bg-[#161B22]"
                />
                {!isAnswered && typedInput.trim() && (
                  <button
                    type="submit"
                    className="absolute right-3 top-3 rounded-xl bg-[#C84B31] dark:bg-[#E85C40] px-4 py-2 text-xs font-bold text-white transition hover:opacity-90"
                  >
                    Submit
                  </button>
                )}
              </div>
            </div>
          </form>
        )}

        {/* Post-Answer Feedback & Next Button */}
        {isAnswered && (
          <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-5 dark:border-white/5 dark:bg-[#1E232B] space-y-4 animate-in fade-in">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 size={16} /> 正解！ Correct Expression!
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-red-600 dark:text-red-400">
                      <XCircle size={16} /> 不正解 Incorrect
                    </span>
                  )}
                </div>
                <div className="text-sm font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
                  Target Japanese: <span className="text-[#C84B31] dark:text-[#E85C40] text-lg">{currentItem.word}</span> ({currentItem.reading})
                </div>
                <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
                  Romaji: {currentItem.romaji}
                </div>
              </div>

              <button
                type="button"
                onClick={() => playJapaneseAudio(currentItem.word)}
                className="rounded-xl border border-black/10 bg-white p-2.5 text-[#1A1A1A] shadow-xs hover:text-[#C84B31] dark:text-[#E85C40] dark:border-white/10 dark:bg-[#161B22] dark:text-[#F0F4F8]"
              >
                <Volume2 size={18} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleNextQuestion}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#C84B31] dark:bg-[#E85C40] py-3.5 text-xs font-bold text-white shadow-md transition hover:opacity-90 cursor-pointer"
            >
              <span>{currentIndex + 1 >= vocabPool.length ? "Finish & View Results" : "Next Word (Enter)"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
