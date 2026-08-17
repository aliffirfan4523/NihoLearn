import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

export interface JlptLevelStats {
  level: string;
  vocabMastered: number;
  vocabTotal: number;
  kanjiMastered: number;
  kanjiTotal: number;
  grammarMastered: number;
  grammarTotal: number;
}

export interface DashboardData {
  counts: {
    kanaTotal: number;
    vocabCount: number;
    kanjiCount: number;
    grammarCount: number;
  };
  masteredKanaIds: string[];
  allKana: Array<{ id: string; type: string; character: string; romaji: string; row: string }>;
  jlpt: JlptLevelStats[];
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

const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;

// No Grammar content table exists — grammar curriculum sizes are stable constants.
const GRAMMAR_TOTALS: Record<string, number> = {
  N5: 146,
  N4: 120,
  N3: 124,
  N2: 173,
  N1: 244,
};

export const getCachedDashboardData = (userId: string) =>
  unstable_cache(
    async (): Promise<DashboardData> => {
      const [
        countsResult,
        masteredProgressRows,
        allSessions,
        allKana,
        vocabMasteredRows,
        kanjiMasteredRows,
        grammarMasteredRows,
        vocabTotalRows,
        kanjiTotalRows,
      ] = await Promise.all([
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
        prisma.kana.findMany({
          select: { id: true, type: true, character: true, romaji: true, row: true },
          orderBy: [{ type: "asc" }, { row: "asc" }, { id: "asc" }],
        }),
        prisma.$queryRaw<Array<{ level: string; count: number }>>`
          SELECT "level", COUNT(*)::int AS "count" FROM "VocabProgress"
          WHERE "userId" = ${userId} AND "status" = 'mastered' GROUP BY "level"
        `,
        prisma.$queryRaw<Array<{ level: string; count: number }>>`
          SELECT "level", COUNT(*)::int AS "count" FROM "KanjiProgress"
          WHERE "userId" = ${userId} AND "status" = 'mastered' GROUP BY "level"
        `,
        prisma.$queryRaw<Array<{ level: string; count: number }>>`
          SELECT "level", COUNT(*)::int AS "count" FROM "GrammarProgress"
          WHERE "userId" = ${userId} AND "status" = 'mastered' GROUP BY "level"
        `,
        prisma.$queryRaw<Array<{ level: string; count: number }>>`
          SELECT "level", COUNT(*)::int AS "count" FROM "Vocabulary" GROUP BY "level"
        `,
        prisma.$queryRaw<Array<{ level: string; count: number }>>`
          SELECT "jlpt" AS "level", COUNT(*)::int AS "count" FROM "Kanji" GROUP BY "jlpt"
        `,
      ]);

      const counts = countsResult[0] ?? {
        kanaTotal: 0,
        vocabCount: 0,
        kanjiCount: 0,
        grammarCount: 0,
      };

      const toLevelMap = (rows: Array<{ level: string; count: number }>) => {
        const map: Record<string, number> = {};
        for (const row of rows) map[row.level] = Number(row.count ?? 0);
        return map;
      };

      const vocabMastered = toLevelMap(vocabMasteredRows);
      const kanjiMastered = toLevelMap(kanjiMasteredRows);
      const grammarMastered = toLevelMap(grammarMasteredRows);
      const vocabTotal = toLevelMap(vocabTotalRows);
      const kanjiTotal = toLevelMap(kanjiTotalRows);

      const jlpt: JlptLevelStats[] = JLPT_LEVELS.map((level) => ({
        level,
        vocabMastered: vocabMastered[level] ?? 0,
        vocabTotal: vocabTotal[level] ?? 0,
        kanjiMastered: kanjiMastered[level] ?? 0,
        kanjiTotal: kanjiTotal[level] ?? 0,
        grammarMastered: grammarMastered[level] ?? 0,
        grammarTotal: GRAMMAR_TOTALS[level] ?? 0,
      }));

      return {
        counts: {
          kanaTotal: Number(counts.kanaTotal ?? 0),
          vocabCount: Number(counts.vocabCount ?? 0),
          kanjiCount: Number(counts.kanjiCount ?? 0),
          grammarCount: Number(counts.grammarCount ?? 0),
        },
        masteredKanaIds: masteredProgressRows.map((r) => r.kanaId),
        allKana,
        jlpt,
        allSessions: allSessions as any,
      };
    },
    [`dashboard-data-${userId}`],
    {
      revalidate: 30, // 30-second stale-while-revalidate for sub-millisecond responses
      tags: [`user-data-${userId}`],
    }
  )();
