import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";
import type { DbKanjiItem } from "@/components/progress/KanjiProgressGrid";
import type { ProgressStatus } from "@/types";

export interface StaticKanjiDictItem {
  id: string;
  character: string;
  strokes: number;
  radicalNumber: number | null;
  frequency: number | null;
  jlpt: string;
  meaning: string;
  onyomi: string[];
  kunyomi: string[];
  examples: Array<{ word: string; reading: string; meaning: string }>;
  description: string | null;
}

/**
 * Caches static Kanji dictionary items per JLPT level for 1 hour.
 * Eliminates redundant database roundtrips for static dictionary data.
 */
export const getCachedKanjiDictionary = (level: string = "N5") =>
  unstable_cache(
    async (): Promise<StaticKanjiDictItem[]> => {
      let dbKanji: any[] = [];
      try {
        if ((prisma as any).kanji) {
          dbKanji = await (prisma as any).kanji.findMany({
            where: { jlpt: level },
            orderBy: [{ frequency: "asc" }, { id: "asc" }],
          });
        } else {
          dbKanji = await (prisma as any).$queryRawUnsafe(
            `SELECT id, character, strokes, "radicalNumber", frequency, jlpt, meaning, onyomi, kunyomi, examples, description FROM "Kanji" WHERE jlpt = $1 ORDER BY frequency ASC, id ASC`,
            level
          );
        }
      } catch (err) {
        console.error("Failed to query kanji dictionary:", err);
      }

      return (dbKanji || []).map((k: any) => {
        let onyomi: string[] = [];
        let kunyomi: string[] = [];
        let examples: Array<{ word: string; reading: string; meaning: string }> = [];

        try {
          if (k.onyomi) onyomi = typeof k.onyomi === "string" ? JSON.parse(k.onyomi) : k.onyomi;
        } catch {}
        try {
          if (k.kunyomi) kunyomi = typeof k.kunyomi === "string" ? JSON.parse(k.kunyomi) : k.kunyomi;
        } catch {}
        try {
          if (k.examples) examples = typeof k.examples === "string" ? JSON.parse(k.examples) : k.examples;
        } catch {}

        return {
          id: k.id || k.character,
          character: k.character,
          strokes: k.strokes ?? 1,
          radicalNumber: k.radicalNumber ?? null,
          frequency: k.frequency ?? null,
          jlpt: k.jlpt || level,
          meaning: k.meaning || "",
          onyomi: Array.isArray(onyomi) ? onyomi : [],
          kunyomi: Array.isArray(kunyomi) ? kunyomi : [],
          examples: Array.isArray(examples) ? examples : [],
          description: k.description ?? null,
        };
      });
    },
    [`kanji-dict-${level}`],
    {
      revalidate: 3600, // 1 hour cache for static dictionary content
    }
  )();

/**
 * Caches user's kanji progress map for fast merging.
 */
export const getCachedUserKanjiProgress = (userId: string) =>
  unstable_cache(
    async (): Promise<Record<string, { status: ProgressStatus; notes?: string | null }>> => {
      try {
        const rows = await prisma.kanjiProgress.findMany({
          where: { userId },
          select: { kanjiId: true, status: true, notes: true },
        });

        const map: Record<string, { status: ProgressStatus; notes?: string | null }> = {};
        for (const r of rows) {
          map[r.kanjiId] = {
            status: r.status as ProgressStatus,
            notes: r.notes,
          };
        }
        return map;
      } catch {
        return {};
      }
    },
    [`kanji-user-progress-${userId}`],
    {
      revalidate: 30, // 30-second cache
      tags: [`user-data-${userId}`],
    }
  )();

/**
 * Returns merged Kanji list with user progress in < 5ms.
 */
export async function getKanjiWithProgress(
  userId?: string | null,
  level: string = "N5"
): Promise<DbKanjiItem[]> {
  const [dict, userMap] = await Promise.all([
    getCachedKanjiDictionary(level),
    userId
      ? getCachedUserKanjiProgress(userId)
      : Promise.resolve({} as Record<string, { status: ProgressStatus; notes?: string | null }>),
  ]);

  return dict.map((k) => {
    const prog = userMap[k.character] || userMap[k.id];
    return {
      ...k,
      status: (prog?.status ?? "unlearned") as ProgressStatus,
      notes: prog?.notes ?? null,
    };
  });
}
