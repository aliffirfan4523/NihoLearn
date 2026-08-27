"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, ArrowRight, CheckSquare, Square, Sparkles, Sliders } from "lucide-react";
import {
  verbsDatabase,
  conjugationFormsList,
  type VerbType,
  type ConjugationFormKey,
} from "@/lib/data/conjugation";
import { HowToPlay } from "@/components/practice/HowToPlay";

export interface ConjugationDrillConfig {
  questionCount: number;
  level: "N5" | "N4" | "all";
  verbType: "all" | VerbType;
  selectedForms: ConjugationFormKey[];
  showFurigana: boolean;
  enableAudio: boolean;
}

export function ConjugationDrillSetup({
  onStart,
}: {
  onStart: (config: ConjugationDrillConfig) => void;
}) {
  const [questionCount, setQuestionCount] = useState(10);
  const [level, setLevel] = useState<"N5" | "N4" | "all">("N5");
  const [verbType, setVerbType] = useState<"all" | VerbType>("all");
  const [selectedForms, setSelectedForms] = useState<ConjugationFormKey[]>([
    "polite",
    "plain_negative",
    "plain_past",
    "te_form",
  ]);
  const [showFurigana, setShowFurigana] = useState(true);
  const [enableAudio, setEnableAudio] = useState(true);

  const toggleForm = (key: ConjugationFormKey) => {
    if (selectedForms.includes(key)) {
      if (selectedForms.length > 1) {
        setSelectedForms(selectedForms.filter((f) => f !== key));
      }
    } else {
      setSelectedForms([...selectedForms, key]);
    }
  };

  const filteredVerbs = verbsDatabase.filter((v) => {
    if (level !== "all" && v.level !== level) return false;
    if (verbType !== "all" && v.type !== verbType) return false;
    return true;
  });

  const possibleQuestions = filteredVerbs.length * selectedForms.length;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#FAFAFA]">
          Japanese Conjugation Drill
        </h1>
        <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
          Configure your verb drill parameters, select target conjugation forms, and train instant recall.
        </p>
      </div>

      <HowToPlay
        gameKey="conjugation-drill"
        steps={[
          "Configure the drill below: question count, JLPT level, verb group, and which conjugation forms to train — at least one form must stay selected.",
          "Each question shows a verb and a target form badge; pick its correct conjugation from four options.",
          "Distractors are other conjugations of the same verb, so read the target form carefully.",
          "Every answer reveals the correct form and the rule behind it; click Continue to advance.",
          "Correct answers build your streak; your score, accuracy, and max streak are recorded to your progress at the end.",
        ]}
        note="Tip: furigana shows each verb reading during the drill, and audio pronounces the correct answer after you respond — turn both off for a harder challenge."
      />

      {/* Learn Conjugation Banner */}
      <Link
        href="/progress/conjugation"
        className="flex items-center justify-between rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 p-5 shadow-xs transition dark:border-blue-500/30"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
            <BookOpen size={24} />
          </div>
          <div>
            <h3 className="font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
              View Conjugation Progress & Rules
            </h3>
            <p className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
              Follow the path: overview, verb groups, polite, negative, past, and te-form rules.
            </p>
          </div>
        </div>
        <ArrowRight size={20} className="text-blue-600 dark:text-blue-400" />
      </Link>

      {/* Configuration Card */}
      <div className="rounded-2xl border border-black/10 bg-white p-7 shadow-xs dark:border-white/15 dark:bg-[#1A1A1A] space-y-7">
        <div className="flex items-center gap-2 border-b border-black/10 pb-4 dark:border-white/10">
          <Sliders size={20} className="text-[#C84B31] dark:text-[#E85C40]" />
          <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Drill Settings</h2>
        </div>

        {/* Dropdowns Row */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
              Number of Questions
            </label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-black/10 bg-[#FAFAF8] px-3.5 py-2.5 text-sm font-semibold text-[#1A1A1A] focus:outline-none dark:border-white/15 dark:bg-[#1E232B] dark:text-[#FAFAFA]"
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={20}>20 Questions</option>
              <option value={30}>30 Questions</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
              JLPT Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as any)}
              className="mt-2 w-full rounded-xl border border-black/10 bg-[#FAFAF8] px-3.5 py-2.5 text-sm font-semibold text-[#1A1A1A] focus:outline-none dark:border-white/15 dark:bg-[#1E232B] dark:text-[#FAFAFA]"
            >
              <option value="N5">N5 (Beginner)</option>
              <option value="N4">N4 (Elementary)</option>
              <option value="all">All Levels</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
              Verb Types
            </label>
            <select
              value={verbType}
              onChange={(e) => setVerbType(e.target.value as any)}
              className="mt-2 w-full rounded-xl border border-black/10 bg-[#FAFAF8] px-3.5 py-2.5 text-sm font-semibold text-[#1A1A1A] focus:outline-none dark:border-white/15 dark:bg-[#1E232B] dark:text-[#FAFAFA]"
            >
              <option value="all">All Types</option>
              <option value="godan">Godan (Group 1)</option>
              <option value="ichidan">Ichidan (Group 2)</option>
              <option value="irregular">Irregular (Group 3)</option>
            </select>
          </div>
        </div>

        {/* Conjugation Forms Selection */}
        <div className="space-y-4 border-t border-black/10 pt-6 dark:border-white/10">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Conjugation Forms
          </h3>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {/* Basic Forms */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Basic</span>
              {(["plain", "polite", "plain_negative", "plain_past"] as ConjugationFormKey[]).map(
                (k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => toggleForm(k)}
                    className="flex w-full items-center gap-2 text-left text-xs font-medium text-[#1A1A1A] hover:text-[#C84B31] dark:text-[#FAFAFA] dark:hover:text-[#E85C40]"
                  >
                    {selectedForms.includes(k) ? (
                      <CheckSquare size={16} className="text-[#C84B31] dark:text-[#E85C40]" />
                    ) : (
                      <Square size={16} className="text-gray-400" />
                    )}
                    <span className="capitalize">{k.replace("_", " ")}</span>
                  </button>
                )
              )}
            </div>

            {/* Polite & Complex */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Polite / Past</span>
              {(["polite_past", "polite_negative", "te_form", "progressive"] as ConjugationFormKey[]).map(
                (k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => toggleForm(k)}
                    className="flex w-full items-center gap-2 text-left text-xs font-medium text-[#1A1A1A] hover:text-[#C84B31] dark:text-[#FAFAFA] dark:hover:text-[#E85C40]"
                  >
                    {selectedForms.includes(k) ? (
                      <CheckSquare size={16} className="text-[#C84B31] dark:text-[#E85C40]" />
                    ) : (
                      <Square size={16} className="text-gray-400" />
                    )}
                    <span className="capitalize">{k.replace("_", " ")}</span>
                  </button>
                )
              )}
            </div>

            {/* Advanced */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Advanced</span>
              {(["potential", "passive", "causative"] as ConjugationFormKey[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => toggleForm(k)}
                  className="flex w-full items-center gap-2 text-left text-xs font-medium text-[#1A1A1A] hover:text-[#C84B31] dark:text-[#FAFAFA] dark:hover:text-[#E85C40]"
                >
                  {selectedForms.includes(k) ? (
                    <CheckSquare size={16} className="text-[#C84B31] dark:text-[#E85C40]" />
                  ) : (
                    <Square size={16} className="text-gray-400" />
                  )}
                  <span className="capitalize">{k.replace("_", " ")}</span>
                </button>
              ))}
            </div>

            {/* Special */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Special</span>
              {(["volitional", "imperative"] as ConjugationFormKey[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => toggleForm(k)}
                  className="flex w-full items-center gap-2 text-left text-xs font-medium text-[#1A1A1A] hover:text-[#C84B31] dark:text-[#FAFAFA] dark:hover:text-[#E85C40]"
                >
                  {selectedForms.includes(k) ? (
                    <CheckSquare size={16} className="text-[#C84B31] dark:text-[#E85C40]" />
                  ) : (
                    <Square size={16} className="text-gray-400" />
                  )}
                  <span className="capitalize">{k.replace("_", " ")}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Checkbox Options */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-black/10 pt-5 dark:border-white/10">
          <label className="flex items-center gap-2 text-xs font-medium text-[#1A1A1A] cursor-pointer dark:text-[#FAFAFA]">
            <input
              type="checkbox"
              checked={showFurigana}
              onChange={(e) => setShowFurigana(e.target.checked)}
              className="rounded text-[#C84B31]"
            />
            <span>Show furigana on questions</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-medium text-[#1A1A1A] cursor-pointer dark:text-[#FAFAFA]">
            <input
              type="checkbox"
              checked={enableAudio}
              onChange={(e) => setEnableAudio(e.target.checked)}
              className="rounded text-[#C84B31]"
            />
            <span>Enable audio pronunciation feedback</span>
          </label>

          <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
            Available pool: <strong className="text-[#1A1A1A] dark:text-[#FAFAFA]">{possibleQuestions}</strong> questions
          </div>
        </div>

        {/* Start Button */}
        <div>
          <button
            type="button"
            onClick={() =>
              onStart({
                questionCount,
                level,
                verbType,
                selectedForms,
                showFurigana,
                enableAudio,
              })
            }
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#C84B31] py-4 text-base font-bold text-white shadow-md transition hover:bg-[#b03e26] dark:bg-[#E85C40]"
          >
            <span>Start Practice Drill</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
