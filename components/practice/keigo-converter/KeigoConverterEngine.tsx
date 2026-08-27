"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Volume2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Trophy,
  Flame,
  RotateCcw,
  ArrowLeft,
  Briefcase,
  Sparkles,
  BookOpen,
  Check,
  Search,
  HelpCircle,
  Award,
  Layers,
  ArrowUpDown,
  Compass,
} from "lucide-react";
import { playJapaneseAudio } from "@/lib/audio";
import { HowToPlay } from "@/components/practice/HowToPlay";

type KeigoTargetType = "sonkeigo" | "kenjougo" | "polite";
type AppMode = "quiz" | "flashcards";

interface KeigoExercise {
  id: string;
  plain: string;
  polite: string;
  sonkeigo: string; // Honorific (respect for others' actions)
  kenjougo: string; // Humble (lowering oneself/in-group actions)
  meaning: string;
  contextNote: string | null;
}

interface KeigoQuizQuestion {
  id: string;
  exercise: KeigoExercise;
  targetType: KeigoTargetType;
  promptText: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
}

interface SessionResultItem {
  question: KeigoQuizQuestion;
  selectedOption: string;
  isCorrect: boolean;
}

export function KeigoConverterEngine() {
  const [appMode, setAppMode] = useState<AppMode>("quiz");
  const [selectedTargetType, setSelectedTargetType] = useState<"all" | KeigoTargetType>("all");

  // Content pool fetched from the database
  const [allExercises, setAllExercises] = useState<KeigoExercise[]>([]);
  const [loading, setLoading] = useState(true);

  // Quiz state
  const [questions, setQuestions] = useState<KeigoQuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [sessionResults, setSessionResults] = useState<SessionResultItem[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Flashcards state
  const [searchQuery, setSearchQuery] = useState("");
  const [flashcardFlipped, setFlashcardFlipped] = useState<Record<string, boolean>>({});

  // Generate Quiz Questions from the fetched exercise pool
  const generateQuestions = useCallback(
    (typeFilter: "all" | KeigoTargetType) => {
      const qList: KeigoQuizQuestion[] = [];
      const typesToUse: KeigoTargetType[] =
        typeFilter === "all" ? ["sonkeigo", "kenjougo", "polite"] : [typeFilter];

      allExercises.forEach((ex) => {
        typesToUse.forEach((targetType) => {
          let correctAnswer = "";
          let typeLabel = "";
          let description = "";

          if (targetType === "sonkeigo") {
            correctAnswer = ex.sonkeigo;
            typeLabel = "Honorific (尊敬語 · Sonkeigo - Elevating Others)";
            description = `Used when speaking of actions performed by your customer, superior, or external partner.`;
          } else if (targetType === "kenjougo") {
            correctAnswer = ex.kenjougo;
            typeLabel = "Humble (謙譲語 · Kenjougo - Lowering Self)";
            description = `Used when speaking of actions performed by yourself or members of your in-group (company).`;
          } else {
            correctAnswer = ex.polite;
            typeLabel = "Polite (丁寧語 · Teineigo - Standard Desu/Masu)";
            description = `Standard polite form used in general courteous social conversation.`;
          }

          // Generate clever distractors (other forms of this verb + other keigo verbs)
          const candidates: string[] = [];
          if (targetType !== "sonkeigo") candidates.push(ex.sonkeigo);
          if (targetType !== "kenjougo") candidates.push(ex.kenjougo);
          if (targetType !== "polite") candidates.push(ex.polite);

          // Add distractors from other verbs to make 4 options total
          allExercises.filter((other) => other.id !== ex.id).forEach((other) => {
            if (targetType === "sonkeigo") candidates.push(other.sonkeigo);
            else if (targetType === "kenjougo") candidates.push(other.kenjougo);
            else candidates.push(other.polite);
          });

          const uniqueDistractors = Array.from(new Set(candidates))
            .filter((c) => c !== correctAnswer)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

          const options = [correctAnswer, ...uniqueDistractors].sort(
            () => Math.random() - 0.5
          );

          qList.push({
            id: `${ex.id}-${targetType}`,
            exercise: ex,
            targetType,
            promptText: ex.plain,
            correctAnswer,
            options,
            explanation: `${typeLabel}: ${description} ${ex.contextNote ? `\n\nScenario Note: ${ex.contextNote}` : ""}`,
          });
        });
      });

      const shuffled = [...qList].sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      setCurrentIndex(0);
      setSelectedOption(null);
      setStatus("idle");
      setScore(0);
      setStreak(0);
      setMaxStreak(0);
      setIsFinished(false);
      setSessionResults([]);
      setStartTime(Date.now());
    },
    [allExercises]
  );

  useEffect(() => {
    generateQuestions(selectedTargetType);
  }, [selectedTargetType, generateQuestions]);

  // Fetch the full exercise pool from the database once on mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/content/keigo");
        const json = await res.json();

        if (json.data && Array.isArray(json.data) && !cancelled) {
          setAllExercises(json.data as KeigoExercise[]);
        }
      } catch (err) {
        console.error("Failed to load keigo exercises:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const currentQ = questions[currentIndex];

  // Handle option select
  const handleSelectOption = (option: string) => {
    if (status !== "idle" || !currentQ) return;

    setSelectedOption(option);
    const isCorrect = option === currentQ.correctAnswer;

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

    setSessionResults((prev) => [
      ...prev,
      {
        question: currentQ,
        selectedOption: option,
        isCorrect,
      },
    ]);

    // Audio Playback
    playJapaneseAudio(currentQ.correctAnswer);
  };

  // Next Question
  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setStatus("idle");
    } else {
      setIsFinished(true);
    }
  };

  // Keyboard shortcuts (1-4 and Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (appMode !== "quiz" || isFinished || !currentQ) return;

      if (status !== "idle") {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
          e.preventDefault();
          handleNext();
        }
        return;
      }

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= currentQ.options.length) {
        e.preventDefault();
        handleSelectOption(currentQ.options[num - 1]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [appMode, status, isFinished, currentQ, currentIndex, questions.length]);

  // Session Logging to /api/sessions
  const loggedRef = useRef(false);
  useEffect(() => {
    if (isFinished && questions.length > 0 && !loggedRef.current) {
      loggedRef.current = true;
      const durationMin = Math.max(1, Math.round((Date.now() - startTime) / 60000));
      const accuracy = Math.round((score / questions.length) * 100);

      // 1. Batch grammar log
      const grammarBatch = questions.map((q) => ({
        grammarId: `keigo_${q.id}`,
        level: "N3",
        status: (score / questions.length >= 0.7 ? "mastered" : "reviewing") as "mastered" | "reviewing",
        notes: `Keigo conversion: ${q.promptText} -> ${q.correctAnswer}`,
      }));

      fetch("/api/grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch: grammarBatch }),
      }).catch(() => {});

      // 2. Study session log
      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationMinutes: durationMin,
          level: "N3",
          activities: ["keigo-converter", "grammar", "politeness"],
          wordsReviewed: questions.length * 3,
          notes: JSON.stringify({
            mode: "keigo-converter",
            targetType: selectedTargetType,
            score,
            total: questions.length,
            accuracy,
            maxStreak,
          }),
        }),
      }).catch(() => {});
    }

    if (!isFinished) {
      loggedRef.current = false;
    }
  }, [isFinished, questions, score, selectedTargetType, maxStreak, startTime]);

  // Filtered flashcards list
  const filteredFlashcards = useMemo(() => {
    if (!searchQuery.trim()) return allExercises;
    const q = searchQuery.toLowerCase();
    return allExercises.filter(
      (item) =>
        item.plain.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q) ||
        item.sonkeigo.toLowerCase().includes(q) ||
        item.kenjougo.toLowerCase().includes(q) ||
        item.polite.toLowerCase().includes(q)
    );
  }, [searchQuery, allExercises]);

  // Toggle flashcard flip
  const toggleFlip = (id: string) => {
    setFlashcardFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // While the exercise pool is being fetched
  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-12 text-center text-sm text-gray-500">
        Loading keigo exercises from database...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/practice"
          className="flex items-center gap-1.5 text-xs font-semibold text-[#6B6B6B] hover:text-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:text-white"
        >
          <ArrowLeft size={16} /> Practice Hub
        </Link>

        {/* Mode Switcher: Quiz vs Reference Deck */}
        <div className="flex items-center gap-1.5 rounded-xl border border-black/10 bg-white p-1 shadow-xs dark:border-white/10 dark:bg-[#161B22]">
          <button
            type="button"
            onClick={() => setAppMode("quiz")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              appMode === "quiz"
                ? "bg-[#C84B31] dark:bg-[#E85C40] text-white shadow-xs"
                : "text-[#6B6B6B] hover:text-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:text-white"
            }`}
          >
            <Flame size={13} />
            <span>Keigo Quiz</span>
          </button>

          <button
            type="button"
            onClick={() => setAppMode("flashcards")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              appMode === "flashcards"
                ? "bg-[#C84B31] dark:bg-[#E85C40] text-white shadow-xs"
                : "text-[#6B6B6B] hover:text-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:text-white"
            }`}
          >
            <BookOpen size={13} />
            <span>Keigo Matrix</span>
          </button>
        </div>
      </div>

      <HowToPlay
        gameKey="keigo-converter"
        steps={[
          "A plain casual verb appears with a target-form badge — pick the correct conversion (honorific 尊敬語, humble 謙譲語, or polite 丁寧語) from the 4 options.",
          "After answering you see the correct form plus an explanation of the politeness perspective; click Continue to move on.",
          "Speed things up with the keyboard: press 1-4 to choose an option and Enter, Space, or ArrowRight to continue.",
          "Correct answers extend your streak (a miss resets it); the results screen shows your score, accuracy, max streak, and a full review.",
          "Narrow the drill with the filter bar, or switch to Keigo Matrix mode for a searchable chart of every verb in all three forms.",
        ]}
        note="Tip: 尊敬語 elevates the other person's actions while 謙譲語 humbles your own — thinking about who is acting usually reveals the answer."
      />

      {/* ─── FLASHCARDS & REFERENCE MATRIX VIEW ────────────────────────────── */}
      {appMode === "flashcards" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#161B22] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA] flex items-center gap-2">
                  <Briefcase size={20} className="text-[#C84B31] dark:text-[#E85C40]" />
                  <span>Keigo & Politeness Matrix Deck</span>
                </h2>
                <p className="mt-1 text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
                  Side-by-side Japanese business honorific (尊敬語) and humble (謙譲語) conversion chart.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[200px]">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search verb..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-[#FAFAF8] pl-8 pr-3 py-1.5 text-xs text-[#1A1A1A] placeholder-gray-400 focus:border-[#C84B31] dark:border-[#E85C40] focus:outline-hidden dark:border-white/10 dark:bg-[#1E232B] dark:text-[#FAFAFA]"
                />
              </div>
            </div>

            {/* Quick Summary Pill Legend */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 pt-2 text-xs">
              <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-700 dark:text-blue-300">
                <strong className="block text-[11px] uppercase tracking-wider">
                  丁寧語 · Teineigo
                </strong>
                Standard polite forms with 〜ます / 〜です.
              </div>
              <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-700 dark:text-emerald-300">
                <strong className="block text-[11px] uppercase tracking-wider">
                  尊敬語 · Sonkeigo
                </strong>
                Honorifics that elevate the customer or boss&apos;s actions.
              </div>
              <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-700 dark:text-purple-300">
                <strong className="block text-[11px] uppercase tracking-wider">
                  謙譲語 · Kenjougo
                </strong>
                Humble forms that lower your own or company&apos;s actions.
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredFlashcards.map((ex) => (
              <div
                key={ex.id}
                className="rounded-2xl border border-black/10 bg-white p-5 shadow-xs transition hover:shadow-xs dark:border-white/10 dark:bg-[#161B22] space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
                      Casual / Plain Form
                    </span>
                    <h3 className="font-serif text-xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                      {ex.plain}
                    </h3>
                    <p className="text-xs font-semibold text-[#C84B31] dark:text-[#E85C40]">
                      &quot;{ex.meaning}&quot;
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => playJapaneseAudio(ex.plain)}
                    className="rounded-full p-2 text-gray-400 hover:bg-black/5 hover:text-[#1A1A1A] dark:hover:bg-white/10 dark:hover:text-white"
                    title="Pronounce Casual"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>

                <div className="space-y-2 border-t border-black/5 pt-3 dark:border-white/5 text-xs">
                  {/* Polite */}
                  <div className="flex items-center justify-between rounded-xl bg-blue-500/5 p-2.5 dark:bg-blue-500/10">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                        Polite (丁寧語)
                      </span>
                      <div className="font-serif text-sm font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                        {ex.polite}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => playJapaneseAudio(ex.polite)}
                      className="text-blue-600 dark:text-blue-400"
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>

                  {/* Sonkeigo */}
                  <div className="flex items-center justify-between rounded-xl bg-emerald-500/5 p-2.5 dark:bg-emerald-500/10">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        Honorific (尊敬語) · Others
                      </span>
                      <div className="font-serif text-sm font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                        {ex.sonkeigo}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => playJapaneseAudio(ex.sonkeigo)}
                      className="text-emerald-600 dark:text-emerald-400"
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>

                  {/* Kenjougo */}
                  <div className="flex items-center justify-between rounded-xl bg-purple-500/5 p-2.5 dark:bg-purple-500/10">
                    <div>
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                        Humble (謙譲語) · Self
                      </span>
                      <div className="font-serif text-sm font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                        {ex.kenjougo}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => playJapaneseAudio(ex.kenjougo)}
                      className="text-purple-600 dark:text-purple-400"
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>
                </div>

                {ex.contextNote && (
                  <div className="rounded-xl border border-black/5 bg-[#FAFAF8] p-2.5 text-[11px] leading-relaxed text-[#6B6B6B] dark:border-white/5 dark:bg-[#1E232B] dark:text-[#A0A0A0]">
                    💡 <strong>Usage Note:</strong> {ex.contextNote}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => setAppMode("quiz")}
              className="rounded-2xl bg-[#C84B31] dark:bg-[#E85C40] px-6 py-3 text-xs font-bold text-white shadow-md transition hover:opacity-90"
            >
              Start Keigo Conversion Quiz
            </button>
          </div>
        </div>
      )}

      {/* ─── QUIZ MODE ────────────────────────────────────────────────────── */}
      {appMode === "quiz" && (
        <div className="space-y-6">
          {/* Target Type Filter */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1.5 rounded-xl border border-black/10 bg-white p-1 shadow-xs dark:border-white/10 dark:bg-[#161B22]">
              {[
                { key: "all", label: "All Forms" },
                { key: "sonkeigo", label: "尊敬語 (Honorific)" },
                { key: "kenjougo", label: "謙譲語 (Humble)" },
                { key: "polite", label: "丁寧語 (Polite)" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() =>
                    setSelectedTargetType(item.key as "all" | KeigoTargetType)
                  }
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    selectedTargetType === item.key
                      ? "bg-[#C84B31] dark:bg-[#E85C40] text-white shadow-xs"
                      : "text-[#6B6B6B] hover:text-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Streak & Counter */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                <Flame size={16} className={streak > 0 ? "animate-bounce" : ""} />
                <span>{streak} Streak</span>
              </div>
              <span className="text-xs font-semibold text-[#6B6B6B] dark:text-[#A0A0A0]">
                {currentIndex + 1} / {questions.length}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
            <div
              className="h-full bg-[#C84B31] dark:bg-[#E85C40] transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* ── Finished Screen ── */}
          {isFinished ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-black/10 bg-white p-8 text-center shadow-xs dark:border-white/10 dark:bg-[#161B22]">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 shadow-sm">
                  <Trophy size={40} />
                </div>

                <h2 className="mt-5 text-2xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                  Keigo Conversion Complete!
                </h2>
                <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
                  Japanese Business Honorifics & Politeness Mastery
                </p>

                <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-[#FAFAF8] p-4 dark:bg-[#1E232B]">
                  <div>
                    <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Score</div>
                    <div className="mt-1 text-2xl font-bold text-[#C84B31] dark:text-[#E85C40]">
                      {score} / {questions.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Accuracy</div>
                    <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {Math.round((score / questions.length) * 100)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Max Streak</div>
                    <div className="mt-1 text-2xl font-bold text-amber-500">{maxStreak}</div>
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/practice"
                    className="flex-1 min-w-0 sm:min-w-[140px] rounded-2xl border border-black/10 bg-[#FAFAF8] py-3 text-center text-xs font-bold text-[#1A1A1A] transition hover:bg-black/5 dark:border-white/10 dark:bg-[#1E232B] dark:text-[#FAFAFA]"
                  >
                    Practice Hub
                  </Link>

                  <button
                    type="button"
                    onClick={() => setAppMode("flashcards")}
                    className="flex-1 min-w-0 sm:min-w-[140px] rounded-2xl border border-purple-500/30 bg-purple-500/10 py-3 text-xs font-bold text-purple-700 dark:text-purple-300 transition hover:bg-purple-500/20"
                  >
                    Review Keigo Matrix
                  </button>

                  <button
                    type="button"
                    onClick={() => generateQuestions(selectedTargetType)}
                    className="flex-1 min-w-0 sm:min-w-[140px] rounded-2xl bg-[#C84B31] dark:bg-[#E85C40] py-3 text-xs font-bold text-white shadow-md transition hover:opacity-90"
                  >
                    Practice Again
                  </button>
                </div>
              </div>

              {/* Review List */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-[#FAFAFA] flex items-center gap-2">
                  <BookOpen size={16} className="text-[#C84B31] dark:text-[#E85C40]" />
                  <span>Keigo Conversion Review ({sessionResults.length})</span>
                </h3>

                <div className="space-y-3">
                  {sessionResults.map((result, idx) => (
                    <div
                      key={result.question.id + idx}
                      className="rounded-2xl border border-black/10 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-[#161B22] space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {result.isCorrect ? (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                              <Check size={14} />
                            </span>
                          ) : (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/15 text-red-600 dark:text-red-400">
                              <XCircle size={14} />
                            </span>
                          )}
                          <span className="text-xs font-bold uppercase text-[#6B6B6B] dark:text-[#A0A0A0]">
                            {result.question.targetType} · Verb {idx + 1}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => playJapaneseAudio(result.question.correctAnswer)}
                          className="flex items-center gap-1 rounded-lg border border-black/5 bg-[#FAFAF8] px-2 py-1 text-[11px] font-semibold text-[#6B6B6B] hover:text-[#1A1A1A] dark:border-white/5 dark:bg-[#1E232B] dark:text-[#A0A0A0] dark:hover:text-white"
                        >
                          <Volume2 size={12} /> Audio
                        </button>
                      </div>

                      <div className="font-serif text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                        {result.question.promptText} ➔{" "}
                        <span className="text-[#C84B31] dark:text-[#E85C40]">
                          {result.question.correctAnswer}
                        </span>
                      </div>

                      <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
                        Meaning: &quot;{result.question.exercise.meaning}&quot;
                      </div>

                      <div className="rounded-xl bg-[#FAFAF8] p-3 text-xs leading-relaxed text-[#1A1A1A] dark:bg-[#1E232B] dark:text-[#FAFAFA]">
                        {result.question.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ── Active Question Card ── */
            currentQ && (
              <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8 shadow-xs dark:border-white/10 dark:bg-[#161B22] space-y-6">
                {/* Target Form Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      currentQ.targetType === "sonkeigo"
                        ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300"
                        : currentQ.targetType === "kenjougo"
                        ? "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300"
                        : "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300"
                    }`}
                  >
                    Target Form:{" "}
                    {currentQ.targetType === "sonkeigo"
                      ? "尊敬語 (Honorific / Respect for Others)"
                      : currentQ.targetType === "kenjougo"
                      ? "謙譲語 (Humble / Lowering Self)"
                      : "丁寧語 (Polite / Desu-Masu)"}
                  </span>

                  <button
                    type="button"
                    onClick={() => playJapaneseAudio(currentQ.promptText)}
                    className="flex items-center gap-1 rounded-lg border border-black/5 bg-[#FAFAF8] px-2.5 py-1 text-xs font-semibold text-[#6B6B6B] hover:text-[#1A1A1A] dark:border-white/5 dark:bg-[#1E232B] dark:text-[#A0A0A0] dark:hover:text-white"
                  >
                    <Volume2 size={13} /> Casual
                  </button>
                </div>

                {/* Casual Prompt */}
                <div className="text-center py-4 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
                    Convert this plain verb:
                  </div>

                  <div className="font-serif text-4xl sm:text-5xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                    {currentQ.promptText}
                  </div>

                  <div className="text-sm font-semibold text-[#C84B31] dark:text-[#E85C40]">
                    &quot;{currentQ.exercise.meaning}&quot;
                  </div>
                </div>

                {/* 4 Keigo Options */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2">
                  {currentQ.options.map((option, idx) => {
                    const isChosen = selectedOption === option;
                    const isCorrect = option === currentQ.correctAnswer;

                    let btnStyle =
                      "border-black/10 bg-[#FAFAF8] text-[#1A1A1A] hover:border-[#C84B31] dark:border-[#E85C40] hover:bg-black/5 dark:border-white/10 dark:bg-[#1E232B] dark:text-[#FAFAFA] dark:hover:bg-white/5";

                    if (status !== "idle") {
                      if (isCorrect) {
                        btnStyle =
                          "border-emerald-500 bg-emerald-500 text-white font-bold scale-[1.02] shadow-md";
                      } else if (isChosen && !isCorrect) {
                        btnStyle = "border-red-500 bg-red-500 text-white font-bold";
                      } else {
                        btnStyle = "opacity-40 border-black/5 dark:border-white/5";
                      }
                    }

                    return (
                      <button
                        key={option + idx}
                        type="button"
                        disabled={status !== "idle"}
                        onClick={() => handleSelectOption(option)}
                        className={`relative flex items-center justify-between rounded-2xl border p-4 text-left font-serif text-lg font-bold transition-all shadow-xs ${btnStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-black/5 text-xs font-mono font-bold dark:bg-white/10">
                            {idx + 1}
                          </span>
                          <span>{option}</span>
                        </div>
                        {status !== "idle" && isCorrect && (
                          <CheckCircle2 size={18} className="text-white" />
                        )}
                        {status !== "idle" && isChosen && !isCorrect && (
                          <XCircle size={18} className="text-white" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback Result Alert */}
                {status !== "idle" && (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div
                      className={`flex items-center justify-between rounded-2xl p-4 ${
                        status === "correct"
                          ? "bg-emerald-500/15 text-emerald-900 dark:text-emerald-300"
                          : "bg-red-500/15 text-red-900 dark:text-red-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {status === "correct" ? (
                          <CheckCircle2 size={24} className="text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <XCircle size={24} className="text-red-600 dark:text-red-400" />
                        )}
                        <div>
                          <div className="text-sm font-bold">
                            {status === "correct" ? "Correct Keigo Conversion!" : "Incorrect"}
                          </div>
                          <div className="text-xs opacity-80">
                            {currentQ.promptText} ➔ <strong>{currentQ.correctAnswer}</strong>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleNext}
                        autoFocus
                        className="flex items-center gap-1.5 rounded-xl bg-black px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:opacity-90 dark:bg-white dark:text-black"
                      >
                        <span>Continue</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>

                    {/* Keigo Explanation Note */}
                    <div className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 text-left text-xs leading-relaxed text-[#1A1A1A] dark:border-white/5 dark:bg-[#1E232B] dark:text-[#FAFAFA] space-y-1.5 whitespace-pre-line">
                      <div className="flex items-center gap-1.5 font-bold text-[#C84B31] dark:text-[#E85C40]">
                        <Sparkles size={14} />
                        <span>Keigo Politeness Perspective:</span>
                      </div>
                      <p>{currentQ.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          )}

          {/* Footer keyboard helpers */}
          {appMode === "quiz" && !isFinished && (
            <div className="text-center text-[11px] text-[#6B6B6B] dark:text-[#A0A0A0]">
              Press keys <kbd className="rounded bg-black/10 px-1 py-0.5 font-mono dark:bg-white/10">1</kbd>-<kbd className="rounded bg-black/10 px-1 py-0.5 font-mono dark:bg-white/10">4</kbd> to choose keigo form · <kbd className="rounded bg-black/10 px-1 py-0.5 font-mono dark:bg-white/10">Enter</kbd> to continue
            </div>
          )}
        </div>
      )}
    </div>
  );
}
