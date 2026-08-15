"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Lock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Trophy,
  Sparkles,
  BookOpen,
  Headphones,
  FileText,
  GraduationCap,
  Flame,
  Swords,
  ShieldAlert,
  Zap,
  Star,
  Award,
  Compass,
  MessageCircle,
  Lightbulb,
  Clock,
  Layers,
} from "lucide-react";
import {
  roadmapStages,
  substepTypeConfig,
  type RoadmapStage,
  type RoadmapSubstep,
} from "@/lib/data/roadmap";

export interface RoadmapProgress {
  completions: Record<string, number>;
  passedExams: string[];
  unlockedIds: string[];
  currentStageId: string;
}

interface RoadmapViewProps {
  progress: {
    completions: Record<string, number>;
    passedExams: string[];
    unlockedIds: string[];
    currentStageId: string;
  };
}

function SubstepIcon({ type }: { type: string }) {
  switch (type) {
    case "kana":
      return <span className="font-serif text-sm font-bold">あ</span>;
    case "vocabulary":
      return <BookOpen size={16} />;
    case "kanji":
      return <span className="font-serif text-sm font-bold">漢</span>;
    case "grammar":
      return <FileText size={16} />;
    case "reading":
      return <BookOpen size={16} />;
    case "listening":
      return <Headphones size={16} />;
    case "exam":
      return <Swords size={16} />;
    default:
      return <Sparkles size={16} />;
  }
}

/* ────────────────────────────────────────────────────────────────────────── */
/* SUBSTEP ROW COMPONENT                                                      */
/* ────────────────────────────────────────────────────────────────────────── */

function SubstepCard({
  sub,
  isUnlocked,
  completion,
  isPassed,
}: {
  sub: RoadmapSubstep;
  isUnlocked: boolean;
  completion: number;
  isPassed: boolean;
}) {
  const pct = Math.round(completion * 100);
  const isExam = sub.type === "exam";
  const isComplete = isExam ? isPassed : pct >= 100;
  const config = substepTypeConfig[sub.type] || substepTypeConfig.vocabulary;

  // Boss Exam special card rendering
  if (isExam) {
    return (
      <div
        className={`relative overflow-hidden rounded-3xl border transition-all duration-300 ${
          !isUnlocked
            ? "border-black/5 bg-black/[0.02] opacity-50 dark:border-white/5 dark:bg-white/[0.02]"
            : isPassed
              ? "border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 dark:border-emerald-500/30"
              : "border-[#C84B31]/30 bg-gradient-to-r from-[#C84B31]/10 via-orange-500/5 to-rose-500/10 shadow-md hover:border-[#C84B31] dark:border-[#E85C40]/40"
        }`}
      >
        <div className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl font-bold shadow-sm ${
                  !isUnlocked
                    ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
                    : isPassed
                      ? "bg-emerald-500 text-white"
                      : "bg-[#C84B31] text-white dark:bg-[#E85C40]"
                }`}
              >
                {!isUnlocked ? (
                  <Lock size={20} />
                ) : isPassed ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <Swords size={22} className="animate-pulse" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      isPassed
                        ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                        : "bg-[#C84B31]/20 text-[#C84B31] dark:text-[#E85C40]"
                    }`}
                  >
                    ⚔️ Boss Trial Exam
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    <Zap size={12} /> +{sub.xpReward} XP
                  </span>
                </div>
                <h4 className="mt-1 text-base font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                  {sub.title}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isUnlocked && !isPassed && (
                <Link
                  href={sub.href}
                  className="flex items-center gap-2 rounded-2xl bg-[#C84B31] px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#b03e26] hover:scale-105 dark:bg-[#E85C40]"
                >
                  <Swords size={14} />
                  <span>Challenge Exam</span>
                  <ArrowRight size={14} />
                </Link>
              )}

              {isUnlocked && isPassed && (
                <Link
                  href={sub.href}
                  className="flex items-center gap-1.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-600 transition hover:bg-emerald-500/20 dark:text-emerald-400"
                >
                  <Trophy size={14} />
                  <span>Retake Trial</span>
                </Link>
              )}

              {!isUnlocked && (
                <span className="flex items-center gap-1 text-xs font-semibold text-gray-400">
                  <Lock size={14} /> Complete previous steps
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard Substep Card
  return (
    <div
      className={`group flex items-center gap-4 rounded-2xl border p-4 transition-all duration-200 ${
        !isUnlocked
          ? "border-black/5 bg-black/[0.02] opacity-50 dark:border-white/5 dark:bg-white/[0.02]"
          : isComplete
            ? "border-emerald-500/30 bg-emerald-500/[0.04] dark:border-emerald-500/20 dark:bg-emerald-500/[0.06]"
            : "border-black/10 bg-white hover:border-[#C84B31]/40 hover:-translate-y-0.5 hover:shadow-xs dark:border-white/10 dark:bg-[#1A1A1A] dark:hover:border-[#E85C40]/40"
      }`}
    >
      {/* Icon Node */}
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition ${
          !isUnlocked
            ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
            : isComplete
              ? "bg-emerald-500 text-white shadow-xs"
              : config.bgClass
        }`}
      >
        {!isUnlocked ? (
          <Lock size={16} />
        ) : isComplete ? (
          <CheckCircle2 size={18} />
        ) : (
          <SubstepIcon type={sub.type} />
        )}
      </div>

      {/* Title & Progress Bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isComplete
                  ? "text-emerald-600 dark:text-emerald-400"
                  : config.textClass
              }`}
            >
              {config.label}
            </span>
            <span className="text-gray-300 dark:text-gray-700">·</span>
            <h4
              className={`text-sm font-bold truncate ${
                !isUnlocked
                  ? "text-gray-400 dark:text-gray-600"
                  : "text-[#1A1A1A] dark:text-[#FAFAFA]"
              }`}
            >
              {sub.title}
            </h4>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
              +{sub.xpReward} XP
            </span>
            <span
              className={`text-xs font-bold ${
                isComplete
                  ? "text-emerald-600 dark:text-emerald-400"
                  : !isUnlocked
                    ? "text-gray-400"
                    : "text-[#1A1A1A] dark:text-[#FAFAFA]"
              }`}
            >
              {isComplete ? "100%" : `${pct}%`}
            </span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="mt-2 flex items-center gap-2.5">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isComplete
                  ? "bg-emerald-500"
                  : "bg-[#C84B31] dark:bg-[#E85C40]"
              }`}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
          <span className="text-[11px] font-medium text-[#6B6B6B] dark:text-[#A0A0A0] shrink-0">
            {sub.targetLabel}
          </span>
        </div>
      </div>

      {/* Action CTA */}
      {isUnlocked && !isComplete && (
        <Link
          href={sub.href}
          className="shrink-0 flex items-center gap-1 rounded-xl bg-[#1A1A1A] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#C84B31] dark:bg-[#FAFAFA] dark:text-[#1A1A1A] dark:hover:bg-[#E85C40] dark:hover:text-white"
        >
          <span>Study</span>
          <ArrowRight size={12} />
        </Link>
      )}

      {isUnlocked && isComplete && (
        <Link
          href={sub.href}
          className="shrink-0 flex items-center gap-1 rounded-xl border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-600 transition hover:bg-emerald-500/10 dark:text-emerald-400"
        >
          <span>Review</span>
          <ArrowRight size={12} />
        </Link>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* STAGE ADVENTURE CARD                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

function StageAdventureCard({
  stage,
  completions,
  passedExams,
  unlockedIds,
  isCurrentStage,
  stageIndex,
  totalStages,
}: {
  stage: RoadmapStage;
  completions: Record<string, number>;
  passedExams: Set<string>;
  unlockedIds: Set<string>;
  isCurrentStage: boolean;
  stageIndex: number;
  totalStages: number;
}) {
  const [expanded, setExpanded] = useState(isCurrentStage || stageIndex <= 1);
  const [briefingOpen, setBriefingOpen] = useState(isCurrentStage);

  const stageUnlocked =
    !stage.unlockAfterExam || passedExams.has(stage.unlockAfterExam);

  const stageSubstepCompletions = stage.substeps.map((sub) => {
    if (sub.type === "exam") return passedExams.has(sub.id) ? 1 : 0;
    return completions[sub.id] ?? 0;
  });

  const stageCompletion =
    stage.substeps.length > 0
      ? stageSubstepCompletions.reduce((a, b) => a + b, 0) /
        stage.substeps.length
      : 0;

  const stagePct = Math.round(stageCompletion * 100);
  const stageComplete = stagePct >= 100;
  const isMastery = stage.id === "mastery";

  return (
    <div className="relative flex gap-4 md:gap-6">
      {/* Timeline Waypoint Node & Line */}
      <div className="flex flex-col items-center">
        {/* Crest Waypoint Node */}
        <div
          className={`relative z-10 flex h-14 w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-3xl text-2xl shadow-md transition-all duration-300 ${
            !stageUnlocked
              ? "bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
              : stageComplete
                ? "bg-emerald-500 text-white ring-4 ring-emerald-500/20 shadow-emerald-500/20"
                : isCurrentStage
                  ? `${stage.bgColor} text-white ring-4 ring-current/25 shadow-lg animate-pulse`
                  : `${stage.bgColor} text-white`
          }`}
        >
          {!stageUnlocked ? (
            <Lock size={22} />
          ) : stageComplete ? (
            <CheckCircle2 size={28} />
          ) : (
            <span>{stage.crest}</span>
          )}

          {/* Active Mission Floating Pill */}
          {isCurrentStage && stageUnlocked && !stageComplete && (
            <span className="absolute -bottom-2.5 rounded-full bg-[#C84B31] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-xs dark:bg-[#E85C40]">
              Active
            </span>
          )}
        </div>

        {/* Connecting Vertical Line */}
        {stageIndex < totalStages - 1 && (
          <div
            className={`w-1 flex-1 my-2 rounded-full transition-colors ${
              stageComplete
                ? "bg-emerald-500/50"
                : stageUnlocked
                  ? "bg-gradient-to-b from-[#C84B31]/30 to-black/10 dark:from-[#E85C40]/30 dark:to-white/10"
                  : "bg-black/5 dark:bg-white/5"
            }`}
          />
        )}
      </div>

      {/* Main Stage Card */}
      <div className="flex-1 pb-10 min-w-0">
        <div
          className={`relative overflow-hidden rounded-3xl border transition-all duration-300 ${
            !stageUnlocked
              ? "border-black/5 bg-[#FAFAF8] opacity-65 dark:border-white/5 dark:bg-[#0E0E0E]"
              : isCurrentStage
                ? "border-[#C84B31]/40 bg-white shadow-xl ring-1 ring-[#C84B31]/20 dark:border-[#E85C40]/40 dark:bg-[#1A1A1A]"
                : "border-black/10 bg-white shadow-xs hover:border-black/20 dark:border-white/15 dark:bg-[#1A1A1A]"
          }`}
        >
          {/* Subtle Background Watermark */}
          <div className="pointer-events-none absolute right-4 top-2 select-none font-serif text-8xl font-bold opacity-[0.03] dark:opacity-[0.05]">
            {stage.icon}
          </div>

          {/* Stage Header Banner */}
          <div className="p-6 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-lg px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white ${
                      stageComplete ? "bg-emerald-500" : stage.bgColor
                    }`}
                  >
                    Stage {stage.step}
                  </span>

                  <span className="rounded-md bg-black/5 px-2 py-0.5 text-xs font-bold text-[#6B6B6B] dark:bg-white/10 dark:text-[#A0A0A0]">
                    {stage.danjTitle}
                  </span>

                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={12} /> {stage.sensei.studyHours}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 flex-wrap">
                  <h2
                    className={`text-2xl font-bold tracking-tight ${
                      !stageUnlocked
                        ? "text-gray-400 dark:text-gray-600"
                        : "text-[#1A1A1A] dark:text-[#FAFAFA]"
                    }`}
                  >
                    {stage.title}
                  </h2>
                  <span className="font-serif text-sm font-semibold text-[#6B6B6B] dark:text-[#A0A0A0]">
                    {stage.subtitle}
                  </span>
                </div>

                <p className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0] leading-relaxed">
                  📍 <strong className="text-[#1A1A1A] dark:text-[#FAFAFA]">{stage.locationName}</strong> — {stage.description}
                </p>
              </div>

              {/* Toggle Substeps Button */}
              {stageUnlocked && stage.substeps.length > 0 && (
                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1.5 rounded-xl border border-black/10 bg-[#FAFAF8] px-3.5 py-2 text-xs font-bold text-[#1A1A1A] hover:bg-black/5 dark:border-white/15 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]"
                >
                  <span>{expanded ? "Hide Steps" : "Show Steps"}</span>
                  {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              )}
            </div>

            {/* Stage Progress Bar & Stats Row */}
            {stageUnlocked && stage.substeps.length > 0 && (
              <div className="mt-5 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#6B6B6B] dark:text-[#A0A0A0]">
                    Stage Completion
                  </span>
                  <span
                    className={
                      stageComplete
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-[#C84B31] dark:text-[#E85C40]"
                    }
                  >
                    {stagePct}% {stageComplete && "· Cleared ✓"}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      stageComplete
                        ? "bg-emerald-500 shadow-sm"
                        : "bg-gradient-to-r from-[#C84B31] to-orange-500 dark:from-[#E85C40] dark:to-orange-400"
                    }`}
                    style={{ width: `${stagePct}%` }}
                  />
                </div>
              </div>
            )}

            {/* Sensei's Strategy Briefing Note */}
            {stageUnlocked && (
              <div className="mt-5 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent p-4 dark:border-amber-500/25">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setBriefingOpen(!briefingOpen)}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                    <Lightbulb size={16} className="text-amber-500" />
                    <span>Sensei's Lecture Advice · 講師の助言</span>
                  </div>
                  <button type="button" className="text-xs text-amber-700 dark:text-amber-400 hover:underline font-semibold">
                    {briefingOpen ? "Minimize" : "Read Tip"}
                  </button>
                </div>

                {briefingOpen && (
                  <div className="mt-3 pt-3 border-t border-amber-500/20 space-y-2 text-xs text-[#1A1A1A] dark:text-[#FAFAFA] animate-in fade-in duration-200">
                    <div className="font-serif italic text-amber-900 dark:text-amber-200">
                      "{stage.sensei.quote}"
                    </div>
                    <p className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
                      {stage.sensei.quoteEn}
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2 pt-1 text-[11px]">
                      <div className="rounded-xl bg-white/70 p-2.5 dark:bg-[#2A2A2A]">
                        <strong className="text-emerald-700 dark:text-emerald-400">🎯 Key Focus:</strong>{" "}
                        <span className="text-[#6B6B6B] dark:text-[#A0A0A0]">{stage.sensei.focus}</span>
                      </div>
                      <div className="rounded-xl bg-white/70 p-2.5 dark:bg-[#2A2A2A]">
                        <strong className="text-rose-700 dark:text-rose-400">⚠️ Common Pitfall:</strong>{" "}
                        <span className="text-[#6B6B6B] dark:text-[#A0A0A0]">{stage.sensei.pitfall}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Substeps Skill Tree List */}
          {expanded && stageUnlocked && stage.substeps.length > 0 && (
            <div className="border-t border-black/5 bg-[#FAFAF8] p-5 space-y-3 dark:border-white/5 dark:bg-[#141414]">
              <div className="flex items-center justify-between text-xs font-bold text-[#6B6B6B] dark:text-[#A0A0A0] px-1">
                <span>STAGE PATH · SKILL TREE</span>
                <span>{stage.substeps.length} Milestones</span>
              </div>

              {stage.substeps.map((sub) => (
                <SubstepCard
                  key={sub.id}
                  sub={sub}
                  isUnlocked={unlockedIds.has(sub.id)}
                  completion={completions[sub.id] ?? 0}
                  isPassed={passedExams.has(sub.id)}
                />
              ))}
            </div>
          )}

          {/* Mastery Special Celebration View */}
          {isMastery && stageUnlocked && (
            <div className="border-t border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-orange-500/10 p-8 text-center space-y-4">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-yellow-500 text-white shadow-xl shadow-yellow-500/30 ring-4 ring-yellow-500/20 animate-bounce">
                <Trophy size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                  おめでとうございます！ (Congratulations!)
                </h3>
                <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A0A0A0] max-w-lg mx-auto">
                  You have conquered all 5 JLPT stages from Kana to N1. You are officially certified as a NihoLearn Grandmaster (宗家)!
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/stats"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#C84B31] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-[#b03e26] dark:bg-[#E85C40]"
                >
                  <Award size={18} />
                  <span>View Grandmaster Stats</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* MAIN ROADMAP VIEW EXPORT                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

export function RoadmapView({ progress }: RoadmapViewProps) {
  const passedExams = useMemo(() => new Set(progress.passedExams), [progress.passedExams]);
  const unlockedIds = useMemo(() => new Set(progress.unlockedIds), [progress.unlockedIds]);

  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const completedStages = roadmapStages.filter((stage) => {
    if (stage.substeps.length === 0) return passedExams.has(stage.unlockAfterExam ?? "");
    return stage.substeps.every((sub) => {
      if (sub.type === "exam") return passedExams.has(sub.id);
      return (progress.completions[sub.id] ?? 0) >= 1;
    });
  }).length;

  const currentStage = roadmapStages.find((s) => s.id === progress.currentStageId) || roadmapStages[0];

  // Filtered Stages for level navigator
  const visibleStages = selectedFilter === "all"
    ? roadmapStages
    : roadmapStages.filter((s) => s.id === selectedFilter);

  return (
    <div className="space-y-8">
      {/* ── Sensei's Academy Hero Banner ─────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-6 md:p-8 shadow-sm dark:border-white/15 dark:bg-[#1A1A1A]">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#C84B31] to-orange-500 text-3xl font-bold text-white shadow-lg ring-4 ring-[#C84B31]/20">
              ⛩️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#C84B31]/10 px-2.5 py-0.5 text-xs font-bold text-[#C84B31] dark:bg-[#E85C40]/15 dark:text-[#E85C40]">
                  日本語マスターへの道 · Odyssey
                </span>
                <span className="text-xs text-gray-400">Lecturer Guided</span>
              </div>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#FAFAFA]">
                Japanese Learning Roadmap
              </h1>
              <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
                Step-by-step quest path from Kana Foundation through N1 Mastery. Complete each stage's trial to unlock the next!
              </p>
            </div>
          </div>

          {/* Quick Stats Widget */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-initial rounded-2xl border border-black/10 bg-[#FAFAF8] p-4 text-center dark:border-white/10 dark:bg-[#2A2A2A]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
                Current Rank
              </div>
              <div className="mt-1 text-sm font-bold text-[#C84B31] dark:text-[#E85C40]">
                {currentStage.danjTitle}
              </div>
            </div>

            <div className="flex-1 md:flex-initial rounded-2xl border border-black/10 bg-[#FAFAF8] p-4 text-center dark:border-white/10 dark:bg-[#2A2A2A]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
                Stages Cleared
              </div>
              <div className="mt-1 text-xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                {completedStages} <span className="text-xs font-normal text-gray-400">/ 7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sensei's Greeting Bubble */}
        <div className="mt-6 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-transparent p-4 flex items-center gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white font-serif text-lg font-bold">
            教
          </div>
          <div className="text-xs leading-relaxed text-[#1A1A1A] dark:text-[#FAFAFA]">
            <strong className="text-purple-600 dark:text-purple-400">Tanaka-Sensei:</strong>{" "}
            {progress.currentStageId === "kana"
              ? "ようこそ！ Welcome student! Master the 46 Kana sounds first before taking the Kana Boss Trial. Take your time with stroke orders!"
              : progress.currentStageId === "n5"
                ? "素晴らしい！ You've conquered Kana! Now we enter N5 — building your survival vocabulary and foundational kanji."
                : `Keep going! You are currently on ${currentStage.title}. Focus on consistent daily practice.`}
          </div>
        </div>
      </div>

      {/* ── Interactive Stage Selector Filters ────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setSelectedFilter("all")}
          className={`flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap ${
            selectedFilter === "all"
              ? "bg-[#C84B31] text-white shadow-sm dark:bg-[#E85C40]"
              : "border border-black/10 bg-white text-[#6B6B6B] hover:text-[#1A1A1A] dark:border-white/15 dark:bg-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:text-white"
          }`}
        >
          <Layers size={14} />
          <span>Full Journey (All 7 Stages)</span>
        </button>

        {roadmapStages.map((stage) => {
          const isPassed = passedExams.has(stage.id === "kana" ? "kana_exam" : `${stage.id}_exam`);
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => setSelectedFilter(stage.id)}
              className={`flex items-center gap-1.5 rounded-2xl px-3.5 py-2.5 text-xs font-bold transition whitespace-nowrap ${
                selectedFilter === stage.id
                  ? "bg-[#C84B31] text-white shadow-sm dark:bg-[#E85C40]"
                  : "border border-black/10 bg-white text-[#6B6B6B] hover:text-[#1A1A1A] dark:border-white/15 dark:bg-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:text-white"
              }`}
            >
              <span>{stage.crest}</span>
              <span>{stage.title}</span>
              {isPassed && <span className="text-emerald-500">✓</span>}
            </button>
          );
        })}
      </div>

      {/* ── Winding Adventure Stage List ─────────────────────────────────── */}
      <div className="mx-auto max-w-4xl space-y-2">
        {visibleStages.map((stage, idx) => (
          <StageAdventureCard
            key={stage.id}
            stage={stage}
            completions={progress.completions}
            passedExams={passedExams}
            unlockedIds={unlockedIds}
            isCurrentStage={stage.id === progress.currentStageId}
            stageIndex={idx}
            totalStages={visibleStages.length}
          />
        ))}
      </div>
    </div>
  );
}
