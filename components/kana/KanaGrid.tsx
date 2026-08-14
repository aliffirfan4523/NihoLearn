import { KanaCard } from "@/components/kana/KanaCard";
import type { KanaCharacter } from "@/types";

const rowOrder = ["a", "ka", "sa", "ta", "na", "ha", "ma", "ya", "ra", "wa", "n"];

export function KanaGrid({ kana }: { kana: KanaCharacter[] }) {
  const rows = rowOrder
    .map((row) => ({ row, items: kana.filter((item) => item.row === row) }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="space-y-6">
      {rows.map((group) => (
        <section key={group.row} className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#C84B31]">{group.row} row</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-6">
            {group.items.map((item) => (
              <KanaCard key={item.id} kana={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
