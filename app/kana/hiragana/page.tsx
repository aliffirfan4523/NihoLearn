import { KanaRowSections } from "@/components/kana/KanaRowSections";
import { prisma } from "@/lib/db";
import type { KanaCharacter, KanaType, ProgressStatus } from "@/types";

function toKanaCharacter(row: { id: string; type: string; character: string; romaji: string; row: string; status: string }): KanaCharacter {
  return {
    id: row.id,
    type: row.type as KanaType,
    character: row.character,
    romaji: row.romaji,
    row: row.row,
    status: row.status as ProgressStatus,
  };
}

export default async function HiraganaPage() {
  const rows = await prisma.kanaProgress.findMany({
    where: { type: "hiragana" },
    orderBy: [{ row: "asc" }, { id: "asc" }],
  });

  const kana = rows.map(toKanaCharacter);

  return <KanaRowSections kana={kana} type="hiragana" />;
}
