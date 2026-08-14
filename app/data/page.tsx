import { KanaDataEditor } from "@/components/data/KanaDataEditor";
import { prisma } from "@/lib/db";
import type { KanaCharacter } from "@/types";

export default async function DataPage() {
  const kana = (await prisma.kanaProgress.findMany({
    orderBy: [{ type: "asc" }, { row: "asc" }, { id: "asc" }],
  })) as KanaCharacter[];

  return <KanaDataEditor initialKana={kana} />;
}
