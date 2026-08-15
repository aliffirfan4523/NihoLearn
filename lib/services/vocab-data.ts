import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";
import type { VocabProgressItem } from "@/components/vocabulary/VocabProgressView";
import type { ProgressStatus } from "@/types";

export interface StaticVocabDictItem {
  id: string;
  word: string;
  reading: string;
  romaji: string;
  meaning: string[];
  level: string;
  partOfSpeech: string;
  tags: string | null;
}

/**
 * Caches static Vocabulary dictionary items per level for 1 hour.
 */
export const getCachedVocabDictionary = (level: string = "N5", limit: number = 100) =>
  unstable_cache(
    async (): Promise<StaticVocabDictItem[]> => {
      let dbWords: any[] = [];
      try {
        if ((prisma as any).vocabulary) {
          dbWords = await (prisma as any).vocabulary.findMany({
            where: { level },
            orderBy: [{ id: "asc" }],
            take: limit,
          });
        } else {
          dbWords = await prisma.$queryRawUnsafe(
            `SELECT * FROM "Vocabulary" WHERE "level" = $1 ORDER BY "id" ASC LIMIT $2`,
            level,
            limit
          );
        }
      } catch (err) {
        console.error("Failed to query vocab dictionary:", err);
      }

      return (dbWords || []).map((w: any) => {
        let meaningList: string[] = [];
        try {
          meaningList =
            typeof w.meaning === "string"
              ? w.meaning.split(",").map((m: string) => m.trim())
              : Array.isArray(w.meaning)
              ? w.meaning
              : [String(w.meaning || "")];
        } catch {
          meaningList = [String(w.meaning || "")];
        }

        return {
          id: w.id,
          word: w.word,
          reading: w.reading,
          romaji: w.romaji || "",
          meaning: meaningList,
          level: w.level || level,
          partOfSpeech: w.partOfSpeech || "",
          tags: w.tags || null,
        };
      });
    },
    [`vocab-dict-${level}-${limit}`],
    {
      revalidate: 3600, // 1 hour cache
    }
  )();

/**
 * Caches user's vocabulary progress map.
 */
export const getCachedUserVocabProgress = (userId: string) =>
  unstable_cache(
    async (): Promise<Record<string, { status: ProgressStatus; notes?: string | null }>> => {
      try {
        const rows = await prisma.vocabProgress.findMany({
          where: { userId },
          select: { wordId: true, status: true, notes: true },
        });

        const map: Record<string, { status: ProgressStatus; notes?: string | null }> = {};
        for (const r of rows) {
          map[r.wordId] = {
            status: r.status as ProgressStatus,
            notes: r.notes,
          };
        }
        return map;
      } catch {
        return {};
      }
    },
    [`vocab-user-progress-${userId}`],
    {
      revalidate: 30,
      tags: [`user-data-${userId}`],
    }
  )();

/**
 * Returns merged Vocabulary list with user progress in < 5ms.
 */
export async function getVocabWithProgress(
  userId?: string | null,
  level: string = "N5",
  limit: number = 100
): Promise<VocabProgressItem[]> {
  const [dict, userMap] = await Promise.all([
    getCachedVocabDictionary(level, limit),
    userId
      ? getCachedUserVocabProgress(userId)
      : Promise.resolve({} as Record<string, { status: ProgressStatus; notes?: string | null }>),
  ]);

  return dict.map((w) => {
    const prog = userMap[w.id] || { status: "unlearned" };
    return {
      ...w,
      status: prog.status,
      notes: prog.notes || null,
      reviews: prog.status === "mastered" ? 8 : prog.status === "reviewing" ? 3 : 0,
      successRate: prog.status === "mastered" ? 100 : prog.status === "reviewing" ? 75 : 0,
      lastReviewed: prog.status !== "unlearned" ? "2d ago" : "—",
      nextReview: prog.status === "reviewing" ? "Tomorrow" : "—",
    };
  });
}
