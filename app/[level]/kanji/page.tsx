import { KanjiGrid } from "@/components/kanji/KanjiGrid";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatLevel, jlptLevels } from "@/lib/routes";
import { notFound } from "next/navigation";
import type { KanjiEntry, ProgressStatus, JLPTLevel } from "@/types";

export default async function KanjiPage({ params }: { params: Promise<{ level: string }> }) {
  const user = await getCurrentUser();
  const { level } = await params;
  if (!jlptLevels.includes(level as never)) notFound();

  const label = formatLevel(level); // "N5", "N4", etc.

  let kanjiEntries: KanjiEntry[] = [];
  const progressMap: Record<string, ProgressStatus> = {};

  try {
    let dbKanji: any[] = [];
    if ((prisma as any).kanji) {
      dbKanji = await (prisma as any).kanji.findMany({
        where: { jlpt: label },
        orderBy: [{ frequency: "asc" }, { id: "asc" }],
      });
    } else {
      dbKanji = await (prisma as any).$queryRawUnsafe(
        `SELECT id, character, strokes, "radicalNumber", frequency, jlpt, meaning, onyomi, kunyomi, examples, begins, "usedIn", "componentIn", description FROM "Kanji" WHERE jlpt = $1 ORDER BY frequency ASC, id ASC`,
        label
      );
    }

    const progress =
      user && (prisma as any).kanjiProgress
        ? await (prisma as any).kanjiProgress.findMany({
            where: { userId: user.id, level: label },
          })
        : [];

    for (const p of progress) {
      progressMap[p.kanjiId] = p.status as ProgressStatus;
    }

    kanjiEntries = dbKanji.map((k: any) => {
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

      const meaningList = k.meaning
        ? k.meaning
            .split(/[;,]/)
            .map((m: string) => m.trim())
            .filter(Boolean)
        : [k.character];

      return {
        id: k.character,
        level: (k.jlpt || label) as JLPTLevel,
        character: k.character,
        onyomi: Array.isArray(onyomi) ? onyomi : [],
        kunyomi: Array.isArray(kunyomi) ? kunyomi : [],
        meaning: meaningList.length > 0 ? meaningList : [k.meaning],
        strokeCount: k.strokes ?? 1,
        exampleWords: Array.isArray(examples) ? examples.map((e: any) => `${e.word} (${e.reading})`) : [],
      };
    });
  } catch (err) {
    console.error("Failed to query kanji on server:", err);
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/20 dark:bg-[#1A1A1A]">
        <div className="pointer-events-none absolute -right-6 -top-12 font-serif text-[12rem] leading-none text-[#C84B31]/5 dark:text-[#C84B31]/10">
          漢
        </div>
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#C84B31] dark:text-[#E85C40]">
            JLPT {label}
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#FAFAFA]">
            {label} Kanji
          </h2>
          <p className="mt-4 text-[#6B6B6B] dark:text-[#A0A0A0]">
            {kanjiEntries.length} kanji characters available in database. Click any card to view detailed readings, stroke count, example words, and cycle mastery status.
          </p>
        </div>
      </section>

      {kanjiEntries.length > 0 ? (
        <KanjiGrid kanji={kanjiEntries} progressMap={progressMap} />
      ) : (
        <div className="rounded-3xl border border-black/10 bg-white p-12 text-center text-[#6B6B6B] dark:border-white/20 dark:bg-[#1A1A1A] dark:text-[#A0A0A0]">
          No Kanji found in the database for {label}.
        </div>
      )}
    </div>
  );
}
