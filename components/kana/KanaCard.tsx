import type { KanaCharacter } from "@/types";

const statusClasses = {
  unlearned: "border-black/10 bg-[#F4F4F0] text-[#1A1A1A] dark:border-white/15 dark:bg-[#1E232B] dark:text-[#F0F4F8]",
  reviewing: "border-amber-500/30 bg-amber-500/10 text-[#1A1A1A] dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-[#F0F4F8]",
  mastered: "border-[#3D7D52]/30 bg-[#3D7D52]/10 text-[#1A1A1A] dark:border-[#34D399]/40 dark:bg-[#34D399]/15 dark:text-[#F0F4F8]",
};

export function KanaCard({ kana }: { kana: KanaCharacter }) {
  return (
    <article className={`relative overflow-hidden rounded-2xl border p-4 text-center shadow-xs ${statusClasses[kana.status]}`}>
      <div className="pointer-events-none absolute -right-4 -top-6 font-serif text-8xl text-black/5 dark:text-white/10">{kana.character}</div>
      <div className="relative font-serif text-6xl font-bold leading-none">{kana.character}</div>
      <div className="relative mt-3 font-mono text-sm uppercase tracking-widest text-[#6B6B6B] dark:text-[#A0A0A0]">{kana.romaji}</div>
      <div className="relative mt-4 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold capitalize text-[#2D5F8A] dark:bg-[#161B22]/70 dark:text-[#60A5FA]">{kana.status}</div>
    </article>
  );
}
