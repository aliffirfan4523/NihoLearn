import { VocabTable } from "@/components/vocabulary/VocabTable";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { n5Vocab } from "@/lib/data/n5-vocab";
import { formatLevel, jlptLevels } from "@/lib/routes";
import { notFound } from "next/navigation";
import type { VocabWord, ProgressStatus } from "@/types";

export default async function VocabularyPage({ params }: { params: Promise<{ level: string }> }) {
  const user = await requireUser();
  const { level } = await params;
  if (!jlptLevels.includes(level as never)) notFound();

  const label = formatLevel(level);
  const staticVocab: VocabWord[] = level === "n5" ? n5Vocab : [];

  const progress = await prisma.vocabProgress.findMany({
    where: { userId: user.id, level: label },
  });

  const progressMap: Record<string, { id: string; status: ProgressStatus }> = {};
  for (const p of progress) {
    progressMap[p.wordId] = { id: p.id, status: p.status as ProgressStatus };
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/20 dark:bg-[#1A1A1A]">
        <div className="pointer-events-none absolute -right-6 -top-12 font-serif text-[12rem] leading-none text-[#C84B31]/5 dark:text-[#C84B31]/10">語</div>
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#C84B31] dark:text-[#E85C40]">JLPT {label}</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#FAFAFA]">{label} Vocabulary</h2>
          <p className="mt-4 text-[#6B6B6B] dark:text-[#A0A0A0]">{staticVocab.length} words available. Click a status to cycle: unlearned → reviewing → mastered.</p>
        </div>
      </section>

      {staticVocab.length > 0 ? (
        <VocabTable words={staticVocab} progressMap={progressMap} />
      ) : (
        <div className="rounded-3xl border border-black/10 bg-white p-12 text-center text-[#6B6B6B] dark:border-white/20 dark:bg-[#1A1A1A] dark:text-[#A0A0A0]">
          Vocabulary data for {label} is not yet available. N5 content is ready — try /n5/vocabulary.
        </div>
      )}
    </div>
  );
}
