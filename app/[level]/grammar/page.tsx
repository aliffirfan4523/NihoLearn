import { GrammarList } from "@/components/grammar/GrammarList";
import { prisma } from "@/lib/db";
import { n5Grammar } from "@/lib/data/n5-grammar";
import { formatLevel, jlptLevels } from "@/lib/routes";
import { notFound } from "next/navigation";
import type { GrammarPoint, ProgressStatus } from "@/types";

export default async function GrammarPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  if (!jlptLevels.includes(level as never)) notFound();

  const label = formatLevel(level);
  const staticGrammar: GrammarPoint[] = level === "n5" ? n5Grammar : [];

  const progress = await prisma.grammarProgress.findMany({ where: { level: label } });
  const progressMap: Record<string, ProgressStatus> = {};
  for (const p of progress) {
    progressMap[p.grammarId] = p.status as ProgressStatus;
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <div className="pointer-events-none absolute -right-6 -top-12 font-serif text-[12rem] leading-none text-[#C84B31]/5">文</div>
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#C84B31]">JLPT {label}</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#1A1A1A]">{label} Grammar</h2>
          <p className="mt-4 text-[#6B6B6B]">{staticGrammar.length} grammar points. Click to expand examples and cycle status.</p>
        </div>
      </section>

      {staticGrammar.length > 0 ? (
        <GrammarList points={staticGrammar} progressMap={progressMap} />
      ) : (
        <div className="rounded-3xl border border-black/10 bg-white p-12 text-center text-[#6B6B6B]">
          Grammar data for {label} is not yet available. N5 content is ready — try /n5/grammar.
        </div>
      )}
    </div>
  );
}
