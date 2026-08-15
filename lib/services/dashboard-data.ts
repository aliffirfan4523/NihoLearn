import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

export interface DashboardData {
  counts: {
    kanaTotal: number;
    vocabCount: number;
    kanjiCount: number;
    grammarCount: number;
  };
  masteredKanaIds: string[];
  allSessions: Array<{
    id: string;
    date: Date | string;
    durationMinutes: number;
    wordsReviewed: number | null;
    notes: string | null;
    activities: string | string[] | null;
    level: string | null;
  }>;
}

export const getCachedDashboardData = (userId: string) =>
  unstable_cache(
    async (): Promise<DashboardData> => {
      const [countsResult, masteredProgressRows, allSessions] = await Promise.all([
        prisma.$queryRaw<
          Array<{
            kanaTotal: number;
            vocabCount: number;
            kanjiCount: number;
            grammarCount: number;
          }>
        >`
          SELECT
            (SELECT COUNT(*)::int FROM "KanaProgress" WHERE "userId" = ${userId}) AS "kanaTotal",
            (SELECT COUNT(*)::int FROM "VocabProgress" WHERE "userId" = ${userId}) AS "vocabCount",
            (SELECT COUNT(*)::int FROM "KanjiProgress" WHERE "userId" = ${userId}) AS "kanjiCount",
            (SELECT COUNT(*)::int FROM "GrammarProgress" WHERE "userId" = ${userId}) AS "grammarCount"
        `,
        prisma.kanaProgress.findMany({
          where: { userId, status: "mastered" },
          select: { kanaId: true },
        }),
        prisma.studySession.findMany({
          where: { userId },
          orderBy: { date: "desc" },
          select: {
            id: true,
            date: true,
            durationMinutes: true,
            wordsReviewed: true,
            notes: true,
            activities: true,
            level: true,
          },
        }),
      ]);

      const counts = countsResult[0] ?? {
        kanaTotal: 0,
        vocabCount: 0,
        kanjiCount: 0,
        grammarCount: 0,
      };

      return {
        counts: {
          kanaTotal: Number(counts.kanaTotal ?? 0),
          vocabCount: Number(counts.vocabCount ?? 0),
          kanjiCount: Number(counts.kanjiCount ?? 0),
          grammarCount: Number(counts.grammarCount ?? 0),
        },
        masteredKanaIds: masteredProgressRows.map((r) => r.kanaId),
        allSessions: allSessions as any,
      };
    },
    [`dashboard-data-${userId}`],
    {
      revalidate: 30, // 30-second stale-while-revalidate for sub-millisecond responses
      tags: [`user-data-${userId}`],
    }
  )();
