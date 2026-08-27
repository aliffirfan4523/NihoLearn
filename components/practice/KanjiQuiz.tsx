"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  BookOpenCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Trophy,
  Flame,
  ArrowLeft,
  RotateCcw,
  Volume2,
} from "lucide-react";
import { playJapaneseAudio } from "@/lib/audio";
import { HowToPlay } from "@/components/practice/HowToPlay";

interface KanjiQuestion {
  kanji: string;
  onyomi: string[];
  kunyomi: string[];
  meaning: string;
  options: string[];
}

export function KanjiQuiz() {
  const [level, setLevel] = useState("N5");
  const [questions, setQuestions] = useState<KanjiQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const answersRef = useRef<Record<string, { kanji: string; meaning: string; correct: boolean }>>({});

  const startQuiz = useCallback(async (quizLevel: string) => {
    setLoading(true);
    setIsFinished(false);
    setSelectedOption(null);
    setStatus("idle");
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCurrentIndex(0);
    answersRef.current = {};

    try {
      const res = await fetch(`/api/kanji?level=${encodeURIComponent(quizLevel)}`);
      const json = await res.json();

      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        const pool = [...json.data].sort(() => Math.random() - 0.5);
        const qList: KanjiQuestion[] = [];
        const count = Math.min(10, pool.length);

        for (let i = 0; i < count; i++) {
          const target = pool[i];
          const otherKanji = pool.filter((k: { character: string }) => k.character !== target.character);
          const distractors = otherKanji
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map((k: { meaning: string }) => k.meaning);

          const options = [target.meaning, ...distractors].sort(() => Math.random() - 0.5);
          qList.push({
            kanji: target.character,
            onyomi: target.onyomi || [],
            kunyomi: target.kunyomi || [],
            meaning: target.meaning,
            options,
          });
        }

        setQuestions(qList);
      }
    } catch (err) {
      console.error("Failed to load kanji for quiz:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    startQuiz(level);
  }, [level, startQuiz]);

  const currentQ = questions[currentIndex];

  // Auto-log session & update KanjiProgress when finished
  useEffect(() => {
    if (isFinished && questions.length > 0) {
      const accuracy = Math.round((score / questions.length) * 100);
      const answersList = Object.entries(answersRef.current) as Array<
        [string, { kanji: string; meaning: string; correct: boolean }]
      >;

      const batch = answersList.map(([kanji, data]) => ({
        kanjiId: kanji,
        level: level,
        status: data.correct ? ("mastered" as const) : ("reviewing" as const),
        notes: data.correct ? "Quiz passed" : "Review needed",
      }));

      // 1. Update Kanji Progress
      if (batch.length > 0) {
        fetch("/api/kanji", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ batch }),
        }).catch(() => {});
      }

      // 2. Log Study Session
      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationMinutes: Math.max(1, Math.round((questions.length * 6) / 60)),
          level: level,
          activities: ["kanji", "reading"],
          kanjiReviewed: questions.length,
          notes: JSON.stringify({ score, total: questions.length, accuracy }),
        }),
      }).catch(() => {});
    }
  }, [isFinished, questions.length, score, level]);

  const handleSelect = (option: string) => {
    if (status !== "idle" || !currentQ) return;
    setSelectedOption(option);

    const isCorrect = option === currentQ.meaning;
    answersRef.current[currentQ.kanji] = {
      kanji: currentQ.kanji,
      meaning: currentQ.meaning,
      correct: isCorrect,
    };

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
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setStatus("idle");
    } else {
      setIsFinished(true);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-xl p-12 text-center text-sm text-gray-500">
        Loading Kanji quiz from database...
      </div>
    );
  }

  if (isFinished) {
    const accuracy = Math.round((score / questions.length) * 100);
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-black/10 bg-white p-8 text-center shadow-xs dark:border-white/15 dark:bg-[#1A1A1A]">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 shadow-sm">
          <Trophy size={40} />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
          {level} Kanji Quiz Complete!
        </h2>
        <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
          Great job! Results have been recorded to your progress.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-[#FAFAF8] p-4 dark:bg-[#1E232B]">
          <div>
            <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Score</div>
            <div className="mt-1 text-xl font-bold text-[#C84B31] dark:text-[#E85C40]">
              {score} / {questions.length}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Accuracy</div>
            <div className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">{accuracy}%</div>
          </div>
          <div>
            <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Max Streak</div>
            <div className="mt-1 text-xl font-bold text-purple-600 dark:text-purple-400">{maxStreak}</div>
          </div>
        </div>

        <div className="mt-7 flex gap-3">
          <Link
            href="/practice"
            className="flex-1 rounded-2xl border border-black/10 bg-[#FAFAF8] py-3 text-sm font-bold text-[#1A1A1A] transition hover:bg-black/5 dark:border-white/15 dark:bg-[#1E232B] dark:text-[#FAFAFA]"
          >
            Practice Hub
          </Link>
          <button
            type="button"
            onClick={() => startQuiz(level)}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#C84B31] py-3 text-sm font-bold text-white shadow-md hover:bg-[#b03e26] dark:bg-[#E85C40]"
          >
            <RotateCcw size={16} />
            <span>Play Again</span>
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-black/10 bg-white p-8 text-center dark:border-white/15 dark:bg-[#1A1A1A]">
        <p className="text-sm text-gray-500">No Kanji found for {level}.</p>
        <button
          type="button"
          onClick={() => startQuiz("N5")}
          className="mt-4 rounded-xl bg-[#C84B31] px-4 py-2 text-xs font-bold text-white"
        >
          Load N5 Kanji
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/practice"
          className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft size={16} /> Back to Practice
        </Link>

        {/* Level Switcher */}
        <div className="flex items-center gap-1.5">
          {["N5", "N4", "N3", "N2", "N1"].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setLevel(lvl)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                level === lvl
                  ? "bg-[#C84B31] text-white dark:bg-[#E85C40]"
                  : "bg-black/5 text-[#6B6B6B] hover:bg-black/10 dark:bg-white/10 dark:text-[#A0A0A0]"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {streak > 1 && (
          <div className="flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
            <Flame size={14} /> {streak} Streak
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-[#C84B31] transition-all duration-300 dark:bg-[#E85C40]"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-bold text-[#6B6B6B] dark:text-[#A0A0A0]">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <HowToPlay
        gameKey="kanji-quiz"
        steps={[
          "One kanji appears at a time — choose its primary English meaning from four options.",
          "Kun and on readings are shown below the kanji, and the speaker button pronounces it.",
          "Each round is 10 random kanji from your chosen JLPT level; switching levels restarts the quiz.",
          "Correct answers build your streak; a wrong answer resets it.",
          "At the end your score, accuracy, and max streak are recorded to your kanji progress.",
        ]}
        note="Tip: try to recall the meaning before scanning the answer options — use the readings bar only as a backup hint."
      />

      {/* Main Kanji Question Card */}
      <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm dark:border-white/15 dark:bg-[#1A1A1A]">
        <div className="flex justify-center">
          <span className="rounded-full bg-[#C84B31]/10 px-3 py-1 text-xs font-bold text-[#C84B31] dark:bg-[#E85C40]/20 dark:text-[#E85C40]">
            JLPT {level} Kanji
          </span>
        </div>

        <div className="mt-4 font-serif text-8xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#FAFAFA]">
          {currentQ.kanji}
        </div>

        {/* Readings Hint Bar */}
        <div className="mt-3 flex items-center justify-center gap-3 text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
          {currentQ.kunyomi.length > 0 && (
            <span>
              <strong>訓:</strong> {currentQ.kunyomi.join("、")}
            </span>
          )}
          {currentQ.onyomi.length > 0 && (
            <span>
              <strong>音:</strong> {currentQ.onyomi.join("、")}
            </span>
          )}
          <button
            type="button"
            onClick={() => playJapaneseAudio(currentQ.kanji)}
            className="rounded-md p-1 text-gray-400 hover:text-[#C84B31] dark:hover:text-[#E85C40]"
          >
            <Volume2 size={15} />
          </button>
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
          What is the primary English meaning?
        </p>

        {/* Options Grid */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === currentQ.meaning;

            let btnStyle =
              "border-black/10 bg-[#FAFAF8] text-[#1A1A1A] hover:border-[#C84B31] hover:bg-[#C84B31]/5 dark:border-white/10 dark:bg-[#1E232B] dark:text-[#FAFAFA] dark:hover:border-[#E85C40]";

            if (status !== "idle") {
              if (isCorrect) {
                btnStyle =
                  "border-emerald-500 bg-emerald-500/15 text-emerald-800 font-bold dark:text-emerald-300 dark:border-emerald-500/50";
              } else if (isSelected && !isCorrect) {
                btnStyle =
                  "border-red-500 bg-red-500/15 text-red-800 font-bold dark:text-red-300 dark:border-red-500/50";
              } else {
                btnStyle = "border-black/5 bg-gray-50 text-gray-400 opacity-60 dark:bg-white/5 dark:text-gray-500";
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={status !== "idle"}
                onClick={() => handleSelect(option)}
                className={`flex items-center justify-between rounded-2xl border p-4 text-left text-sm font-semibold capitalize transition ${btnStyle}`}
              >
                <span>{option}</span>
                {status !== "idle" && isCorrect && <CheckCircle2 size={18} className="text-emerald-600" />}
                {status !== "idle" && isSelected && !isCorrect && (
                  <XCircle size={18} className="text-red-600" />
                )}
              </button>
            );
          })}
        </div>

        {/* Next Question Button */}
        {status !== "idle" && (
          <button
            type="button"
            onClick={handleNext}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#C84B31] py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#b03e26] dark:bg-[#E85C40]"
          >
            <span>{currentIndex + 1 < questions.length ? "Next Kanji" : "View Results"}</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
