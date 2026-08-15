import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { RoadmapView } from "@/components/progress/RoadmapView";
import { hiraganaSeed } from "@/lib/data/hiragana";
import { katakanaSeed } from "@/lib/data/katakana";
import {
  roadmapStages,
  computeUnlockedSubsteps,
} from "@/lib/data/roadmap";

export const metadata = {
  title: "Learning Roadmap | NihoLearn",
  description:
    "Your structured learning path from Kana Foundation to N1 mastery.",
};

export default async function RoadmapPage() {
  const user = await requireUser();

  // ── Fetch all user progress in parallel ────────────────────────────────
  const [
    kanaProgress,
    vocabProgress,
    kanjiProgress,
    grammarProgress,
    allSessions,
  ] = await Promise.all([
    prisma.kanaProgress.findMany({
      where: { userId: user.id, status: "mastered" },
      select: { kanaId: true },
    }),
    prisma.vocabProgress.findMany({
      where: { userId: user.id, status: "mastered" },
      select: { wordId: true, level: true },
    }),
    prisma.kanjiProgress.findMany({
      where: { userId: user.id, status: "mastered" },
      select: { kanjiId: true, level: true },
    }),
    prisma.grammarProgress.findMany({
      where: { userId: user.id, status: "mastered" },
      select: { grammarId: true, level: true },
    }),
    prisma.studySession.findMany({
      where: { userId: user.id },
      select: { notes: true },
    }),
  ]);

  // ── Build mastered-ID sets ─────────────────────────────────────────────
  const masteredKanaIds = new Set(kanaProgress.map((r) => r.kanaId));

  // Kana substep counts
  const basicHiraIds = new Set(hiraganaSeed.slice(0, 46).map((k) => k.id));
  const dakutenHiraIds = new Set(hiraganaSeed.slice(46, 71).map((k) => k.id));
  const combiHiraIds = new Set(hiraganaSeed.slice(71).map((k) => k.id));
  const basicKataIds = new Set(katakanaSeed.slice(0, 46).map((k) => k.id));
  const dakutenKataIds = new Set(katakanaSeed.slice(46, 71).map((k) => k.id));
  const combiKataIds = new Set(katakanaSeed.slice(71).map((k) => k.id));

  let basicHiraMastered = 0;
  let dakutenHiraMastered = 0;
  let combiHiraMastered = 0;
  let basicKataMastered = 0;
  let dakutenKataMastered = 0;
  let combiKataMastered = 0;

  for (const id of masteredKanaIds) {
    if (basicHiraIds.has(id)) basicHiraMastered++;
    else if (dakutenHiraIds.has(id)) dakutenHiraMastered++;
    else if (combiHiraIds.has(id)) combiHiraMastered++;
    else if (basicKataIds.has(id)) basicKataMastered++;
    else if (dakutenKataIds.has(id)) dakutenKataMastered++;
    else if (combiKataIds.has(id)) combiKataMastered++;
  }

  // Vocab / Kanji / Grammar by level
  const vocabByLevel: Record<string, number> = {};
  for (const v of vocabProgress) {
    const lv = v.level.toUpperCase();
    vocabByLevel[lv] = (vocabByLevel[lv] ?? 0) + 1;
  }

  const kanjiByLevel: Record<string, number> = {};
  for (const k of kanjiProgress) {
    const lv = k.level.toUpperCase();
    kanjiByLevel[lv] = (kanjiByLevel[lv] ?? 0) + 1;
  }

  const grammarByLevel: Record<string, number> = {};
  for (const g of grammarProgress) {
    const lv = g.level.toUpperCase();
    grammarByLevel[lv] = (grammarByLevel[lv] ?? 0) + 1;
  }

  // ── Detect passed exams from StudySession notes ────────────────────────
  const passedExams = new Set<string>();
  for (const s of allSessions) {
    if (s.notes) {
      try {
        const parsed = JSON.parse(s.notes);
        if (parsed.type === "exam" && parsed.passed === true && parsed.level) {
          const examId =
            parsed.level === "kana"
              ? "kana_exam"
              : `${parsed.level}_exam`;
          passedExams.add(examId);
        }
      } catch {
        // not JSON — skip
      }
    }
  }

  // ── Build completion ratios for every substep ──────────────────────────
  const completions: Record<string, number> = {};

  // Kana substeps
  completions["kana_hira_basic"] = basicHiraMastered / 46;
  completions["kana_hira_dakuten"] = dakutenHiraMastered / 25;
  completions["kana_hira_combo"] = combiHiraMastered / 33;
  completions["kana_kata_basic"] = basicKataMastered / 46;
  completions["kana_kata_dakuten"] = dakutenKataMastered / 25;
  completions["kana_kata_combo"] = combiKataMastered / 33;
  completions["kana_exam"] = passedExams.has("kana_exam") ? 1 : 0;

  // JLPT levels
  const jlptLevels = [
    { prefix: "n5", vocab: 800, kanji: 103, grammar: 146, reading: 30, listening: 20 },
    { prefix: "n4", vocab: 1500, kanji: 300, grammar: 120, reading: 40, listening: 25 },
    { prefix: "n3", vocab: 3750, kanji: 650, grammar: 124, reading: 50, listening: 30 },
    { prefix: "n2", vocab: 6000, kanji: 1000, grammar: 173, reading: 60, listening: 40 },
    { prefix: "n1", vocab: 10000, kanji: 2136, grammar: 244, reading: 80, listening: 50 },
  ];

  for (const lv of jlptLevels) {
    const lvKey = lv.prefix.toUpperCase();
    completions[`${lv.prefix}_vocab`] = Math.min(1, (vocabByLevel[lvKey] ?? 0) / lv.vocab);
    completions[`${lv.prefix}_kanji`] = Math.min(1, (kanjiByLevel[lvKey] ?? 0) / lv.kanji);
    completions[`${lv.prefix}_grammar`] = Math.min(1, (grammarByLevel[lvKey] ?? 0) / lv.grammar);
    completions[`${lv.prefix}_reading`] = 0;
    completions[`${lv.prefix}_listening`] = 0;
    completions[`${lv.prefix}_exam`] = passedExams.has(`${lv.prefix}_exam`) ? 1 : 0;
  }

  // ── Compute unlock set ─────────────────────────────────────────────────
  const unlockedIds = computeUnlockedSubsteps(completions, passedExams);

  // ── Determine current active stage ─────────────────────────────────────
  let currentStageId = "kana";
  for (const stage of roadmapStages) {
    const stageUnlocked =
      !stage.unlockAfterExam || passedExams.has(stage.unlockAfterExam);

    if (!stageUnlocked) break;

    const stageComplete =
      stage.substeps.length > 0 &&
      stage.substeps.every((sub) => {
        if (sub.type === "exam") return passedExams.has(sub.id);
        return (completions[sub.id] ?? 0) >= 1;
      });

    currentStageId = stage.id;
    if (!stageComplete) break;
  }

  return (
    <RoadmapView
      progress={{
        completions,
        passedExams: Array.from(passedExams),
        unlockedIds: Array.from(unlockedIds),
        currentStageId,
      }}
    />
  );
}
