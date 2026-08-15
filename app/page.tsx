import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { MainDashboardView } from "@/components/dashboard/MainDashboardView";
import { calculateUserStreakAndStats } from "@/lib/stats-calc";
import { hiraganaSeed } from "@/lib/data/hiragana";
import { katakanaSeed } from "@/lib/data/katakana";
import { roadmapStages } from "@/lib/data/roadmap";

export const metadata = {
  title: "Dashboard | NihoLearn",
  description: "Your unified Japanese learning tracker, daily goals, and JLPT progress breakdown.",
};

export default async function DashboardPage() {
  const user = await requireUser();

  const [
    kanaTotal,
    masteredProgressRows,
    vocabCount,
    kanjiCount,
    grammarCount,
    allSessions,
  ] = await Promise.all([
    prisma.kanaProgress.count({ where: { userId: user.id } }),
    prisma.kanaProgress.findMany({ where: { userId: user.id, status: "mastered" } }),
    prisma.vocabProgress.count({ where: { userId: user.id } }),
    prisma.kanjiProgress.count({ where: { userId: user.id } }),
    prisma.grammarProgress.count({ where: { userId: user.id } }),
    prisma.studySession.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    }),
  ]);

  const kanaMastered = masteredProgressRows.length;
  const masteredIdSet = new Set(masteredProgressRows.map((r) => r.kanaId));

  const basicHiraIds = new Set(hiraganaSeed.slice(0, 46).map((k) => k.id));
  const dakutenHiraIds = new Set(hiraganaSeed.slice(46, 71).map((k) => k.id));
  const combiHiraIds = new Set(hiraganaSeed.slice(71).map((k) => k.id));

  let basicHiraCount = 0;
  let dakutenHiraCount = 0;
  let combiHiraCount = 0;
  let hiraMastered = 0;
  let kataMastered = 0;

  for (const id of masteredIdSet) {
    if (id.startsWith("hira_")) {
      hiraMastered++;
      if (basicHiraIds.has(id)) basicHiraCount++;
      else if (dakutenHiraIds.has(id)) dakutenHiraCount++;
      else if (combiHiraIds.has(id)) combiHiraCount++;
    } else if (id.startsWith("kata_")) {
      kataMastered++;
    }
  }

  const userStats = calculateUserStreakAndStats(allSessions, kanaMastered);

  // ── Determine current roadmap stage for the "Start Here / Current Stage" banner ──
  const passedExamIds = new Set<string>();
  for (const s of allSessions) {
    if (s.notes) {
      try {
        const parsed = JSON.parse(s.notes);
        if (parsed.type === "exam" && parsed.passed === true && parsed.level) {
          passedExamIds.add(parsed.level === "kana" ? "kana_exam" : `${parsed.level}_exam`);
        }
      } catch {}
    }
  }

  let currentStage = roadmapStages[0]; // default to Kana
  for (const stage of roadmapStages) {
    const stageUnlocked = !stage.unlockAfterExam || passedExamIds.has(stage.unlockAfterExam);
    if (!stageUnlocked) break;
    currentStage = stage;
    const stageComplete =
      stage.substeps.length > 0 &&
      stage.substeps.every((sub) => {
        if (sub.type === "exam") return passedExamIds.has(sub.id);
        return false; // simplified — just advance past exams
      });
    if (!stageComplete) break;
  }

  // Determine the first unlocked-but-incomplete substep href, or fallback
  const stageHref = currentStage.substeps[0]?.href ?? "/progress";

  return (
    <MainDashboardView
      user={user}
      stats={{
        kanaMastered,
        kanaTotal,
        vocabCount,
        kanjiCount,
        grammarCount,
        sessionCount: userStats.totalSessions,
        totalMinutes: userStats.totalStudiedMinutes,
        streak: userStats.streak,
        kanaReviews: userStats.kanaReviews,
        kanaAttempts: userStats.kanaAttempts,
        kanaAnswers: userStats.kanaAnswers,
        kanaAccuracy: userStats.kanaAccuracy,
        hiraMastered,
        kataMastered,
        basicHiraCount,
        dakutenHiraCount,
        combiHiraCount,
        currentStep: {
          step: currentStage.step,
          title: currentStage.title,
          subtitle: currentStage.subtitle,
          href: stageHref,
        },
      }}
    />
  );
}
