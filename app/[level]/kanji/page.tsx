import { KanjiGrid } from "@/components/kanji/KanjiGrid";
import { prisma } from "@/lib/db";
import { n5Kanji } from "@/lib/data/n5-kanji";
import { formatLevel, jlptLevels } from "@/lib/routes";
import { notFound } from "next/navigation";
import type { KanjiEntry, ProgressStatus } from "@/types";

export default async function KanjiPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  if (!jlptLevels.includes(level as never)) notFound();

  const label = formatLevel(level);
  const staticKanji: KanjiEntry[] = level === "n5" ? n5Kanji : [];

  const progress = await prisma.kanjiProgress.findMany({ where: { level: label } });
  const progressMap: Record<string, ProgressStatus> = {};
  for (const p of progress) {
    progressMap[p.kanjiId] = p.status as ProgressStatus;
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <div className="pointer-events-none absolute -right-6 -top-12 font-serif text-[12rem] leading-none text-[#C84B31]/5">漢</div>
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#C84B31]">JLPT {label}</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#1A1A1A]">{label} Kanji</h2>
          <p className="mt-4 text-[#6B6B6B]">{staticKanji.length} kanji available. Click a card to see details and cycle status.</p>
        </div>
      </section>

      {staticKanji.length > 0 ? (
        <KanjiGrid kanji={staticKanji} progressMap={progressMap} />
      ) : (
        <div className="rounded-3xl border border-black/10 bg-white p-12 text-center text-[#6B6B6B]">
          Kanji data for {label} is not yet available. N5 content is ready — try /n5/kanji.
        </div>
      )}
    </div>
  );
}
