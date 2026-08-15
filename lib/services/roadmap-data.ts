import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

export interface RoadmapData {
  masteredKanaIds: string[];
  levelCountsRows: Array<{
    type: string;
    level: string;
    count: number;
  }>;
  examNotes: string[];
}

export const getCachedRoadmapData = (userId: string) =>
  unstable_cache(
    async (): Promise<RoadmapData> => {
      const [kanaProgress, levelCountsRows, examSessions] = await Promise.all([
        prisma.kanaProgress.findMany({
          where: { userId, status: "mastered" },
          select: { kanaId: true },
        }),
        prisma.$queryRaw<
          Array<{
            type: string;
            level: string;
            count: number;
          }>
        >`
          SELECT 'vocab' as type, UPPER(level) as level, COUNT(*)::int as count
          FROM "VocabProgress"
          WHERE "userId" = ${userId} AND status = 'mastered'
          GROUP BY UPPER(level)

          UNION ALL

          SELECT 'kanji' as type, UPPER(level) as level, COUNT(*)::int as count
          FROM "KanjiProgress"
          WHERE "userId" = ${userId} AND status = 'mastered'
          GROUP BY UPPER(level)

          UNION ALL

          SELECT 'grammar' as type, UPPER(level) as level, COUNT(*)::int as count
          FROM "GrammarProgress"
          WHERE "userId" = ${userId} AND status = 'mastered'
          GROUP BY UPPER(level)
        `,
        prisma.studySession.findMany({
          where: { userId, notes: { contains: '"type":"exam"' } },
          select: { notes: true },
        }),
      ]);

      return {
        masteredKanaIds: kanaProgress.map((r) => r.kanaId),
        levelCountsRows: (levelCountsRows || []).map((r) => ({
          type: r.type,
          level: r.level,
          count: Number(r.count ?? 0),
        })),
        examNotes: examSessions.map((s) => s.notes).filter(Boolean) as string[],
      };
    },
    [`roadmap-data-${userId}`],
    {
      revalidate: 30, // 30-second stale-while-revalidate for sub-millisecond responses
      tags: [`user-data-${userId}`],
    }
  )();
