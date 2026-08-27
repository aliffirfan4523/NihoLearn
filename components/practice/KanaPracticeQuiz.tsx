"use client";

import { useState, useEffect, useRef } from "react";
import { Volume2, CheckCircle2, XCircle, RotateCcw, ArrowRight, Trophy, Flame } from "lucide-react";
import type { KanaPracticeConfig, PracticeMode } from "@/components/practice/KanaPracticeSetup";
import type { KanaCharacter } from "@/types";

import { playJapaneseAudio } from "@/lib/audio";

function playKanaAudio(text: string) {
  playJapaneseAudio(text);
}

interface QuestionItem {
  target: Omit<KanaCharacter, "status">;
  mode: PracticeMode;
  options: string[]; // For multiple choice
}

export function KanaPracticeQuiz({
  config,
  onExit,
}: {
  config: KanaPracticeConfig;
  onExit: () => void;
}) {
  // All kana of the configured type, fetched from the database on mount
  const [pool, setPool] = useState<Omit<KanaCharacter, "status">[]>([]);

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedInput, setTypedInput] = useState("");
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const answersMapRef = useRef<Record<string, { character: string; romaji: string; correct: boolean }>>({});

  // Fetch kana from the database (filtered by the configured type)
  useEffect(() => {
    let isMounted = true;

    fetch(`/api/kana?type=${config.type}`)
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;
        setPool(
          (json?.data ?? []).map(
            (k: { id: string; type: "hiragana" | "katakana"; character: string; romaji: string; row: string }) => ({
              id: k.id,
              type: k.type,
              character: k.character,
              romaji: k.romaji,
              row: k.row,
            })
          )
        );
      })
      .catch((err) => console.error("Failed to load kana:", err));

    return () => {
      isMounted = false;
    };
  }, [config.type]);

  // Generate Questions
  useEffect(() => {
    if (pool.length === 0) return;

    const selectedPool = pool.filter((k) => config.selectedRows.includes(k.row));
    if (selectedPool.length === 0) return;

    let items = [...selectedPool];
    if (config.order === "random") {
      items = items.sort(() => Math.random() - 0.5);
    }

    const questionList: QuestionItem[] = [];
    const count = Math.min(config.sessionSize, items.length);

    for (let i = 0; i < count; i++) {
      const target = items[i % items.length];
      const mode = config.modes[Math.floor(Math.random() * config.modes.length)];

      // Generate 4 options for choice modes
      let options: string[] = [];
      if (mode.includes("choice")) {
        const isChoiceKana = mode === "romaji_to_choice" || mode === "audio_to_choice";
        const targetValue = isChoiceKana ? target.character : target.romaji;
        const otherPool = pool.filter((k) => k.id !== target.id);
        const distractors = otherPool
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map((k) => (isChoiceKana ? k.character : k.romaji));

        options = [targetValue, ...distractors].sort(() => Math.random() - 0.5);
      }

      questionList.push({ target, mode, options });
    }

    setQuestions(questionList);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setIsFinished(false);
    answersMapRef.current = {};
  }, [pool]);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    if (currentQ && currentQ.mode.includes("audio")) {
      playKanaAudio(currentQ.target.character);
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, currentQ]);

  // Auto-log session & update KanaProgress when finished
  useEffect(() => {
    if (isFinished && questions.length > 0) {
      const accuracy = Math.round((score / questions.length) * 100);
      const answersList = Object.entries(answersMapRef.current);

      const batch = answersList.map(([kanaId, data]) => ({
        kanaId,
        status: data.correct ? ("mastered" as const) : ("reviewing" as const),
      }));

      const struggles = answersList
        .filter(([_, data]) => !data.correct)
        .map(([kanaId, data]) => ({ kanaId, character: data.character, romaji: data.romaji }));

      // 1. Update Kana Progress (mastered / reviewing)
      if (batch.length > 0) {
        fetch("/api/kana", {
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
          durationMinutes: Math.max(1, Math.round((questions.length * 5) / 60)),
          level: "Kana",
          activities: ["kana-practice", "reading"],
          wordsReviewed: questions.length,
          notes: JSON.stringify({
            score,
            total: questions.length,
            accuracy,
            type: config.type,
            struggles,
          }),
        }),
      }).catch(() => {});
    }
  }, [isFinished, questions.length, score, config.type]);

  const handleAnswer = (answer: string) => {
    if (status !== "idle" || !currentQ) return;

    const isTypingRomaji =
      currentQ.mode === "kana_to_typing" ||
      currentQ.mode === "audio_to_typing" ||
      currentQ.mode === "romaji_to_typing";

    const isCorrect = isTypingRomaji
      ? answer.trim().toLowerCase() === currentQ.target.romaji.toLowerCase() ||
        answer.trim() === currentQ.target.character
      : answer === currentQ.target.romaji || answer === currentQ.target.character;

    answersMapRef.current[currentQ.target.id] = {
      character: currentQ.target.character,
      romaji: currentQ.target.romaji,
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

    playKanaAudio(currentQ.target.character);
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setTypedInput("");
      setSelectedChoice(null);
      setStatus("idle");
    } else {
      setIsFinished(true);
    }
  };

  if (questions.length === 0) {
    return <div className="p-8 text-center text-gray-500">Loading quiz...</div>;
  }

  if (isFinished) {
    const accuracy = Math.round((score / questions.length) * 100);
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-black/10 bg-white p-8 text-center shadow-xs dark:border-white/15 dark:bg-[#1A1A1A]">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 shadow-sm">
          <Trophy size={40} />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Session Complete!</h2>
        <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">Here is your practice summary:</p>

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
            <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Best Streak</div>
            <div className="mt-1 text-xl font-bold text-[#2D5F8A] dark:text-[#60A5FA]">{maxStreak}</div>
          </div>
        </div>

        <div className="mt-7 flex gap-3">
          <button
            type="button"
            onClick={onExit}
            className="flex-1 rounded-2xl border border-black/10 bg-[#FAFAF8] py-3 text-sm font-bold text-[#1A1A1A] transition hover:bg-black/5 dark:border-white/15 dark:bg-[#1E232B] dark:text-[#FAFAFA]"
          >
            Change Settings
          </button>
          <button
            type="button"
            onClick={() => {
              setCurrentIndex(0);
              setScore(0);
              setStreak(0);
              setMaxStreak(0);
              setIsFinished(false);
              setStatus("idle");
              setTypedInput("");
            }}
            className="flex-1 rounded-2xl bg-[#C84B31] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#b03e26] dark:bg-[#E85C40]"
          >
            Practice Again
          </button>
        </div>
      </div>
    );
  }

  const isTyping =
    currentQ.mode === "romaji_to_typing" ||
    currentQ.mode === "kana_to_typing" ||
    currentQ.mode === "audio_to_typing";

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Progress Bar & Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onExit}
          className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          ✕ Exit Quiz
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
            <Flame size={16} />
            <span>{streak}</span>
          </div>
          <span className="text-xs font-semibold text-[#6B6B6B] dark:text-[#A0A0A0]">
            {currentIndex + 1} of {questions.length}
          </span>
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-[#F0F0F0] dark:bg-[#1E232B]">
        <div
          className="h-full bg-[#C84B31] transition-all duration-300 dark:bg-[#E85C40]"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Main Question Card */}
      <div className="relative rounded-2xl border border-black/10 bg-white p-8 text-center shadow-xs dark:border-white/15 dark:bg-[#1A1A1A]">
        <div className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
          {currentQ.mode.includes("audio")
            ? "Listen and Answer"
            : currentQ.mode.startsWith("romaji")
            ? "Match the Kana"
            : "Identify Romaji"}
        </div>

        {/* Prompt */}
        <div className="my-6 flex flex-col items-center justify-center">
          {currentQ.mode.includes("audio") ? (
            <button
              type="button"
              onClick={() => playKanaAudio(currentQ.target.character)}
              className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#C84B31] dark:bg-[#E85C40] text-white shadow-xs transition hover:opacity-90"
              aria-label="Play audio"
            >
              <Volume2 size={40} />
            </button>
          ) : currentQ.mode.startsWith("romaji") ? (
            <div className="font-mono text-6xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
              {currentQ.target.romaji}
            </div>
          ) : (
            <div className="font-serif text-8xl font-bold leading-none text-[#1A1A1A] dark:text-[#FAFAFA]">
              {currentQ.target.character}
            </div>
          )}

          {!currentQ.mode.includes("audio") && (
            <button
              type="button"
              onClick={() => playKanaAudio(currentQ.target.character)}
              className="mt-3 flex items-center gap-1 rounded-full bg-black/5 px-3 py-1 text-xs text-gray-500 hover:bg-black/10 dark:bg-white/10 dark:text-gray-400"
            >
              <Volume2 size={13} /> Listen
            </button>
          )}
        </div>

        {/* Typing Input */}
        {isTyping && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (status === "idle" && typedInput.trim()) {
                handleAnswer(typedInput);
              } else if (status !== "idle") {
                handleNext();
              }
            }}
            className="space-y-4"
          >
            <input
              ref={inputRef}
              type="text"
              value={typedInput}
              disabled={status !== "idle"}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder="Type romaji (e.g. ka, shi)..."
              className="w-full rounded-2xl border border-black/15 bg-[#FAFAF8] px-4 py-3.5 text-center font-mono text-xl font-bold focus:border-[#C84B31] focus:outline-none focus:ring-2 focus:ring-[#C84B31]/30 dark:border-white/20 dark:bg-[#1E232B] dark:text-[#FAFAFA]"
            />
            {status === "idle" && (
              <button
                type="submit"
                disabled={!typedInput.trim()}
                className="w-full rounded-2xl bg-[#C84B31] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#b03e26] disabled:opacity-40 dark:bg-[#E85C40]"
              >
                Submit Answer
              </button>
            )}
          </form>
        )}

        {/* Multiple Choice Buttons */}
        {!isTyping && (
          <div className="grid grid-cols-2 gap-3">
            {currentQ.options.map((option) => {
              const isTarget =
                option === currentQ.target.character || option === currentQ.target.romaji;
              const isChosen = selectedChoice === option;

              let btnStyle =
                "border-black/10 bg-[#FAFAF8] text-[#1A1A1A] hover:border-[#C84B31] dark:border-white/15 dark:bg-[#1E232B] dark:text-[#FAFAFA]";

              if (status !== "idle") {
                if (isTarget) {
                  btnStyle = "border-emerald-500 bg-emerald-500 text-white font-bold";
                } else if (isChosen && !isTarget) {
                  btnStyle = "border-red-500 bg-red-500 text-white font-bold";
                } else {
                  btnStyle = "opacity-40 border-black/5 dark:border-white/5";
                }
              }

              return (
                <button
                  key={option}
                  type="button"
                  disabled={status !== "idle"}
                  onClick={() => {
                    setSelectedChoice(option);
                    handleAnswer(option);
                  }}
                  className={`rounded-2xl border p-4 text-center font-serif text-2xl font-bold shadow-xs transition ${btnStyle}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        )}

        {/* Feedback Alert & Next Button */}
        {status !== "idle" && (
          <div className="mt-6 animate-in fade-in zoom-in-95 duration-200">
            <div
              className={`flex items-center justify-between rounded-2xl p-4 ${
                status === "correct"
                  ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                  : "bg-red-500/15 text-red-800 dark:text-red-300"
              }`}
            >
              <div className="flex items-center gap-2">
                {status === "correct" ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
                <div className="text-left">
                  <div className="text-sm font-bold">
                    {status === "correct" ? "Correct!" : "Incorrect"}
                  </div>
                  <div className="text-xs">
                    {currentQ.target.character} = {currentQ.target.romaji}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                autoFocus
                className="flex items-center gap-1 rounded-xl bg-black px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
