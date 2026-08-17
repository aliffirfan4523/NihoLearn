import { requireUser } from "@/lib/auth";
import { MainDashboardView } from "@/components/dashboard/MainDashboardView";
import { calculateUserStreakAndStats } from "@/lib/stats-calc";
import { BASIC_ROWS, DAKUTEN_ROWS, COMBO_ROWS, kanaByGroup } from "@/lib/kana-groups";
import { roadmapStages } from "@/lib/data/roadmap";
import { getCachedDashboardData } from "@/lib/services/dashboard-data";
import { cookies } from "next/headers";

export const metadata = {
  title: "Dashboard | NihoLearn",
  description: "Your unified Japanese learning tracker, daily goals, and JLPT progress breakdown.",
};

export default async function DashboardPage() {
  const user = await requireUser();

  // ── High-speed cached data resolution (< 5ms on warm cache, ~100ms on fresh fetch) ──
  const { counts, masteredKanaIds, allSessions, jlpt, allKana } = await getCachedDashboardData(user.id);

  const kanaTotal = counts.kanaTotal;
  const vocabCount = counts.vocabCount;
  const kanjiCount = counts.kanjiCount;
  const grammarCount = counts.grammarCount;

  const kanaMastered = masteredKanaIds.length;
  const masteredIdSet = new Set(masteredKanaIds);

  const basicHiraIds = new Set(kanaByGroup(allKana, "hiragana", BASIC_ROWS).map((k) => k.id));
  const dakutenHiraIds = new Set(kanaByGroup(allKana, "hiragana", DAKUTEN_ROWS).map((k) => k.id));
  const combiHiraIds = new Set(kanaByGroup(allKana, "hiragana", COMBO_ROWS).map((k) => k.id));

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

  const cookieStore = await cookies();
  const tzOffset = parseInt(cookieStore.get("x-timezone-offset")?.value ?? "0", 10);
  const userStats = calculateUserStreakAndStats(allSessions as any, kanaMastered, tzOffset);

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
        return false;
      });
    if (!stageComplete) break;
  }

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
        jlpt: jlpt,
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
