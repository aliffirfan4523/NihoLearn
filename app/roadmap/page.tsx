import { requireUser } from "@/lib/auth";
import { RoadmapView } from "@/components/progress/RoadmapView";
import { hiraganaSeed } from "@/lib/data/hiragana";
import { katakanaSeed } from "@/lib/data/katakana";
import {
  roadmapStages,
  computeUnlockedSubsteps,
} from "@/lib/data/roadmap";
import { getCachedRoadmapData } from "@/lib/services/roadmap-data";

export const metadata = {
  title: "Learning Roadmap | NihoLearn",
  description:
    "Your structured learning path from Kana Foundation to N1 mastery.",
};

export default async function RoadmapPage() {
  const user = await requireUser();

  // ── High-speed cached data resolution (< 5ms on warm cache) ──
  const { masteredKanaIds: rawKanaIds, levelCountsRows, examNotes } =
    await getCachedRoadmapData(user.id);

  // ── Build mastered-ID sets for Kana ─────────────────────────────────────
  const masteredKanaIds = new Set(rawKanaIds);

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

  // Vocab / Kanji / Grammar by level from SQL aggregation
  const vocabByLevel: Record<string, number> = {};
  const kanjiByLevel: Record<string, number> = {};
  const grammarByLevel: Record<string, number> = {};

  for (const row of levelCountsRows) {
    const lv = (row.level ?? "").toUpperCase();
    const cnt = Number(row.count ?? 0);
    if (row.type === "vocab") vocabByLevel[lv] = cnt;
    else if (row.type === "kanji") kanjiByLevel[lv] = cnt;
    else if (row.type === "grammar") grammarByLevel[lv] = cnt;
  }

  // ── Detect passed exams from exam notes ────────────────────────────────
  const passedExams = new Set<string>();
  for (const notes of examNotes) {
    if (notes) {
      try {
        const parsed = JSON.parse(notes);
        if (parsed.type === "exam" && parsed.passed === true && parsed.level) {
          const examId =
            parsed.level === "kana"
              ? "kana_exam"
              : `${parsed.level}_exam`;
          passedExams.add(examId);
        }
      } catch {}
    }
  }

  // ── Build completion ratios for every substep ──────────────────────────
  const completions: Record<string, number> = {};

  // Kana substeps
  completions["kana_hira_basic"] = basicHiraMastered / 46;
  completions["kana_hira_dakuten"] = dakutenHiraMastered / 25;
  completions["kana_hira_combi"] = combiHiraMastered / 33;
  completions["kana_kata_basic"] = basicKataMastered / 46;
  completions["kana_kata_dakuten"] = dakutenKataMastered / 25;
  completions["kana_kata_combi"] = combiKataMastered / 33;
  completions["kana_exam"] = passedExams.has("kana_exam") ? 1.0 : 0.0;

  // JLPT levels (N5 to N1)
  const jlptTargets: Record<
    string,
    { kanji: number; vocab: number; grammar: number }
  > = {
    N5: { kanji: 80, vocab: 600, grammar: 40 },
    N4: { kanji: 170, vocab: 1200, grammar: 90 },
    N3: { kanji: 370, vocab: 1800, grammar: 130 },
    N2: { kanji: 380, vocab: 2500, grammar: 170 },
    N1: { kanji: 1150, vocab: 3500, grammar: 200 },
  };

  for (const [lv, targets] of Object.entries(jlptTargets)) {
    const lower = lv.toLowerCase();
    const kCount = kanjiByLevel[lv] ?? 0;
    const vCount = vocabByLevel[lv] ?? 0;
    const gCount = grammarByLevel[lv] ?? 0;

    completions[`${lower}_kanji`] = Math.min(1.0, kCount / targets.kanji);
    completions[`${lower}_vocab`] = Math.min(1.0, vCount / targets.vocab);
    completions[`${lower}_grammar`] = Math.min(1.0, gCount / targets.grammar);
    completions[`${lower}_exam`] = passedExams.has(`${lower}_exam`) ? 1.0 : 0.0;
  }

  // ── Compute unlocked substeps using dependency graph ───────────────────
  const unlockedSubsteps = computeUnlockedSubsteps(
    completions,
    passedExams
  );

  // ── Determine current stage ID ──────────────────────────────────────────
  let currentStageId = roadmapStages[0].id;
  for (const stage of roadmapStages) {
    const isUnlocked = !stage.unlockAfterExam || passedExams.has(stage.unlockAfterExam);
    if (!isUnlocked) break;
    currentStageId = stage.id;
    const isComplete = stage.substeps.every(
      (sub) => (completions[sub.id] ?? 0) >= 1.0
    );
    if (!isComplete) break;
  }

  return (
    <RoadmapView
      progress={{
        completions,
        passedExams: Array.from(passedExams),
        unlockedIds: Array.from(unlockedSubsteps),
        currentStageId,
      }}
    />
  );
}
