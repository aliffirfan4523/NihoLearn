import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const [
    kanaTotal,
    kanaMastered,
    vocabN5Total,
    vocabN5Mastered,
    kanjiN5Total,
    kanjiN5Mastered,
    grammarN5Total,
    grammarN5Mastered,
    totalSessions,
    totalMinutes,
    recentSessions,
  ] = await Promise.all([
    prisma.kanaProgress.count(),
    prisma.kanaProgress.count({ where: { status: "mastered" } }),
    prisma.vocabProgress.count({ where: { level: "N5" } }),
    prisma.vocabProgress.count({ where: { level: "N5", status: "mastered" } }),
    prisma.kanjiProgress.count({ where: { level: "N5" } }),
    prisma.kanjiProgress.count({ where: { level: "N5", status: "mastered" } }),
    prisma.grammarProgress.count({ where: { level: "N5" } }),
    prisma.grammarProgress.count({ where: { level: "N5", status: "mastered" } }),
    prisma.studySession.count(),
    prisma.studySession.aggregate({ _sum: { durationMinutes: true } }),
    prisma.studySession.findMany({ orderBy: { date: "desc" }, take: 5 }),
  ]);

  const kanaPercent = kanaTotal > 0 ? Math.round((kanaMastered / kanaTotal) * 100) : 0;

  const stats = [
    { label: "Kana Mastered", value: `${kanaMastered}/${kanaTotal}`, sub: `${kanaPercent}% complete`, color: "#C84B31" },
    { label: "N5 Vocabulary", value: `${vocabN5Mastered}/${vocabN5Total}`, sub: "words mastered", color: "#2D5F8A" },
    { label: "N5 Kanji", value: `${kanjiN5Mastered}/${kanjiN5Total}`, sub: "kanji mastered", color: "#3D7D52" },
    { label: "Study Time", value: `${totalMinutes._sum.durationMinutes ?? 0}`, sub: `min across ${totalSessions} sessions`, color: "#6B6B6B" },
  ];

  const levelCards = [
    { level: "N5", href: "/n5", vocab: { mastered: vocabN5Mastered, total: vocabN5Total }, kanji: { mastered: kanjiN5Mastered, total: kanjiN5Total }, grammar: { mastered: grammarN5Mastered, total: grammarN5Total } },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <div className="pointer-events-none absolute -right-6 -top-12 font-serif text-[12rem] leading-none text-[#C84B31]/5">日本</div>
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#C84B31]">Dashboard</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#1A1A1A]">Welcome back</h2>
          <p className="mt-4 text-[#6B6B6B]">Your Japanese learning progress at a glance.</p>
        </div>
      </section>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-[#6B6B6B]">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="mt-1 text-xs text-[#6B6B6B]">{stat.sub}</p>
          </div>
        ))}
      </div>

      <section>
        <h3 className="mb-4 text-xl font-bold text-[#1A1A1A]">JLPT Level Progress</h3>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {levelCards.map((card) => {
            const vocabPct = card.vocab.total > 0 ? Math.round((card.vocab.mastered / card.vocab.total) * 100) : 0;
            const kanjiPct = card.kanji.total > 0 ? Math.round((card.kanji.mastered / card.kanji.total) * 100) : 0;
            const grammarPct = card.grammar.total > 0 ? Math.round((card.grammar.mastered / card.grammar.total) * 100) : 0;

            return (
              <Link key={card.level} href={card.href} className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#C84B31]">
                <h4 className="text-2xl font-bold text-[#2D5F8A]">{card.level}</h4>
                <div className="mt-4 space-y-3">
                  {[
                    { label: "Vocab", pct: vocabPct, mastered: card.vocab.mastered, total: card.vocab.total },
                    { label: "Kanji", pct: kanjiPct, mastered: card.kanji.mastered, total: card.kanji.total },
                    { label: "Grammar", pct: grammarPct, mastered: card.grammar.mastered, total: card.grammar.total },
                  ].map((row) => (
                    <div key={row.label}>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B6B6B]">{row.label}</span>
                        <span className="font-semibold text-[#1A1A1A]">{row.mastered}/{row.total}</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#F0F0F0]">
                        <div className="h-full rounded-full bg-[#3D7D52]" style={{ width: `${row.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-xl font-bold text-[#1A1A1A]">Recent Sessions</h3>
        {recentSessions.length === 0 ? (
          <div className="rounded-3xl border border-black/10 bg-white p-8 text-center text-[#6B6B6B]">
            No sessions yet. <Link href="/sessions/new" className="font-semibold text-[#C84B31] hover:underline">Log your first session</Link>.
          </div>
        ) : (
          <div className="space-y-3">
            {recentSessions.map((s) => {
              const activities: string[] = JSON.parse(s.activities);
              return (
                <div key={s.id} className="flex items-center gap-4 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                  <span className="rounded-full bg-[#FAFAF8] px-3 py-1 text-sm font-bold text-[#2D5F8A]">{s.level}</span>
                  <span className="text-sm text-[#1A1A1A]">{new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  <span className="text-sm text-[#6B6B6B]">{s.durationMinutes} min</span>
                  <div className="ml-auto flex gap-2">
                    {activities.map((a) => (
                      <span key={a} className="rounded-full border border-black/10 px-2 py-0.5 text-xs capitalize text-[#6B6B6B]">{a}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
