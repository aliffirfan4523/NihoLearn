import type { KanaCharacter } from "@/types";

const statusClasses = {
  unlearned: "border-black/10 bg-[#F0F0F0] text-[#1A1A1A] dark:border-white/20 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]",
  reviewing: "border-yellow-300 bg-[#FFF3CD] text-[#1A1A1A] dark:border-yellow-500/50 dark:bg-[#332E00] dark:text-[#FAFAFA]",
  mastered: "border-green-300 bg-[#D4EDDA] text-[#1A1A1A] dark:border-green-500/50 dark:bg-[#0F2D1A] dark:text-[#FAFAFA]",
};

export function KanaCard({ kana }: { kana: KanaCharacter }) {
  return (
    <article className={`relative overflow-hidden rounded-2xl border p-5 text-center shadow-sm ${statusClasses[kana.status]}`}>
      <div className="pointer-events-none absolute -right-4 -top-6 font-serif text-8xl text-black/5 dark:text-white/10">{kana.character}</div>
      <div className="relative font-serif text-6xl font-bold leading-none">{kana.character}</div>
      <div className="relative mt-3 font-mono text-sm uppercase tracking-widest text-[#6B6B6B] dark:text-[#A0A0A0]">{kana.romaji}</div>
      <div className="relative mt-4 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold capitalize text-[#2D5F8A] dark:bg-[#2A2A2A]/70 dark:text-[#4A86B8]">{kana.status}</div>
    </article>
  );
}
