"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  BookOpen,
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  Flame,
  Trophy,
  Layers,
  HelpCircle,
  Edit3,
  Headphones,
  Check,
  X,
  Play,
  RotateCw,
} from "lucide-react";
import { playJapaneseAudio } from "@/lib/audio";
import { VOCAB_THEMES, type VocabTheme } from "@/lib/vocab-themes";
import { JapaneseLoader } from "@/components/ui/JapaneseLoader";
import { HowToPlay } from "@/components/practice/HowToPlay";
import type { ProgressStatus } from "@/types";

export type PracticeMode = "flashcard" | "quiz" | "typing" | "listening";

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

export function VocabPracticeEngine() {
  // Config state
  const [selectedLevel, setSelectedLevel] = useState<string>("N5");
  const [selectedTheme, setSelectedTheme] = useState<string>("all");
  const [mode, setMode] = useState<PracticeMode>("quiz");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [onlyUnlearned, setOnlyUnlearned] = useState<boolean>(false);

  // Session state
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [vocabPool, setVocabPool] = useState<VocabItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [typedInput, setTypedInput] = useState<string>("");
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  // Stats tracking
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [history, setHistory] = useState<
    Array<{ item: VocabItem; isCorrect: boolean; userAnswer: string }>
  >([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Start a new practice session
  const handleStartPractice = async () => {
    setIsLoading(true);
    try {
      const url =
        selectedLevel === "ALL"
          ? `/api/vocab?limit=500`
          : `/api/vocab?level=${selectedLevel}&limit=500`;

      const res = await fetch(url);
      const json = await res.json();
      let list: VocabItem[] = json.data || [];

      if (onlyUnlearned) {
        const filtered = list.filter((w) => w.status === "unlearned");
        if (filtered.length >= 5) list = filtered;
      }

      if (list.length === 0) {
        setIsLoading(false);
        return;
      }

      // Shuffle and pick requested count
      const shuffled = [...list].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));

      setVocabPool(selected);
      setCurrentIndex(0);
      setScore(0);
      setStreak(0);
      setMaxStreak(0);
      setHistory([]);
      setIsFlipped(false);
      setSelectedOption(null);
      setTypedInput("");
      setIsAnswered(false);
      setIsFinished(false);
      setIsSessionActive(true);

      // Play initial audio if listening mode
      if (mode === "listening" && selected[0]) {
        setTimeout(() => playJapaneseAudio(selected[0].word), 300);
      }
    } catch (err) {
      console.error("Failed to load practice vocabulary:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentItem = vocabPool[currentIndex] || null;

  // Generate 4 randomized multiple choice options
  const quizOptions = useMemo(() => {
    if (!currentItem || (mode !== "quiz" && mode !== "listening")) return [];
    const correct = currentItem.meaning.join(", ");
    const otherMeanings = vocabPool
      .filter((v) => v.id !== currentItem.id)
      .map((v) => v.meaning.join(", "));

    const distractors = otherMeanings.sort(() => Math.random() - 0.5).slice(0, 3);
    return [correct, ...distractors].sort(() => Math.random() - 0.5);
  }, [currentItem, vocabPool, mode]);

  // Handle Multiple Choice Answer
  const handleSelectOption = (option: string) => {
    if (isAnswered || !currentItem) return;
    const correct = currentItem.meaning.join(", ");
    const isRight = option.trim().toLowerCase() === correct.trim().toLowerCase();

    setSelectedOption(option);
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
      recordWordProgress(currentItem.id, currentItem.level, "reviewing");
    }

    setHistory((h) => [...h, { item: currentItem, isCorrect: isRight, userAnswer: option }]);
  };

  // Handle Typing Answer Submission
  const handleCheckTyping = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAnswered || !currentItem || !typedInput.trim()) return;

    const cleanInput = typedInput.trim().toLowerCase();
    const correctReading = currentItem.reading.trim().toLowerCase();
    const correctRomaji = currentItem.romaji.trim().toLowerCase();
    const correctWord = currentItem.word.trim().toLowerCase();

    const isRight =
      cleanInput === correctReading ||
      cleanInput === correctRomaji ||
      cleanInput === correctWord;

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
      recordWordProgress(currentItem.id, currentItem.level, "reviewing");
    }

    setHistory((h) => [...h, { item: currentItem, isCorrect: isRight, userAnswer: typedInput }]);
  };

  // Handle Flashcard Mastery Check
  const handleFlashcardRating = (status: "reviewing" | "mastered") => {
    if (!currentItem) return;
    const isRight = status === "mastered";

    if (isRight) {
      setScore((s) => s + 1);
      setStreak((prev) => {
        const next = prev + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
    } else {
      setStreak(0);
    }

    recordWordProgress(currentItem.id, currentItem.level, status);
    setHistory((h) => [...h, { item: currentItem, isCorrect: isRight, userAnswer: status }]);
    handleNextQuestion();
  };

  // Next Question Transition
  const handleNextQuestion = () => {
    if (currentIndex + 1 >= vocabPool.length) {
      // Finished practice session
      setIsFinished(true);
      logStudySession();
      return;
    }

    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);
    setIsFlipped(false);
    setSelectedOption(null);
    setTypedInput("");
    setIsAnswered(false);
    setIsCorrect(false);

    if (mode === "listening" && vocabPool[nextIdx]) {
      setTimeout(() => playJapaneseAudio(vocabPool[nextIdx].word), 300);
    }
  };

  // Sync to database
  const recordWordProgress = (wordId: string, level: string, status: ProgressStatus) => {
    fetch("/api/vocab", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordId, level, status }),
    }).catch((err) => console.warn("Failed to record vocab progress:", err));
  };

  // Log study session on finish
  const logStudySession = () => {
    fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        durationMinutes: Math.max(1, Math.round(vocabPool.length * 0.3)),
        level: selectedLevel,
        activities: JSON.stringify(["vocabulary"]),
        wordsReviewed: vocabPool.length,
        notes: `Completed ${mode} vocabulary practice (${score}/${vocabPool.length} correct).`,
      }),
    }).catch(() => {});
  };

  // 1. Practice Setup Screen
  if (!isSessionActive) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 animate-in fade-in duration-200">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C84B31]/10 dark:bg-[#E85C40]/10 text-[#C84B31] dark:text-[#E85C40]">
            <BookOpen size={28} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#F0F4F8]">
            Vocabulary Word Practice
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
            Train and memorize 7,972 JLPT words with interactive quizzes, flashcards, and audio drills.
          </p>
        </div>

        <HowToPlay
          gameKey="vocab-practice"
          steps={[
            "Pick a JLPT level (N5-N1 or ALL), a practice mode, and how many words to drill, then press Start Practice Session.",
            "Quiz shows a word with its reading — click the correct meaning from four choices; Audio Listening works the same but you hear the word and can replay it.",
            "Flashcards flip when clicked to reveal the reading, romaji, and meaning — rate each card Still Learning or Got it Mastered to move on.",
            "Typing Recall shows the word and its meaning — type the reading in kana or romaji (e.g. たべる or taberu) and press Submit Answer.",
            "Correct answers build your streak and play the word aloud; at the end you get score, accuracy, and a word-by-word review, all saved to your vocabulary progress.",
          ]}
          note="Tip: in Typing Recall, typing the kanji word itself also counts as correct."
        />

        <div className="rounded-2xl border border-black/10 bg-white p-7 shadow-xs dark:border-white/10 dark:bg-[#161B22] space-y-6">
          {/* JLPT Level Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              Select JLPT Level
            </label>
            <div className="mt-2.5 grid grid-cols-6 gap-2">
              {["N5", "N4", "N3", "N2", "N1", "ALL"].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`rounded-2xl py-2.5 text-xs font-bold transition ${
                    selectedLevel === lvl
                      ? "bg-[#C84B31] dark:bg-[#E85C40] text-white shadow-xs"
                      : "border border-black/10 bg-[#FAFAF8] text-[#1A1A1A] hover:bg-black/5 dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8] dark:hover:bg-white/5"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              Practice Mode
            </label>
            <div className="mt-2.5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { id: "quiz", name: "Quiz", icon: HelpCircle, desc: "Multiple choice" },
                { id: "flashcard", name: "Flashcards", icon: Layers, desc: "Flip & recall" },
                { id: "typing", name: "Typing Recall", icon: Edit3, desc: "Type reading" },
                { id: "listening", name: "Audio Listening", icon: Headphones, desc: "Listen & pick" },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = mode === m.id;

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id as PracticeMode)}
                    className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition ${
                      isSelected
                        ? "border-[#C84B31] dark:border-[#E85C40] bg-[#C84B31]/5 dark:bg-[#E85C40]/5 ring-1 ring-[#C84B31] dark:ring-[#E85C40] dark:bg-[#C84B31]/10 dark:bg-[#E85C40]/10"
                        : "border-black/10 bg-[#FAFAF8] hover:border-black/20 dark:border-white/10 dark:bg-[#1E232B] dark:hover:border-white/20"
                    }`}
                  >
                    <Icon
                      size={22}
                      className={
                        isSelected ? "text-[#C84B31] dark:text-[#E85C40]" : "text-[#6B6B6B] dark:text-[#A0A0A0]"
                      }
                    />
                    <div className="mt-2 text-xs font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
                      {m.name}
                    </div>
                    <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">{m.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Count */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              Number of Questions
            </label>
            <div className="mt-2.5 grid grid-cols-4 gap-2">
              {[10, 20, 30, 50].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  className={`rounded-2xl py-2 text-xs font-bold transition ${
                    questionCount === count
                      ? "bg-[#C84B31] dark:bg-[#E85C40] text-white shadow-xs"
                      : "border border-black/10 bg-[#FAFAF8] text-[#1A1A1A] hover:bg-black/5 dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8] dark:hover:bg-white/5"
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
            className="w-full rounded-2xl bg-[#C84B31] dark:bg-[#E85C40] py-4 text-sm font-bold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? "Preparing Word Pool..." : "Start Practice Session"}
          </button>
        </div>
      </div>
    );
  }

  // 2. Summary Screen
  if (isFinished) {
    const accuracy = vocabPool.length > 0 ? Math.round((score / vocabPool.length) * 100) : 0;

    return (
      <div className="mx-auto max-w-xl space-y-6 animate-in zoom-in-95 duration-200">
        <div className="rounded-2xl border border-black/10 bg-white p-8 text-center shadow-xs dark:border-white/10 dark:bg-[#161B22] space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <Trophy size={32} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
              Session Completed!
            </h2>
            <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
              All practice answers recorded directly into your progress logs.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-3 text-center dark:border-white/5 dark:bg-[#1E232B]">
              <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Score</div>
              <div className="mt-1 text-lg font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
                {score} / {vocabPool.length}
              </div>
            </div>
            <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-3 text-center dark:border-white/5 dark:bg-[#1E232B]">
              <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Accuracy</div>
              <div className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {accuracy}%
              </div>
            </div>
            <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-3 text-center dark:border-white/5 dark:bg-[#1E232B]">
              <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Max Streak</div>
              <div className="mt-1 text-lg font-bold text-amber-500">🔥 {maxStreak}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5 pt-2 sm:flex-row">
            <button
              type="button"
              onClick={handleStartPractice}
              className="flex-1 rounded-2xl bg-[#C84B31] dark:bg-[#E85C40] py-3 text-xs font-bold text-white shadow-xs transition hover:opacity-90"
            >
              Practice Again
            </button>
            <Link
              href="/progress/vocabulary"
              className="flex-1 rounded-2xl border border-black/10 bg-white py-3 text-center text-xs font-bold text-[#1A1A1A] transition hover:bg-black/5 dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8] dark:hover:bg-white/5"
            >
              Back to Vocabulary
            </Link>
          </div>
        </div>

        {/* Breakdown List */}
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-[#161B22] space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
            Word Review Breakdown ({history.length})
          </h3>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {history.map((entry, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-black/5 bg-[#FAFAF8] p-3 dark:border-white/5 dark:bg-[#1E232B]"
              >
                <div className="flex items-center gap-3">
                  <div className="font-serif text-base font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
                    {entry.item.word}
                  </div>
                  <div>
                    <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                      {entry.item.reading}
                    </div>
                    <div className="text-[11px] text-[#1A1A1A] dark:text-[#CBD5E1]">
                      {entry.item.meaning.join(", ")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => playJapaneseAudio(entry.item.word)}
                    className="rounded-full bg-black/5 p-1.5 text-gray-600 transition hover:bg-[#C84B31] dark:bg-[#E85C40] hover:text-white dark:bg-white/5 dark:text-gray-400 dark:hover:bg-[#C84B31] dark:bg-[#E85C40] dark:hover:text-white"
                  >
                    <Play size={10} className="fill-current" />
                  </button>
                  {entry.isCorrect ? (
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  ) : (
                    <XCircle size={16} className="text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentItem) return null;

  // 3. Active Practice UI
  const progressPct = Math.round(((currentIndex + 1) / vocabPool.length) * 100);

  return (
    <div className="mx-auto max-w-xl space-y-6 animate-in fade-in duration-150">
      {/* Session Progress Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsSessionActive(false)}
          className="flex items-center gap-1 text-xs font-bold text-[#64748B] transition hover:text-[#1A1A1A] dark:text-[#94A3B8] dark:hover:text-white"
        >
          <ChevronLeft size={16} />
          <span>Exit Session</span>
        </button>

        <div className="flex items-center gap-3">
          {streak > 1 && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400 animate-pulse">
              <Flame size={13} className="fill-current" /> {streak} streak
            </span>
          )}
          <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
            {currentIndex + 1} / {vocabPool.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-[#C84B31] dark:bg-[#E85C40] transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* ── MODE 1: FLASHCARDS ── */}
      {mode === "flashcard" && (
        <div className="space-y-4">
          <div
            onClick={() => {
              setIsFlipped(!isFlipped);
              if (!isFlipped) playJapaneseAudio(currentItem.word);
            }}
            className="group relative flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm transition hover:border-[#C84B31]/50 dark:border-[#E85C40]/50 hover:shadow-xs dark:border-white/10 dark:bg-[#161B22]"
          >
            <span className="absolute top-4 right-4 rounded-md bg-black/5 px-2 py-0.5 text-[11px] font-bold text-[#64748B] dark:bg-white/5 dark:text-[#94A3B8]">
              {currentItem.level}
            </span>

            {!isFlipped ? (
              <div className="space-y-3">
                <div className="font-serif text-5xl font-bold text-[#1A1A1A] transition dark:text-[#F0F4F8]">
                  {currentItem.word}
                </div>
                <p className="text-xs italic text-[#64748B] dark:text-[#94A3B8]">
                  Click or tap to flip card
                </p>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="font-serif text-3xl font-bold text-[#C84B31] dark:text-[#E85C40]">
                  {currentItem.reading}
                </div>
                <div className="font-mono text-xs text-[#64748B] dark:text-[#94A3B8]">
                  {currentItem.romaji}
                </div>
                <div className="text-lg font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
                  {currentItem.meaning.join(", ")}
                </div>
                <div className="text-xs text-[#64748B] dark:text-[#94A3B8] capitalize">
                  {currentItem.partOfSpeech || "Vocabulary Word"}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                playJapaneseAudio(currentItem.word);
              }}
              className="absolute bottom-4 rounded-full bg-black/5 p-2 text-gray-600 transition hover:bg-[#C84B31] dark:bg-[#E85C40] hover:text-white dark:bg-white/5 dark:text-gray-400 dark:hover:bg-[#C84B31] dark:bg-[#E85C40] dark:hover:text-white"
            >
              <Volume2 size={16} />
            </button>
          </div>

          {/* Flashcard rating buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleFlashcardRating("reviewing")}
              className="rounded-2xl border border-black/10 bg-white py-3.5 text-xs font-bold text-amber-600 shadow-xs transition hover:bg-amber-50 dark:border-white/10 dark:bg-[#161B22] dark:text-amber-400 dark:hover:bg-amber-950/20"
            >
              Still Learning
            </button>
            <button
              type="button"
              onClick={() => handleFlashcardRating("mastered")}
              className="rounded-2xl bg-emerald-600 py-3.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700"
            >
              Got it Mastered! ★
            </button>
          </div>
        </div>
      )}

      {/* ── MODE 2: MULTIPLE CHOICE QUIZ & LISTENING ── */}
      {(mode === "quiz" || mode === "listening") && (
        <div className="space-y-5">
          {/* Question Prompt Box */}
          <div className="relative flex flex-col items-center justify-center rounded-2xl border border-black/10 bg-white p-8 text-center shadow-xs dark:border-white/10 dark:bg-[#161B22]">
            <span className="absolute top-4 right-4 rounded-md bg-black/5 px-2 py-0.5 text-[11px] font-bold text-[#64748B] dark:bg-white/5 dark:text-[#94A3B8]">
              {currentItem.level}
            </span>

            {mode === "listening" ? (
              <button
                type="button"
                onClick={() => playJapaneseAudio(currentItem.word)}
                className="group flex flex-col items-center justify-center gap-3 py-4"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#C84B31]/10 dark:bg-[#E85C40]/10 text-[#C84B31] dark:text-[#E85C40] transition">
                  <Volume2 size={32} />
                </div>
                <span className="text-xs font-bold text-[#C84B31] dark:text-[#E85C40]">
                  Click to replay pronunciation
                </span>
              </button>
            ) : (
              <div className="space-y-2">
                <div className="font-serif text-5xl font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
                  {currentItem.word}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-semibold text-[#64748B] dark:text-[#94A3B8]">
                    {currentItem.reading}
                  </span>
                  <button
                    type="button"
                    onClick={() => playJapaneseAudio(currentItem.word)}
                    className="rounded-full bg-black/5 p-1 text-gray-500 hover:text-[#C84B31] dark:text-[#E85C40] dark:bg-white/5"
                  >
                    <Volume2 size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {quizOptions.map((opt, idx) => {
              const correct = currentItem.meaning.join(", ");
              const isSelected = selectedOption === opt;
              const isCorrectOpt = opt === correct;

              let style =
                "border-black/10 bg-white hover:border-black/25 dark:border-white/10 dark:bg-[#161B22] dark:hover:border-white/20";
              if (isAnswered) {
                if (isCorrectOpt) {
                  style = "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500";
                } else if (isSelected && !isCorrectOpt) {
                  style = "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-red-500";
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswered}
                  className={`flex items-center justify-between rounded-2xl border p-4 text-left text-sm font-bold transition ${style}`}
                >
                  <span>{opt}</span>
                  {isAnswered && isCorrectOpt && <Check size={16} className="text-emerald-500" />}
                  {isAnswered && isSelected && !isCorrectOpt && (
                    <X size={16} className="text-red-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Next button after answer */}
          {isAnswered && (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#C84B31] dark:bg-[#E85C40] py-3.5 text-xs font-bold text-white shadow-md transition hover:opacity-90 animate-in fade-in"
            >
              <span>Next Question</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      )}

      {/* ── MODE 3: TYPING RECALL ── */}
      {mode === "typing" && (
        <div className="space-y-5">
          <div className="relative flex flex-col items-center justify-center rounded-2xl border border-black/10 bg-white p-8 text-center shadow-xs dark:border-white/10 dark:bg-[#161B22] space-y-2">
            <span className="absolute top-4 right-4 rounded-md bg-black/5 px-2 py-0.5 text-[11px] font-bold text-[#64748B] dark:bg-white/5 dark:text-[#94A3B8]">
              {currentItem.level}
            </span>

            <div className="text-xs uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              Type the reading (Kana / Romaji)
            </div>
            <div className="font-serif text-5xl font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
              {currentItem.word}
            </div>
            <div className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
              Meaning: {currentItem.meaning.join(", ")}
            </div>
          </div>

          <form onSubmit={handleCheckTyping} className="space-y-3">
            <input
              type="text"
              placeholder="e.g. たべる or taberu"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              disabled={isAnswered}
              autoFocus
              className="w-full rounded-2xl border border-black/10 bg-white px-5 py-4 text-center font-serif text-lg font-bold text-[#1A1A1A] outline-none transition focus:border-[#C84B31] dark:border-[#E85C40] dark:border-white/10 dark:bg-[#161B22] dark:text-[#F0F4F8]"
            />

            {!isAnswered ? (
              <button
                type="submit"
                className="w-full rounded-2xl bg-[#C84B31] dark:bg-[#E85C40] py-3.5 text-xs font-bold text-white shadow-md transition hover:opacity-90"
              >
                Submit Answer
              </button>
            ) : (
              <div className="space-y-3">
                <div
                  className={`rounded-2xl p-4 text-center text-xs font-bold ${
                    isCorrect
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-red-500/10 text-red-600 dark:text-red-400"
                  }`}
                >
                  {isCorrect ? "Correct! Perfect recall." : `Correct reading is: ${currentItem.reading} (${currentItem.romaji})`}
                </div>
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#C84B31] dark:bg-[#E85C40] py-3.5 text-xs font-bold text-white shadow-md transition hover:opacity-90"
                >
                  <span>Next Question</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
