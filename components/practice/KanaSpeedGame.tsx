"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Zap, Timer, Flame, Trophy, RotateCcw, ArrowLeft } from "lucide-react";
import { hiraganaSeed } from "@/lib/data/hiragana";
import { katakanaSeed } from "@/lib/data/katakana";
import type { KanaCharacter } from "@/types";

export function KanaSpeedGame() {
  const [type, setType] = useState<"hiragana" | "katakana" | "mixed">("hiragana");
  const [gameState, setGameState] = useState<"idle" | "playing" | "finished">("idle");
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedInput, setTypedInput] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [charList, setCharList] = useState<Omit<KanaCharacter, "status">[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const correctKanaIdsRef = useRef<Set<string>>(new Set());
  const wrongKanaIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem("niholearn-kana-speed-highscore");
      if (saved) setHighScore(parseInt(saved, 10));
    } catch {}
  }, []);

  const startGame = () => {
    let pool: Omit<KanaCharacter, "status">[] = [];
    if (type === "hiragana") pool = [...hiraganaSeed];
    else if (type === "katakana") pool = [...katakanaSeed];
    else pool = [...hiraganaSeed, ...katakanaSeed];

    const shuffled = pool.sort(() => Math.random() - 0.5);
    setCharList(shuffled);
    setCurrentIndex(0);
    setTypedInput("");
    setCorrectCount(0);
    setWrongCount(0);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeft(60);
    setGameState("playing");
  };

  // Timer countdown
  useEffect(() => {
    if (gameState !== "playing") return;

    if (timeLeft <= 0) {
      setGameState("finished");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  // Focus input
  useEffect(() => {
    if (gameState === "playing" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState, currentIndex]);

  // Handle typing input
  const currentChar = charList[currentIndex];

  const handleInputChange = (val: string) => {
    if (gameState !== "playing" || !currentChar) return;

    const trimmed = val.trim().toLowerCase();
    const expected = currentChar.romaji.toLowerCase();

    if (trimmed === expected) {
      // Correct match!
      correctKanaIdsRef.current.add(currentChar.id);
      setCorrectCount((c) => c + 1);
      setStreak((s) => {
        const next = s + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
      setTypedInput("");
      setCurrentIndex((i) => (i + 1) % charList.length);
    } else {
      setTypedInput(val);
      // Check if typed length exceeds expected without matching -> wrong
      if (trimmed.length >= expected.length + 1) {
        wrongKanaIdsRef.current.add(currentChar.id);
        setWrongCount((w) => w + 1);
        setStreak(0);
        setTypedInput("");
      }
    }
  };

  // Check and save high score upon finish
  useEffect(() => {
    if (gameState === "finished") {
      if (correctCount > highScore) {
        setHighScore(correctCount);
        try {
          localStorage.setItem("niholearn-kana-speed-highscore", correctCount.toString());
        } catch {}
      }

      // 1. Update Kana Progress
      const batchUpdates: Array<{ kanaId: string; status: "mastered" | "reviewing" }> = [];
      for (const id of correctKanaIdsRef.current) {
        batchUpdates.push({ kanaId: id, status: "mastered" });
      }
      for (const id of wrongKanaIdsRef.current) {
        if (!correctKanaIdsRef.current.has(id)) {
          batchUpdates.push({ kanaId: id, status: "reviewing" });
        }
      }

      if (batchUpdates.length > 0) {
        fetch("/api/kana", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ batch: batchUpdates }),
        }).catch(() => {});
      }

      // 2. Log session
      const total = correctCount + wrongCount;
      const acc = total > 0 ? Math.round((correctCount / total) * 100) : 100;
      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationMinutes: 1,
          level: "Kana",
          activities: ["kana-speed", "typing"],
          wordsReviewed: correctCount,
          notes: JSON.stringify({ score: correctCount, total, accuracy: acc, type }),
        }),
      }).catch(() => {});
    }
  }, [gameState, correctCount, wrongCount, highScore, type]);

  const accuracy =
    correctCount + wrongCount > 0
      ? Math.round((correctCount / (correctCount + wrongCount)) * 100)
      : 100;

  const wpm = correctCount; // 1-minute test, so words/minute = correct count

  return (
    <div className="mx-auto max-w-xl space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/practice"
          className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft size={16} /> Back to Practice
        </Link>
        <div className="flex items-center gap-1.5 rounded-xl bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
          <Trophy size={14} /> High Score: {highScore}
        </div>
      </div>

      {gameState === "idle" && (
        <div className="rounded-3xl border border-black/10 bg-white p-8 text-center shadow-lg dark:border-white/15 dark:bg-[#1A1A1A]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-600 text-white shadow-md">
            <Zap size={40} />
          </div>
          <h1 className="mt-5 text-3xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Kana Speed Sprint</h1>
          <p className="mt-2 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
            How fast can you read Kana? Type romaji as quickly and accurately as possible in 60 seconds.
          </p>

          <div className="mt-7 flex justify-center gap-2">
            {(["hiragana", "katakana", "mixed"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-xl px-4 py-2 text-sm font-bold capitalize transition ${
                  type === t
                    ? "bg-[#C84B31] text-white shadow-xs dark:bg-[#E85C40]"
                    : "border border-black/10 bg-[#FAFAF8] text-[#6B6B6B] hover:bg-black/5 dark:border-white/15 dark:bg-[#2A2A2A] dark:text-[#A0A0A0]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={startGame}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-600 py-4 text-base font-bold text-white shadow-lg transition hover:bg-purple-700"
          >
            <Zap size={20} />
            <span>Start 60s Sprint</span>
          </button>
        </div>
      )}

      {gameState === "playing" && currentChar && (
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white p-3 shadow-xs dark:border-white/15 dark:bg-[#1A1A1A]">
              <Timer size={18} className="text-blue-500" />
              <span className="font-mono text-xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                {timeLeft}s
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white p-3 shadow-xs dark:border-white/15 dark:bg-[#1A1A1A]">
              <Flame size={18} className="text-orange-500" />
              <span className="font-mono text-xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                {streak} streak
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white p-3 shadow-xs dark:border-white/15 dark:bg-[#1A1A1A]">
              <Zap size={18} className="text-purple-500" />
              <span className="font-mono text-xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                {correctCount}
              </span>
            </div>
          </div>

          {/* Current Kana Flashcard */}
          <div className="rounded-3xl border border-black/10 bg-white p-12 text-center shadow-xl dark:border-white/15 dark:bg-[#1A1A1A]">
            <div className="font-serif text-9xl font-bold leading-none text-[#1A1A1A] dark:text-[#FAFAFA] animate-in zoom-in-95 duration-100">
              {currentChar.character}
            </div>

            <div className="mt-8">
              <input
                ref={inputRef}
                type="text"
                value={typedInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="type romaji..."
                autoComplete="off"
                autoCapitalize="off"
                spellCheck="false"
                className="w-full rounded-2xl border-2 border-purple-500/40 bg-[#FAFAF8] px-4 py-4 text-center font-mono text-2xl font-bold text-[#1A1A1A] focus:border-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-500/20 dark:border-purple-500/50 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]"
              />
            </div>
          </div>
        </div>
      )}

      {gameState === "finished" && (
        <div className="rounded-3xl border border-black/10 bg-white p-8 text-center shadow-lg dark:border-white/15 dark:bg-[#1A1A1A]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-600 text-white shadow-md">
            <Trophy size={40} />
          </div>
          <h2 className="mt-5 text-3xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Time&apos;s Up!</h2>
          <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">Sprint Results</p>

          <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-[#FAFAF8] p-5 dark:bg-[#2A2A2A]">
            <div>
              <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Speed (CPM)</div>
              <div className="mt-1 font-mono text-3xl font-bold text-purple-600 dark:text-purple-400">
                {wpm}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Accuracy</div>
              <div className="mt-1 font-mono text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {accuracy}%
              </div>
            </div>
            <div>
              <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Max Streak</div>
              <div className="mt-1 font-mono text-3xl font-bold text-orange-600 dark:text-orange-400">
                {maxStreak}
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <Link
              href="/practice"
              className="flex-1 rounded-2xl border border-black/10 bg-[#FAFAF8] py-3.5 text-sm font-bold text-[#1A1A1A] transition hover:bg-black/5 dark:border-white/15 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]"
            >
              Back to Practice
            </Link>
            <button
              type="button"
              onClick={startGame}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-purple-600 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-purple-700"
            >
              <RotateCcw size={16} />
              <span>Sprint Again</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
