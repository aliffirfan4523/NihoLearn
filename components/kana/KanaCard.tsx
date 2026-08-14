import type { KanaCharacter } from "@/types";

const statusClasses = {
  unlearned: "border-black/10 bg-[#F0F0F0] text-[#1A1A1A]",
  reviewing: "border-yellow-300 bg-[#FFF3CD] text-[#1A1A1A]",
  mastered: "border-green-300 bg-[#D4EDDA] text-[#1A1A1A]",
};

export function KanaCard({ kana }: { kana: KanaCharacter }) {
  return (
    <article className={`relative overflow-hidden rounded-2xl border p-5 text-center shadow-sm ${statusClasses[kana.status]}`}>
      <div className="pointer-events-none absolute -right-4 -top-6 font-serif text-8xl text-black/5">{kana.character}</div>
      <div className="relative font-serif text-6xl font-bold leading-none">{kana.character}</div>
      <div className="relative mt-3 font-mono text-sm uppercase tracking-widest text-[#6B6B6B]">{kana.romaji}</div>
      <div className="relative mt-4 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold capitalize text-[#2D5F8A]">{kana.status}</div>
    </article>
  );
}
