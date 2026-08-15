"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Headphones, Volume2, CheckCircle2, XCircle, ArrowRight, Trophy, Flame, RotateCcw, ArrowLeft } from "lucide-react";

import { playJapaneseAudio } from "@/lib/audio";

function playAudio(text: string) {
  playJapaneseAudio(text);
}

interface ListeningQuestion {
  word: string;
  reading: string;
  romaji: string;
  meaning: string;
  options: string[];
}

export function ListeningQuiz() {
  const [questions, setQuestions] = useState<ListeningQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadQuiz() {
      try {
        const res = await fetch("/api/vocab?level=N5&limit=100");
        const json = await res.json();
        const pool = json.data && json.data.length > 0 ? json.data : [];
        if (!isMounted || pool.length === 0) return;

        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        const qList: ListeningQuestion[] = [];
        const count = Math.min(10, shuffled.length);

        for (let i = 0; i < count; i++) {
          const target = shuffled[i % shuffled.length];
          const otherVocab = shuffled.filter((v: any) => v.id !== target.id);
          const distractors = otherVocab
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map((v: any) => (Array.isArray(v.meaning) ? v.meaning.join(", ") : String(v.meaning)));

          const targetMeaning = Array.isArray(target.meaning) ? target.meaning.join(", ") : String(target.meaning);
          const options = [targetMeaning, ...distractors].sort(() => Math.random() - 0.5);

          qList.push({
            word: target.word,
            reading: target.reading,
            romaji: target.romaji || "",
            meaning: targetMeaning,
            options,
          });
        }

        setQuestions(qList);
        setCurrentIndex(0);
        setScore(0);
        setStreak(0);
        setMaxStreak(0);
        setIsFinished(false);
      } catch (err) {
        console.error("Failed to load listening quiz vocabulary:", err);
      }
    }

    loadQuiz();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    if (currentQ) {
      playAudio(currentQ.reading || currentQ.word);
    }
  }, [currentIndex, currentQ]);

  if (questions.length === 0) {
    return <div className="p-8 text-center text-gray-500">Preparing listening quiz...</div>;
  }

  const answersRef = useRef<Record<string, { word: string; correct: boolean }>>({});

  // Auto-log session & update VocabProgress when finished
  useEffect(() => {
    if (isFinished && questions.length > 0) {
      const accuracy = Math.round((score / questions.length) * 100);
      const answersList = Object.values(answersRef.current);

      const batch = answersList.map((item) => ({
        wordId: item.word,
        level: "N5",
        status: item.correct ? ("mastered" as const) : ("reviewing" as const),
        notes: item.correct ? "Listening quiz passed" : "Listening review needed",
      }));

      // 1. Update Vocab Progress
      if (batch.length > 0) {
        fetch("/api/vocab", {
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
          durationMinutes: Math.max(1, Math.round((questions.length * 8) / 60)),
          level: "N5",
          activities: ["listening", "vocabulary"],
          wordsReviewed: questions.length,
          notes: JSON.stringify({ score, total: questions.length, accuracy, mode: "listening" }),
        }),
      }).catch(() => {});
    }
  }, [isFinished, questions.length, score]);

  const handleSelect = (option: string) => {
    if (status !== "idle" || !currentQ) return;
    setSelectedOption(option);

    const isCorrect = option === currentQ.meaning;
    answersRef.current[currentQ.word] = {
      word: currentQ.word,
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

  if (isFinished) {
    const accuracy = Math.round((score / questions.length) * 100);
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-black/10 bg-white p-8 text-center shadow-lg dark:border-white/15 dark:bg-[#1A1A1A]">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/15 text-amber-500 shadow-sm">
          <Trophy size={40} />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Listening Quiz Complete!</h2>
        <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">Your audio recognition score:</p>

        <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-[#FAFAF8] p-4 dark:bg-[#2A2A2A]">
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
            className="flex-1 rounded-2xl border border-black/10 bg-[#FAFAF8] py-3 text-sm font-bold text-[#1A1A1A] transition hover:bg-black/5 dark:border-white/15 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]"
          >
            Practice Hub
          </Link>
          <button
            type="button"
            onClick={() => {
              setCurrentIndex(0);
              setScore(0);
              setStreak(0);
              setMaxStreak(0);
              setIsFinished(false);
              setStatus("idle");
              setSelectedOption(null);
            }}
            className="flex-1 rounded-2xl bg-[#C84B31] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#b03e26] dark:bg-[#E85C40]"
          >
            Listen Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/practice"
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft size={16} /> Practice Hub
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400">
            <Flame size={16} />
            <span>{streak}</span>
          </div>
          <span className="text-xs font-semibold text-[#6B6B6B] dark:text-[#A0A0A0]">
            {currentIndex + 1} of {questions.length}
          </span>
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-[#F0F0F0] dark:bg-[#2A2A2A]">
        <div
          className="h-full bg-[#C84B31] transition-all duration-300 dark:bg-[#E85C40]"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Main Question Card */}
      <div className="rounded-3xl border border-black/10 bg-white p-8 text-center shadow-lg dark:border-white/15 dark:bg-[#1A1A1A]">
        <div className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
          Listen to the Audio & Pick the Meaning
        </div>

        {/* Big Audio Play Button */}
        <div className="my-8 flex justify-center">
          <button
            type="button"
            onClick={() => playAudio(currentQ.reading || currentQ.word)}
            className="flex h-28 w-28 items-center justify-center rounded-3xl bg-amber-500 text-white shadow-xl transition hover:scale-105 hover:bg-amber-600"
            aria-label="Replay audio"
          >
            <Volume2 size={48} />
          </button>
        </div>

        {status !== "idle" && (
          <div className="mb-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="font-serif text-3xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
              {currentQ.word}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {currentQ.reading} ({currentQ.romaji})
            </div>
          </div>
        )}

        {/* 4 Choices */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {currentQ.options.map((option) => {
            const isCorrect = option === currentQ.meaning;
            const isChosen = selectedOption === option;

            let btnStyle =
              "border-black/10 bg-[#FAFAF8] text-[#1A1A1A] hover:border-[#C84B31] dark:border-white/15 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]";

            if (status !== "idle") {
              if (isCorrect) {
                btnStyle = "border-emerald-500 bg-emerald-500 text-white font-bold";
              } else if (isChosen && !isCorrect) {
                btnStyle = "border-rose-500 bg-rose-500 text-white font-bold";
              } else {
                btnStyle = "opacity-40 border-black/5 dark:border-white/5";
              }
            }

            return (
              <button
                key={option}
                type="button"
                disabled={status !== "idle"}
                onClick={() => handleSelect(option)}
                className={`rounded-2xl border p-4 text-center text-sm font-semibold shadow-xs transition ${btnStyle}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {/* Feedback Alert */}
        {status !== "idle" && (
          <div className="mt-6 flex items-center justify-between rounded-2xl bg-emerald-500/15 p-4 text-emerald-900 dark:text-emerald-300 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              {status === "correct" ? <CheckCircle2 size={22} /> : <XCircle size={22} className="text-rose-500" />}
              <span className="font-bold text-sm">
                {status === "correct" ? "Correct!" : `Correct meaning: ${currentQ.meaning}`}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNext}
              autoFocus
              className="flex items-center gap-1 rounded-xl bg-black px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-gray-800 dark:bg-white dark:text-black"
            >
              <span>Next</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
