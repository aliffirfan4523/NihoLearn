"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Trophy,
  Flame,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  Volume2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Share2,
  Check,
  Zap,
} from "lucide-react";
import { generateDailyChallenge, type DailyDatasets, type DailyQuestion } from "@/lib/data/daily-seed";
import { playJapaneseAudio } from "@/lib/audio";
import { sfx } from "@/lib/japanese-utils";
import { HowToPlay } from "@/components/practice/HowToPlay";

export function DailyChallengeEngine() {
  const [todayStr, setTodayStr] = useState<string>("");
  const [questions, setQuestions] = useState<DailyQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  // Stats
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, { selected: string; correct: boolean }>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [streak, setStreak] = useState(1);
  const [hasCompletedToday, setHasCompletedToday] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Midnight Countdown
  const [countdown, setCountdown] = useState<string>("");

  // Initialize date string and questions (banks fetched from the database)
  useEffect(() => {
    let isMounted = true;

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const dateFormatted = `${yyyy}-${mm}-${dd}`;

    async function loadDaily() {
      setTodayStr(dateFormatted);

      const [bankRes, particlesRes, dictationRes, grammarRes] = await Promise.all([
        fetch("/api/content/daily-bank").then((r) => r.json()).catch(() => ({ data: [] })),
        fetch("/api/content/particles").then((r) => r.json()).catch(() => ({ data: [] })),
        fetch("/api/content/dictation").then((r) => r.json()).catch(() => ({ data: [] })),
        fetch("/api/content/grammar").then((r) => r.json()).catch(() => ({ data: [] })),
      ]);

      if (!isMounted) return;

      const bank = (bankRes.data ?? []) as Array<{ category: string; payload: Record<string, unknown> }>;
      const pick = (category: string) =>
        bank.filter((b) => b.category === category).map((b) => b.payload as any);

      const datasets: DailyDatasets = {
        kanjiBank: pick("kanji"),
        vocabBank: pick("vocabulary"),
        cultureBank: pick("culture"),
        particles: particlesRes.data ?? [],
        dictation: dictationRes.data ?? [],
        grammar: grammarRes.data ?? [],
      };

      setQuestions(generateDailyChallenge(dateFormatted, datasets));
    }

    loadDaily();

    // Check streak and today completion from localStorage
    try {
      const savedDate = localStorage.getItem("niholearn-daily-last-completed");
      const savedStreak = localStorage.getItem("niholearn-daily-streak");

      if (savedStreak) {
        setStreak(parseInt(savedStreak, 10));
      }

      if (savedDate === dateFormatted) {
        setHasCompletedToday(true);
      }
    } catch {}
    return () => {
      isMounted = false;
    };
  }, []);

  // Countdown timer to midnight
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
          seconds
        ).padStart(2, "0")}`
      );
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentQ = questions[currentIndex];

  // Auto-play audio if current question has audioText
  useEffect(() => {
    if (currentQ?.audioText && !isFinished) {
      const timer = setTimeout(() => {
        playJapaneseAudio(currentQ.audioText!);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentQ, isFinished]);

  // Handle Option Select
  const handleSelectOption = (opt: string) => {
    if (isAnswerSubmitted || !currentQ) return;
    setSelectedOption(opt);
  };

  // Submit Answer
  const handleSubmitAnswer = () => {
    if (!selectedOption || !currentQ || isAnswerSubmitted) return;

    const isCorrect = selectedOption === currentQ.correctAnswer;
    setIsAnswerSubmitted(true);

    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        selected: selectedOption,
        correct: isCorrect,
      },
    }));

    if (isCorrect) {
      sfx.playCorrect();
      setScore((s) => s + 1);
    } else {
      sfx.playWrong();
    }
  };

  // Move to Next Question
  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Finished all 10 questions!
      setIsFinished(true);
      sfx.playCombo();

      // Update Streak
      const newStreak = streak + (hasCompletedToday ? 0 : 1);
      setStreak(newStreak);

      try {
        localStorage.setItem("niholearn-daily-last-completed", todayStr);
        localStorage.setItem("niholearn-daily-streak", newStreak.toString());
      } catch {}

      // Log Session to API
      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationMinutes: 4,
          level: "Mixed",
          activities: ["daily-challenge", "kanji", "vocabulary", "grammar", "listening"],
          wordsReviewed: 10,
          notes: JSON.stringify({
            date: todayStr,
            score,
            total: 10,
            streak: newStreak,
          }),
        }),
      }).catch(() => {});
    }
  };

  // Share daily results
  const handleShare = () => {
    const accuracy = Math.round((score / 10) * 100);
    const text = `NihoLearn Daily Challenge (${todayStr}) 🎯 ${score}/10 (${accuracy}%) | 🔥 ${streak} Day Streak! Practice Japanese at NihoLearn!`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
        Generating today&apos;s daily challenge...
      </div>
    );
  }

  // ── Challenge Completed Summary View ──
  if (isFinished) {
    const accuracy = Math.round((score / questions.length) * 100);

    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white p-8 text-center shadow-xs dark:border-white/15 dark:bg-[#1A1A1A]">
          {/* Confetti Celebration Particle Flare */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-400/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-purple-500/20 blur-2xl" />

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 shadow-xs">
            <Trophy size={42} />
          </div>

          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 size={14} />
            <span>Daily Challenge Completed</span>
          </span>

          <h1 className="mt-3 text-3xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
            Daily Dojo Summary
          </h1>
          <p className="mt-1 text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
            Challenge Date: {todayStr}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-[#FAFAF8] p-4 text-center dark:bg-[#1E232B]">
            <div>
              <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Score</div>
              <div className="mt-1 font-mono text-2xl font-bold text-[#C84B31] dark:text-[#E85C40]">
                {score} / 10
              </div>
            </div>
            <div>
              <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Accuracy</div>
              <div className="mt-1 font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {accuracy}%
              </div>
            </div>
            <div>
              <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Daily Streak</div>
              <div className="mt-1 font-mono text-2xl font-bold text-amber-500">
                {streak} 🔥
              </div>
            </div>
          </div>

          {/* Midnight Countdown */}
          <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-black/5 bg-[#FAFAF8] p-3 text-xs text-[#6B6B6B] dark:border-white/5 dark:bg-[#222222] dark:text-[#A0A0A0]">
            <Clock size={15} className="text-purple-500" />
            <span>Next Daily Challenge drops in:</span>
            <span className="font-mono font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
              {countdown}
            </span>
          </div>

          {/* Review Question List */}
          <div className="mt-6 space-y-2.5 text-left">
            <div className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
              Today&apos;s 10 Question Review
            </div>
            <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const answer = userAnswers[q.id];
                const isCorrect = answer?.correct;

                return (
                  <div
                    key={q.id}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-black/5 bg-[#FAFAF8] p-3 text-xs dark:border-white/5 dark:bg-[#222222]"
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5 font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                        {isCorrect ? (
                          <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />
                        ) : (
                          <XCircle size={14} className="shrink-0 text-red-500" />
                        )}
                        <span>
                          Q{idx + 1}. {q.prompt}
                        </span>
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 pl-5">
                        Answer: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{q.correctAnswer}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-7 flex gap-3">
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-black/10 bg-[#FAFAF8] py-3.5 px-4 text-xs font-bold text-[#1A1A1A] hover:bg-black/5 dark:border-white/15 dark:bg-[#1E232B] dark:text-[#FAFAFA]"
            >
              {copiedLink ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
              <span>{copiedLink ? "Copied!" : "Share"}</span>
            </button>

            <Link
              href="/practice"
              className="flex-1 rounded-2xl bg-[#C84B31] py-3.5 text-center text-xs font-bold text-white shadow-md hover:bg-[#b03e26] dark:bg-[#E85C40]"
            >
              Practice Dojo Hub
            </Link>
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

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
            <Flame size={15} />
            <span>{streak} Day Streak</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-[#6B6B6B] dark:text-[#A0A0A0]">
            <Calendar size={14} />
            <span>{todayStr}</span>
          </div>
        </div>
      </div>

      {/* How to Play */}
      <HowToPlay
        gameKey="daily-challenge"
        steps={[
          "Every day you get 10 mixed questions (vocabulary, kanji, and listening) — everyone gets the same challenge for that date.",
          "Pick an answer, then press Submit to lock it in; the correct answer is highlighted after submitting.",
          "Listening questions play their audio automatically — tap the speaker icon to replay before answering.",
          "Your score and accuracy are shown at the end, and completing a challenge extends your daily streak.",
          "A new challenge unlocks at midnight — the countdown shows how long until the next one drops.",
        ]}
        note="Tip: complete the challenge every day to keep your streak alive — missing a day is fine, but completing daily builds it up."
      />

      {/* Progress Dots Bar (1 to 10) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
            Question {currentIndex + 1} of 10
          </span>
          <span className="rounded-md bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
            {currentQ.typeLabel}
          </span>
        </div>

        <div className="flex gap-1.5">
          {questions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const answer = userAnswers[q.id];

            let dotStyle = "bg-black/10 dark:bg-white/10";
            if (isCurrent) dotStyle = "bg-[#C84B31] dark:bg-[#E85C40] ring-2 ring-[#C84B31]/30";
            else if (answer?.correct) dotStyle = "bg-emerald-500";
            else if (answer && !answer.correct) dotStyle = "bg-red-500";

            return (
              <div
                key={q.id}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${dotStyle}`}
              />
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-xs dark:border-white/15 dark:bg-[#1A1A1A] sm:p-8">
        {/* Category Label */}
        <div className="text-center">
          <span className="rounded-full bg-black/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] dark:bg-white/10 dark:text-[#A0A0A0]">
            {currentQ.category} • {currentQ.typeLabel}
          </span>

          {/* Question Prompt */}
          <h2 className="mt-4 text-xl font-bold leading-snug text-[#1A1A1A] dark:text-[#FAFAFA] sm:text-2xl">
            {currentQ.prompt}
          </h2>

          {currentQ.subtitle && (
            <p className="mt-1.5 text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
              {currentQ.subtitle}
            </p>
          )}

          {/* Kanji / Character Hero Banner */}
          {currentQ.details?.kanji && (
            <div className="my-6 font-serif text-8xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA] animate-in zoom-in-95 duration-150">
              {currentQ.details.kanji}
            </div>
          )}

          {/* Audio Playback Button (if audio question) */}
          {currentQ.audioText && (
            <div className="my-6 flex justify-center">
              <button
                type="button"
                onClick={() => playJapaneseAudio(currentQ.audioText!)}
                className="flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xs transition hover:bg-amber-600"
                aria-label="Replay audio"
              >
                <Volume2 size={36} />
              </button>
            </div>
          )}
        </div>

        {/* 4 Choices Grid */}
        <div className="mt-7 grid grid-cols-1 gap-3">
          {currentQ.options.map((option) => {
            const isChosen = selectedOption === option;
            const isCorrect = option === currentQ.correctAnswer;

            let btnStyle =
              "border-black/10 bg-[#FAFAF8] text-[#1A1A1A] hover:border-[#C84B31] dark:border-white/15 dark:bg-[#1E232B] dark:text-[#FAFAFA]";

            if (isChosen && !isAnswerSubmitted) {
              btnStyle =
                "border-[#C84B31] bg-[#C84B31]/10 text-[#C84B31] ring-2 ring-[#C84B31]/20 dark:border-[#E85C40] dark:bg-[#E85C40]/15 dark:text-[#E85C40]";
            }

            if (isAnswerSubmitted) {
              if (isCorrect) {
                btnStyle = "border-emerald-500 bg-emerald-500 text-white font-bold";
              } else if (isChosen && !isCorrect) {
                btnStyle = "border-red-500 bg-red-500 text-white font-bold";
              } else {
                btnStyle = "opacity-40 border-black/5 dark:border-white/5";
              }
            }

            return (
              <button
                key={option}
                type="button"
                disabled={isAnswerSubmitted}
                onClick={() => handleSelectOption(option)}
                className={`rounded-2xl border p-4 text-left text-sm font-semibold shadow-xs transition flex items-center justify-between ${btnStyle}`}
              >
                <span>{option}</span>
                {isAnswerSubmitted && isCorrect && <CheckCircle2 size={18} />}
                {isAnswerSubmitted && isChosen && !isCorrect && <XCircle size={18} />}
              </button>
            );
          })}
        </div>

        {/* Submit or Next Button */}
        <div className="mt-6">
          {!isAnswerSubmitted ? (
            <button
              type="button"
              onClick={handleSubmitAnswer}
              disabled={!selectedOption}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#C84B31] py-4 text-base font-bold text-white shadow-md transition hover:bg-[#b03e26] disabled:opacity-40 disabled:pointer-events-none dark:bg-[#E85C40]"
            >
              <Check size={18} />
              <span>Submit Answer</span>
            </button>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Sensei Explanation Banner */}
              <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 text-xs text-[#1A1A1A] dark:border-white/5 dark:bg-[#222222] dark:text-[#FAFAFA]">
                💡 <strong>Explanation:</strong> {currentQ.explanation}
              </div>

              <button
                type="button"
                onClick={handleNextQuestion}
                autoFocus
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 text-base font-bold text-white shadow-md hover:bg-gray-800 dark:bg-white dark:text-black"
              >
                <span>{currentIndex + 1 < questions.length ? "Next Question" : "Complete Challenge"}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
