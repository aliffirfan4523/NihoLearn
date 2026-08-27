"use client";

import { useState, useEffect } from "react";
import { Volume2, CheckCircle2, XCircle, ArrowRight, Trophy, Flame, RotateCcw } from "lucide-react";
import {
  verbsDatabase,
  conjugationFormsList,
  type VerbEntry,
  type ConjugationFormKey,
} from "@/lib/data/conjugation";
import type { ConjugationDrillConfig } from "@/components/practice/ConjugationDrillSetup";

import { playJapaneseAudio } from "@/lib/audio";

function playAudio(text: string) {
  playJapaneseAudio(text);
}

interface ConjugationQuestion {
  verb: VerbEntry;
  targetForm: ConjugationFormKey;
  options: string[];
  correctAnswer: string;
  rule: string;
}

export function ConjugationDrillGame({
  config,
  onExit,
}: {
  config: ConjugationDrillConfig;
  onExit: () => void;
}) {
  const [questions, setQuestions] = useState<ConjugationQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const filteredVerbs = verbsDatabase.filter((v) => {
      if (config.level !== "all" && v.level !== config.level) return false;
      if (config.verbType !== "all" && v.type !== config.verbType) return false;
      return true;
    });

    const qList: ConjugationQuestion[] = [];
    const count = Math.min(config.questionCount, filteredVerbs.length * config.selectedForms.length);

    for (let i = 0; i < count; i++) {
      const verb = filteredVerbs[Math.floor(Math.random() * filteredVerbs.length)];
      const targetForm = config.selectedForms[Math.floor(Math.random() * config.selectedForms.length)];
      const targetFormObj = verb.forms[targetForm];

      const correctAnswer = targetFormObj.japanese;
      const rule = targetFormObj.rule;

      // Distractors from other forms of the same verb or similar verbs
      const otherForms = Object.values(verb.forms)
        .map((f) => f.japanese)
        .filter((ans) => ans !== correctAnswer);

      const distractors = otherForms.sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);

      qList.push({ verb, targetForm, options, correctAnswer, rule });
    }

    setQuestions(qList);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setIsFinished(false);
  }, []);

  const currentQ = questions[currentIndex];

  // Auto-log session & update GrammarProgress when finished
  useEffect(() => {
    if (isFinished && questions.length > 0) {
      const accuracy = Math.round((score / questions.length) * 100);

      // 1. Batch update grammar progress for the practiced conjugation forms
      const grammarBatch = config.selectedForms.map((formKey) => ({
        grammarId: `${config.level.toLowerCase()}_conjugation_${formKey}`,
        level: config.level,
        status: accuracy >= 70 ? ("mastered" as const) : ("reviewing" as const),
        notes: `Conjugation drill: ${accuracy}% accuracy`,
      }));

      if (grammarBatch.length > 0) {
        fetch("/api/grammar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ batch: grammarBatch }),
        }).catch(() => {});
      }

      // 2. Log study session
      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationMinutes: Math.max(1, Math.round((questions.length * 8) / 60)),
          level: config.level,
          activities: ["conjugation", "grammar"],
          wordsReviewed: questions.length,
          notes: JSON.stringify({ score, total: questions.length, accuracy, forms: config.selectedForms }),
        }),
      }).catch(() => {});
    }
  }, [isFinished, questions.length, score, config.level, config.selectedForms]);

  if (questions.length === 0) {
    return <div className="p-8 text-center text-gray-500">Preparing conjugation drill...</div>;
  }

  const handleSelect = (answer: string) => {
    if (status !== "idle") return;
    setSelectedAnswer(answer);

    const isCorrect = answer === currentQ.correctAnswer;
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

    if (config.enableAudio) {
      playAudio(currentQ.correctAnswer);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setStatus("idle");
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    const accuracy = Math.round((score / questions.length) * 100);
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-black/10 bg-white p-8 text-center shadow-xs dark:border-white/15 dark:bg-[#1A1A1A]">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 shadow-sm">
          <Trophy size={40} />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Drill Complete!</h2>
        <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">Conjugation session summary:</p>

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
              setSelectedAnswer(null);
            }}
            className="flex-1 rounded-2xl bg-[#C84B31] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#b03e26] dark:bg-[#E85C40]"
          >
            Drill Again
          </button>
        </div>
      </div>
    );
  }

  const formMeta = conjugationFormsList.find((f) => f.key === currentQ.targetForm);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Top Progress & Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onExit}
          className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          ✕ Exit Drill
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
      <div className="rounded-2xl border border-black/10 bg-white p-8 text-center shadow-xs dark:border-white/15 dark:bg-[#1A1A1A]">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
          Target: {formMeta?.label ?? currentQ.targetForm}
        </div>

        {/* Prompt Verb */}
        <div className="my-6">
          <div className="font-serif text-6xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
            {currentQ.verb.kanji}
          </div>
          {config.showFurigana && (
            <div className="mt-1 text-sm font-medium text-gray-400">
              {currentQ.verb.reading} ({currentQ.verb.romaji})
            </div>
          )}
          <div className="mt-2 text-sm font-semibold text-[#C84B31] dark:text-[#E85C40]">
            &quot;{currentQ.verb.meaning}&quot; · <span className="uppercase text-xs">{currentQ.verb.type}</span>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {currentQ.options.map((option) => {
            const isCorrect = option === currentQ.correctAnswer;
            const isChosen = selectedAnswer === option;

            let btnStyle =
              "border-black/10 bg-[#FAFAF8] text-[#1A1A1A] hover:border-[#C84B31] dark:border-white/15 dark:bg-[#1E232B] dark:text-[#FAFAFA]";

            if (status !== "idle") {
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
                disabled={status !== "idle"}
                onClick={() => handleSelect(option)}
                className={`rounded-2xl border p-4 text-center font-serif text-xl font-bold shadow-xs transition ${btnStyle}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {/* Feedback Alert & Explanation */}
        {status !== "idle" && (
          <div className="mt-6 space-y-3 animate-in fade-in zoom-in-95 duration-200">
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
                    {currentQ.verb.kanji} ➔ <strong>{currentQ.correctAnswer}</strong>
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

            {/* Rule Explanation */}
            <div className="rounded-xl border border-black/5 bg-[#FAFAF8] p-3 text-left text-xs text-[#6B6B6B] dark:border-white/10 dark:bg-[#1E232B] dark:text-[#A0A0A0]">
              <strong className="text-[#1A1A1A] dark:text-[#FAFAFA]">Rule:</strong> {currentQ.rule}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
