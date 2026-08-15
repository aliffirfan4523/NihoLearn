import { VocabTable } from "@/components/vocabulary/VocabTable";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatLevel, jlptLevels } from "@/lib/routes";
import { notFound } from "next/navigation";
import type { VocabWord, ProgressStatus } from "@/types";

export default async function VocabularyPage({ params }: { params: Promise<{ level: string }> }) {
  const user = await getCurrentUser();
  const { level } = await params;
  if (!jlptLevels.includes(level as never)) notFound();

  const label = formatLevel(level); // "N5", "N4", "N3", "N2", "N1"

  let dbWords: any[] = [];
  try {
    dbWords = await (prisma as any).vocabulary.findMany({
      where: { level: label },
      orderBy: [{ id: "asc" }],
    });
  } catch {
    try {
      dbWords = await prisma.$queryRawUnsafe(
        `SELECT * FROM "Vocabulary" WHERE "level" = $1 ORDER BY "id" ASC`,
        label
      );
    } catch {
      dbWords = [];
    }
  }

  let progress: any[] = [];
  if (user?.id) {
    try {
      progress = await (prisma as any).vocabProgress.findMany({
        where: { userId: user.id, level: label },
      });
    } catch {
      try {
        progress = await prisma.$queryRawUnsafe(
          `SELECT "id", "wordId", "status" FROM "VocabProgress" WHERE "userId" = $1 AND "level" = $2`,
          user.id,
          label
        );
      } catch {}
    }
  }

  const progressMap: Record<string, { id: string; status: ProgressStatus }> = {};
  for (const p of progress) {
    progressMap[p.wordId] = { id: p.id, status: p.status as ProgressStatus };
  }

  const words: VocabWord[] = dbWords.map((w) => {
    let meaningList: string[] = [];
    try {
      meaningList = typeof w.meaning === "string" ? w.meaning.split(",").map((m: string) => m.trim()) : [w.meaning];
    } catch {
      meaningList = [String(w.meaning || "")];
    }

    return {
      id: w.id,
      level: w.level,
      word: w.word,
      reading: w.reading,
      romaji: w.romaji || "",
      meaning: meaningList,
      partOfSpeech: w.partOfSpeech || "",
      exampleSentence: w.exampleSentence || undefined,
      notes: w.tags || undefined,
    };
  });

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-8 shadow-xs dark:border-white/10 dark:bg-[#161B22]">
        <div className="pointer-events-none absolute -right-6 -top-12 font-serif text-[12rem] leading-none text-[var(--color-vermillion)]/5 dark:text-[var(--color-vermillion)]/10">
          語
        </div>
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-vermillion)]">
            JLPT {label}
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#F0F4F8]">
            {label} Vocabulary
          </h2>
          <p className="mt-4 text-[#6B6B6B] dark:text-[#94A3B8]">
            {words.length} core vocabulary words loaded from database. Click status badges to cycle: Not learned → Learning → Mastered.
          </p>
        </div>
      </section>

      {words.length > 0 ? (
        <VocabTable words={words} progressMap={progressMap} />
      ) : (
        <div className="rounded-3xl border border-black/10 bg-white p-12 text-center text-[#6B6B6B] dark:border-white/10 dark:bg-[#161B22] dark:text-[#94A3B8]">
          No vocabulary words found for {label}.
        </div>
      )}
    </div>
  );
}
