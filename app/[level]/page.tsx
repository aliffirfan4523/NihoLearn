import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatLevel, jlptLevels } from "@/lib/routes";
import { notFound } from "next/navigation";

export default async function LevelOverviewPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;

  if (!jlptLevels.includes(level as never)) {
    notFound();
  }

  const label = formatLevel(level);

  const [vocabTotal, vocabMastered, kanjiTotal, kanjiMastered, grammarTotal, grammarMastered] = await Promise.all([
    prisma.vocabProgress.count({ where: { level: label } }),
    prisma.vocabProgress.count({ where: { level: label, status: "mastered" } }),
    prisma.kanjiProgress.count({ where: { level: label } }),
    prisma.kanjiProgress.count({ where: { level: label, status: "mastered" } }),
    prisma.grammarProgress.count({ where: { level: label } }),
    prisma.grammarProgress.count({ where: { level: label, status: "mastered" } }),
  ]);

  const cards = [
    { title: "Vocabulary", href: `/${level}/vocabulary`, total: vocabTotal, mastered: vocabMastered, mark: "語" },
    { title: "Kanji", href: `/${level}/kanji`, total: kanjiTotal, mastered: kanjiMastered, mark: "漢" },
    { title: "Grammar", href: `/${level}/grammar`, total: grammarTotal, mastered: grammarMastered, mark: "文" },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <div className="pointer-events-none absolute -right-6 -top-12 font-serif text-[12rem] leading-none text-[#C84B31]/5">{label}</div>
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#C84B31]">JLPT level</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#1A1A1A]">{label} Overview</h2>
          <p className="mt-4 text-[#6B6B6B]">Track your {label} progress across vocabulary, kanji, and grammar.</p>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((card) => {
          const percent = card.total === 0 ? 0 : Math.round((card.mastered / card.total) * 100);
          return (
            <Link key={card.href} href={card.href} className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#C84B31]">
              <div className="pointer-events-none absolute -right-4 -top-8 font-serif text-[6rem] leading-none text-[#C84B31]/5">{card.mark}</div>
              <div className="relative">
                <h3 className="text-xl font-bold text-[#1A1A1A]">{card.title}</h3>
                <p className="mt-1 text-sm text-[#6B6B6B]">{card.mastered}/{card.total} mastered</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#F0F0F0]">
                  <div className="h-full rounded-full bg-[#3D7D52]" style={{ width: `${percent}%` }} />
                </div>
                <p className="mt-2 text-sm font-semibold text-[#2D5F8A]">{percent}%</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
