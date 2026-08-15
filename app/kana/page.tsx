import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export default async function KanaPage() {
  const user = await requireUser();

  const [hiraganaTotal, katakanaTotal, hiraganaMastered, katakanaMastered] = await Promise.all([
    prisma.kana.count({ where: { type: "hiragana" } }),
    prisma.kana.count({ where: { type: "katakana" } }),
    prisma.kanaProgress.count({ where: { userId: user.id, kana: { type: "hiragana" }, status: "mastered" } }),
    prisma.kanaProgress.count({ where: { userId: user.id, kana: { type: "katakana" }, status: "mastered" } }),
  ]);

  const cards = [
    { title: "Hiragana", href: "/kana/hiragana", mastered: hiraganaMastered, total: hiraganaTotal, mark: "あ" },
    { title: "Katakana", href: "/kana/katakana", mastered: katakanaMastered, total: katakanaTotal, mark: "ア" },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/20 dark:bg-[#1A1A1A]">
        <div className="pointer-events-none absolute -right-6 -top-12 font-serif text-[12rem] leading-none text-[#C84B31]/5 dark:text-[#C84B31]/10">かな</div>
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#C84B31] dark:text-[#E85C40]">Supabase connected</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#FAFAFA]">Kana</h2>
          <p className="mt-4 text-[#6B6B6B] dark:text-[#A0A0A0]">Choose a kana system. Your progress is tracked per account.</p>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        {cards.map((card) => {
          const percent = card.total === 0 ? 0 : Math.round((card.mastered / card.total) * 100);

          return (
            <Link key={card.href} href={card.href} className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-[#C84B31] dark:border-white/20 dark:bg-[#1A1A1A] dark:hover:border-[#E85C40]">
              <div className="pointer-events-none absolute -right-5 -top-10 font-serif text-[12rem] leading-none text-[#C84B31]/5 dark:text-[#C84B31]/10">{card.mark}</div>
              <div className="relative">
                <h3 className="text-2xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">{card.title}</h3>
                <p className="mt-2 text-[#6B6B6B] dark:text-[#A0A0A0]">{card.mastered}/{card.total} mastered</p>
                <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#F0F0F0] dark:bg-[#2A2A2A]">
                  <div className="h-full rounded-full bg-[#C84B31] dark:bg-[#E85C40]" style={{ width: `${percent}%` }} />
                </div>
                <p className="mt-3 text-sm font-semibold text-[#2D5F8A] dark:text-[#4A86B8]">{percent}% complete</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
