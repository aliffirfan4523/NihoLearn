"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Edit3,
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
  Eye,
  EyeOff,
  BookOpen,
  Check,
  X,
} from "lucide-react";
import { playJapaneseAudio } from "@/lib/audio";
import { JapaneseLoader } from "@/components/ui/JapaneseLoader";
import { CLOZE_DATASET, type ClozeExercise } from "@/lib/data/vocab-practice-suite";
import type { ProgressStatus } from "@/types";

interface ClozeQuestion {
  id: string;
  level: string;
  sentenceWithBlank: string;
  fullSentence: string;
  reading: string;
  englishTranslation: string;
  targetWord: {
    word: string;
    reading: string;
    meaning: string;
    id?: string;
  };
  options: Array<{
    word: string;
    reading: string;
    meaning: string;
  }>;
  hint: string;
}

export function VocabClozeEngine() {
  // Configuration
  const [level, setLevel] = useState<string>("N5");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [showEnglishHint, setShowEnglishHint] = useState<boolean>(true);

  // Practice state
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [questions, setQuestions] = useState<ClozeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Hint & stats state
  const [revealedHint, setRevealedHint] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [history, setHistory] = useState<
    Array<{
      question: ClozeQuestion;
      isCorrect: boolean;
      userAnswer: string;
    }>
  >([]);

  // Start Practice Drill
  const handleStartPractice = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch live vocab with example sentences from database
      const url = level === "ALL" ? `/api/vocab?limit=200` : `/api/vocab?level=${level}&limit=200`;
      let dbVocab: any[] = [];
      try {
        const res = await fetch(url);
        const json = await res.json();
        dbVocab = json.data || [];
      } catch (e) {
        console.warn("Using curated fallback dataset:", e);
      }

      const generatedQuestions: ClozeQuestion[] = [];

      // 2. Add curated high-quality Cloze items matching level
      const curatedMatching = CLOZE_DATASET.filter((item) => level === "ALL" || item.level === level);
      for (const item of curatedMatching) {
        const allOpts = [item.targetWord, ...item.distractors].sort(() => Math.random() - 0.5);
        generatedQuestions.push({
          id: item.id,
          level: item.level,
          sentenceWithBlank: item.sentenceWithBlank,
          fullSentence: item.fullSentence,
          reading: item.reading,
          englishTranslation: item.englishTranslation,
          targetWord: item.targetWord,
          options: allOpts,
          hint: item.hint,
        });
      }

      // 3. Dynamically generate Cloze questions from DB vocabulary with example sentences
      const vocabWithExamples = dbVocab.filter(
        (v) => v.exampleSentence && v.exampleSentence.includes(v.word) && v.word.length >= 1
      );

      for (const item of vocabWithExamples) {
        if (generatedQuestions.length >= questionCount * 2) break;

        const sentence = item.exampleSentence as string;
        // Replace target word with blank
        const sentenceWithBlank = sentence.replace(item.word, " [ ___ ] ");
        const distractors = dbVocab
          .filter((v) => v.id !== item.id && v.word !== item.word)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map((d) => ({
            word: d.word,
            reading: d.reading || d.romaji || "",
            meaning: Array.isArray(d.meaning) ? d.meaning.join(", ") : String(d.meaning || ""),
          }));

        if (distractors.length >= 3) {
          const targetObj = {
            id: item.id,
            word: item.word,
            reading: item.reading || item.romaji || "",
            meaning: Array.isArray(item.meaning) ? item.meaning.join(", ") : String(item.meaning || ""),
          };
          const allOptions = [targetObj, ...distractors].sort(() => Math.random() - 0.5);

          generatedQuestions.push({
            id: `dyn-${item.id}`,
            level: item.level,
            sentenceWithBlank,
            fullSentence: sentence,
            reading: item.reading || "",
            englishTranslation: `Vocabulary focus: ${targetObj.meaning}`,
            targetWord: targetObj,
            options: allOptions,
            hint: `Look for a word meaning "${targetObj.meaning}".`,
          });
        }
      }

      // 4. Fallback if few questions
      if (generatedQuestions.length === 0) {
        for (const item of CLOZE_DATASET) {
          const allOpts = [item.targetWord, ...item.distractors].sort(() => Math.random() - 0.5);
          generatedQuestions.push({
            id: item.id,
            level: item.level,
            sentenceWithBlank: item.sentenceWithBlank,
            fullSentence: item.fullSentence,
            reading: item.reading,
            englishTranslation: item.englishTranslation,
            targetWord: item.targetWord,
            options: allOpts,
            hint: item.hint,
          });
        }
      }

      // Shuffle & limit
      const shuffled = generatedQuestions.sort(() => Math.random() - 0.5).slice(0, questionCount);

      setQuestions(shuffled);
      setCurrentIndex(0);
      setScore(0);
      setStreak(0);
      setMaxStreak(0);
      setHistory([]);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(false);
      setIsFinished(false);
      setRevealedHint(false);
      setIsSessionActive(true);
    } catch (err) {
      console.error("Failed to prepare cloze drill:", err);
    } finally {
      setIsLoading(false);
    }
  }, [level, questionCount]);

  const currentQ = questions[currentIndex] || null;

  // Handle Option Selection
  const handleSelectOption = (word: string) => {
    if (isAnswered || !currentQ) return;

    const isRight = word.trim() === currentQ.targetWord.word.trim();
    setSelectedOption(word);
    setIsAnswered(true);
    setIsCorrect(isRight);

    if (isRight) {
      setScore((s) => s + 1);
      setStreak((prev) => {
        const next = prev + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
      // Play audio of the complete sentence
      playJapaneseAudio(currentQ.fullSentence);

      // Record progress if ID available
      if (currentQ.targetWord.id) {
        recordVocabProgress(currentQ.targetWord.id, currentQ.level, "mastered");
      }
    } else {
      setStreak(0);
      playJapaneseAudio(currentQ.targetWord.word);
      if (currentQ.targetWord.id) {
        recordVocabProgress(currentQ.targetWord.id, currentQ.level, "reviewing");
      }
    }

    setHistory((h) => [...h, { question: currentQ, isCorrect: isRight, userAnswer: word }]);
  };

  // Keyboard shortcut listener (1-4 keys & Enter)
  useEffect(() => {
    if (!isSessionActive || isFinished || !currentQ) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isAnswered) {
        const keyNum = parseInt(e.key, 10);
        if (keyNum >= 1 && keyNum <= currentQ.options.length) {
          e.preventDefault();
          handleSelectOption(currentQ.options[keyNum - 1].word);
        }
      } else {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleNextQuestion();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSessionActive, isFinished, isAnswered, currentQ]);

  // Next Question
  const handleNextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      setIsFinished(true);
      logStudySession();
      return;
    }

    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setRevealedHint(false);
  };

  // Sync to database
  const recordVocabProgress = (wordId: string, itemLevel: string, status: ProgressStatus) => {
    fetch("/api/vocab", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordId, level: itemLevel, status }),
    }).catch(() => {});
  };

  // Log study session on finish
  const logStudySession = () => {
    fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        durationMinutes: Math.max(1, Math.round(questions.length * 0.4)),
        level,
        activities: JSON.stringify(["vocabulary", "reading"]),
        wordsReviewed: questions.length,
        notes: `Completed Vocab Fill-in-the-Blank Cloze drill (${score}/${questions.length} correct).`,
      }),
    }).catch(() => {});
  };

  // Render sentence with styled blank
  const renderSentenceWithBlank = (sentence: string) => {
    const parts = sentence.split(/\[\s*___\s*\]/);
    if (parts.length === 1) return <span>{sentence}</span>;

    return (
      <span className="leading-relaxed">
        {parts[0]}
        <span
          className={`inline-flex items-center justify-center min-w-[90px] px-3 py-1 mx-1.5 rounded-xl border-2 font-bold transition-all ${
            isAnswered
              ? isCorrect
                ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300"
              : "border-dashed border-[var(--color-vermillion)] bg-[var(--color-vermillion)]/10 text-[var(--color-vermillion)] animate-pulse"
          }`}
        >
          {isAnswered ? currentQ?.targetWord.word : "______"}
        </span>
        {parts[1]}
      </span>
    );
  };

  // 1. SETUP SCREEN
  if (!isSessionActive) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 animate-in fade-in duration-200">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--color-vermillion)]/10 text-[var(--color-vermillion)]">
            <Edit3 size={28} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#F0F4F8]">
            Word Fill-in-the-Blank
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
            Test your contextual vocabulary mastery. Read the natural sentence and pick the missing word from clues.
          </p>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-xs dark:border-white/10 dark:bg-[#161B22] space-y-6">
          {/* JLPT Level */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
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
                      ? "bg-[var(--color-vermillion)] text-white shadow-xs"
                      : "border border-black/10 bg-[#FAFAF8] text-[#1A1A1A] hover:bg-black/5 dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8] dark:hover:bg-white/5"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              Questions per Round
            </label>
            <div className="mt-2.5 grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  className={`rounded-2xl py-2.5 text-xs font-bold transition ${
                    questionCount === count
                      ? "bg-[var(--color-vermillion)] text-white shadow-xs"
                      : "border border-black/10 bg-[#FAFAF8] text-[#1A1A1A] hover:bg-black/5 dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8] dark:hover:bg-white/5"
                  }`}
                >
                  {count} Words
                </button>
              ))}
            </div>
          </div>

          {/* Settings / Hints */}
          <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 text-xs dark:border-white/5 dark:bg-[#1E232B] flex items-center justify-between">
            <div>
              <span className="font-bold text-[#1A1A1A] dark:text-[#F0F4F8] block">Show English Translation</span>
              <span className="text-[#64748B] dark:text-[#94A3B8]">Display the English meaning as a supporting hint</span>
            </div>
            <button
              type="button"
              onClick={() => setShowEnglishHint(!showEnglishHint)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showEnglishHint ? "bg-[var(--color-vermillion)]" : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showEnglishHint ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Start Button */}
          <button
            type="button"
            onClick={handleStartPractice}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-vermillion)] py-4 text-sm font-bold text-white shadow-md transition hover:opacity-90 active:scale-[0.99] cursor-pointer"
          >
            {isLoading ? (
              <span>Preparing Cloze Drills...</span>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Start Fill-in-the-Blank Drill</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // 2. LOADING STATE
  if (isLoading || !currentQ) {
    return <JapaneseLoader message="Constructing contextual fill-in-the-blank sentences..." />;
  }

  // 3. FINISHED / SUMMARY SCREEN
  if (isFinished) {
    const accuracy = Math.round((score / questions.length) * 100);

    return (
      <div className="mx-auto max-w-2xl space-y-6 animate-in fade-in duration-300">
        <div className="rounded-3xl border border-black/10 bg-white p-8 text-center shadow-lg dark:border-white/10 dark:bg-[#161B22] space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--color-vermillion)]/10 text-[var(--color-vermillion)]">
            <Trophy size={40} />
          </div>

          <div>
            <span className="rounded-full bg-[var(--color-vermillion)]/10 px-3 py-1 text-xs font-bold text-[var(--color-vermillion)]">
              {level} Cloze Practice Complete
            </span>
            <h2 className="mt-3 text-3xl font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
              {accuracy >= 80 ? "素晴らしい！ Outstanding!" : accuracy >= 50 ? "よくできました！ Good Job!" : "がんばりました！ Keep Practicing!"}
            </h2>
            <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">
              You correctly identified {score} out of {questions.length} context words.
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
              <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] block">Score</span>
              <span className="text-2xl font-bold text-emerald-500">
                {score}/{questions.length}
              </span>
            </div>
          </div>

          {/* Answer Review List */}
          <div className="text-left space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              Sentence Review ({history.length})
            </h3>
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between rounded-2xl border p-3.5 text-xs transition ${
                    item.isCorrect
                      ? "border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10"
                      : "border-rose-500/20 bg-rose-500/5 dark:bg-rose-500/10"
                  }`}
                >
                  <div className="space-y-1 max-w-[75%]">
                    <div className="font-bold text-[#1A1A1A] dark:text-[#F0F4F8] flex items-center gap-2">
                      <span>{item.question.fullSentence}</span>
                      <button
                        type="button"
                        onClick={() => playJapaneseAudio(item.question.fullSentence)}
                        className="rounded-lg p-1 text-[#64748B] hover:text-[var(--color-vermillion)] dark:text-[#94A3B8]"
                      >
                        <Volume2 size={13} />
                      </button>
                    </div>
                    <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      Target: <span className="font-bold text-[var(--color-vermillion)]">{item.question.targetWord.word}</span> ({item.question.targetWord.reading}) — {item.question.targetWord.meaning}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.isCorrect ? (
                      <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                        <Check size={14} /> Correct
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400">
                        <X size={14} /> Picked: {item.userAnswer}
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

  // 4. ACTIVE DRILL VIEW
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-in fade-in duration-200">
      {/* Top Bar Navigation & Stats */}
      <div className="flex items-center justify-between">
        <Link
          href="/practice"
          className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs font-bold text-[#1A1A1A] shadow-xs transition hover:bg-black/5 dark:border-white/10 dark:bg-[#161B22] dark:text-[#F0F4F8] dark:hover:bg-white/5"
        >
          <ArrowLeft size={14} />
          <span>Exit Drill</span>
        </Link>

        <div className="flex items-center gap-3">
          {streak > 1 && (
            <div className="flex items-center gap-1 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-600 dark:text-orange-400 animate-bounce">
              <Flame size={14} />
              <span>{streak} Streak!</span>
            </div>
          )}

          <div className="rounded-full bg-black/5 px-3 py-1 text-xs font-bold text-[#1A1A1A] dark:bg-white/5 dark:text-[#F0F4F8]">
            {currentIndex + 1} / {questions.length}
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

      {/* Main Cloze Card */}
      <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-xs dark:border-white/10 dark:bg-[#161B22] space-y-6">
        {/* Level Tag & Audio Button */}
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-[var(--color-vermillion)]/30 bg-[var(--color-vermillion)]/10 px-3 py-0.5 text-xs font-bold text-[var(--color-vermillion)]">
            {currentQ.level} Context Drill
          </span>

          <button
            type="button"
            onClick={() => playJapaneseAudio(isAnswered ? currentQ.fullSentence : currentQ.sentenceWithBlank)}
            className="flex items-center gap-1.5 rounded-xl border border-black/10 bg-[#FAFAF8] px-3 py-1.5 text-xs font-bold text-[#1A1A1A] transition hover:bg-[var(--color-vermillion)]/10 hover:text-[var(--color-vermillion)] dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]"
            title="Listen to Japanese sentence"
          >
            <Volume2 size={15} />
            <span>Audio</span>
          </button>
        </div>

        {/* Cloze Sentence Display */}
        <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-6 text-center text-xl sm:text-2xl font-medium text-[#1A1A1A] dark:border-white/5 dark:bg-[#1E232B] dark:text-[#F0F4F8]">
          {renderSentenceWithBlank(currentQ.sentenceWithBlank)}
        </div>

        {/* English Translation / Hint */}
        {showEnglishHint && (
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
            <BookOpen size={14} className="text-[var(--color-vermillion)]" />
            <span>{currentQ.englishTranslation}</span>
          </div>
        )}

        {/* Contextual Hint Revealer */}
        {!isAnswered && (
          <div className="text-center">
            {revealedHint ? (
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/10 px-3.5 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                <HelpCircle size={14} />
                <span>Hint: {currentQ.hint}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setRevealedHint(true)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#64748B] hover:text-[var(--color-vermillion)] dark:text-[#94A3B8]"
              >
                <HelpCircle size={13} />
                <span>Show contextual clue</span>
              </button>
            )}
          </div>
        )}

        {/* 4 Multiple Choice Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOption === opt.word;
            const isTarget = opt.word === currentQ.targetWord.word;

            let cardStyle =
              "border-black/10 bg-[#FAFAF8] text-[#1A1A1A] hover:border-[var(--color-vermillion)] hover:bg-[var(--color-vermillion)]/5 dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]";

            if (isAnswered) {
              if (isTarget) {
                cardStyle =
                  "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shadow-xs";
              } else if (isSelected && !isTarget) {
                cardStyle =
                  "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300";
              } else {
                cardStyle = "opacity-40 border-black/5 bg-[#FAFAF8] dark:bg-[#1E232B] dark:border-white/5";
              }
            }

            return (
              <button
                key={opt.word}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(opt.word)}
                className={`group relative flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${cardStyle} cursor-pointer`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-black/5 text-[11px] font-bold text-[#64748B] dark:bg-white/5 dark:text-[#94A3B8]">
                      {idx + 1}
                    </span>
                    <span className="text-lg font-bold">{opt.word}</span>
                  </div>
                  <div className="pl-7 text-xs text-[#64748B] dark:text-[#94A3B8]">
                    {opt.reading} • {opt.meaning}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playJapaneseAudio(opt.word);
                    }}
                    className="rounded-lg p-1 text-[#64748B] hover:text-[var(--color-vermillion)] dark:text-[#94A3B8] opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Pronounce word"
                  >
                    <Volume2 size={14} />
                  </button>

                  {isAnswered && isTarget && <CheckCircle2 size={20} className="text-emerald-500" />}
                  {isAnswered && isSelected && !isTarget && <XCircle size={20} className="text-rose-500" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Post-Answer Feedback & Next Button */}
        {isAnswered && (
          <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-5 dark:border-white/5 dark:bg-[#1E232B] space-y-4 animate-in fade-in">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 size={16} /> 正解！ Correct Word Choice!
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-rose-600 dark:text-rose-400">
                      <XCircle size={16} /> 不正解 Incorrect
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Full sentence: <span className="font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">{currentQ.fullSentence}</span>
                </p>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Reading: {currentQ.reading}
                </p>
              </div>

              <button
                type="button"
                onClick={() => playJapaneseAudio(currentQ.fullSentence)}
                className="rounded-xl border border-black/10 bg-white p-2 text-[#1A1A1A] shadow-xs hover:text-[var(--color-vermillion)] dark:border-white/10 dark:bg-[#161B22] dark:text-[#F0F4F8]"
              >
                <Volume2 size={16} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleNextQuestion}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-vermillion)] py-3.5 text-xs font-bold text-white shadow-md transition hover:opacity-90 active:scale-[0.99] cursor-pointer"
            >
              <span>{currentIndex + 1 >= questions.length ? "Finish Drill & View Results" : "Next Question (Enter)"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
