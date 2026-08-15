import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { UserProfileView } from "@/components/profile/UserProfileView";
import { calculateUserStreakAndStats } from "@/lib/stats-calc";

export const metadata = {
  title: "User Profile | NihoLearn",
  description: "View your Japanese learning statistics, study activity calendar, and JLPT progress breakdown.",
};

export default async function ProfilePage() {
  const user = await requireUser();

  // ── High-speed parallel fetching (1 aggregated SQL count + sessions) ──
  const [countsResult, allSessions] = await Promise.all([
    prisma.$queryRaw<
      Array<{
        kanaCount: number;
        vocabCount: number;
        kanjiCount: number;
        grammarCount: number;
      }>
    >`
      SELECT
        (SELECT COUNT(*)::int FROM "KanaProgress" WHERE "userId" = ${user.id}) AS "kanaCount",
        (SELECT COUNT(*)::int FROM "VocabProgress" WHERE "userId" = ${user.id}) AS "vocabCount",
        (SELECT COUNT(*)::int FROM "KanjiProgress" WHERE "userId" = ${user.id}) AS "kanjiCount",
        (SELECT COUNT(*)::int FROM "GrammarProgress" WHERE "userId" = ${user.id}) AS "grammarCount"
    `,
    prisma.studySession.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      select: { id: true, date: true, durationMinutes: true, wordsReviewed: true, notes: true, activities: true, level: true },
    }),
  ]);

  const counts = countsResult[0] ?? {
    kanaCount: 0,
    vocabCount: 0,
    kanjiCount: 0,
    grammarCount: 0,
  };

  const kanaCount = Number(counts.kanaCount ?? 0);
  const vocabCount = Number(counts.vocabCount ?? 0);
  const kanjiCount = Number(counts.kanjiCount ?? 0);
  const grammarCount = Number(counts.grammarCount ?? 0);

  const userStats = calculateUserStreakAndStats(allSessions as any, kanaCount);

  return (
    <UserProfileView
      user={user}
      stats={{
        kanaCount: userStats.kanaReviews,
        vocabCount,
        kanjiCount,
        grammarCount,
        sessionCount: userStats.totalSessions,
        totalMinutes: userStats.totalStudiedMinutes,
        streak: userStats.streak,
      }}
    />
  );
}
