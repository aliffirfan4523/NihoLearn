import { KanjiProgressGrid, type DbKanjiItem } from "@/components/progress/KanjiProgressGrid";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { ProgressStatus } from "@/types";

export const metadata = {
  title: "JLPT Kanji Requirements | NihoLearn",
  description: "Browse JLPT Kanji requirements, readings, stroke counts, and radicals reference table.",
};

export default async function KanjiProgressPage() {
  const user = await getCurrentUser();
  let initialKanji: DbKanjiItem[] = [];

  try {
    let dbKanji: any[] = [];
    if ((prisma as any).kanji) {
      dbKanji = await (prisma as any).kanji.findMany({
        where: { jlpt: "N5" },
        orderBy: [{ frequency: "asc" }, { id: "asc" }],
        include: user
          ? {
              progress: {
                where: { userId: user.id },
                select: { status: true, notes: true },
              },
            }
          : undefined,
      });
    } else {
      dbKanji = await (prisma as any).$queryRawUnsafe(
        `SELECT id, character, strokes, "radicalNumber", frequency, jlpt, meaning, onyomi, kunyomi, examples, begins, "usedIn", "componentIn", description FROM "Kanji" WHERE jlpt = $1 ORDER BY frequency ASC, id ASC`,
        "N5"
      );

      if (user && (prisma as any).kanjiProgress) {
        const progressList = await (prisma as any).kanjiProgress.findMany({
          where: { userId: user.id },
          select: { kanjiId: true, status: true, notes: true },
        });
        const progressMap = new Map(progressList.map((p: any) => [p.kanjiId, p]));
        dbKanji = dbKanji.map((k) => ({
          ...k,
          progress: progressMap.has(k.character) ? [progressMap.get(k.character)] : [],
        }));
      }
    }

    initialKanji = dbKanji.map((k: any) => {
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

      const userProgress = k.progress && k.progress.length > 0 ? k.progress[0] : null;

      return {
        id: k.id,
        character: k.character,
        strokes: k.strokes ?? 1,
        radicalNumber: k.radicalNumber,
        frequency: k.frequency,
        jlpt: k.jlpt,
        meaning: k.meaning,
        onyomi: Array.isArray(onyomi) ? onyomi : [],
        kunyomi: Array.isArray(kunyomi) ? kunyomi : [],
        examples: Array.isArray(examples) ? examples : [],
        begins: k.begins,
        usedIn: k.usedIn,
        componentIn: k.componentIn,
        description: k.description,
        status: (userProgress?.status ?? "unlearned") as ProgressStatus,
        notes: userProgress?.notes ?? null,
      };
    });
  } catch (err) {
    console.error("Failed to query kanji on server:", err);
  }

  return <KanjiProgressGrid initialKanji={initialKanji} />;
}
