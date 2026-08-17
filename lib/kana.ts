import { prisma } from "@/lib/db";
import type { KanaCharacter, ProgressStatus } from "@/types";

// Fetch the shared Kana reference joined with a user's progress,
// returning KanaCharacter objects for the UI.
export async function getUserKana(userId: string, type?: "hiragana" | "katakana"): Promise<KanaCharacter[]> {
  const kana = await prisma.kana.findMany({
    where: type ? { type } : undefined,
    orderBy: [{ type: "asc" }, { row: "asc" }, { id: "asc" }],
    include: {
      progress: {
        where: { userId },
        select: { id: true, status: true },
      },
    },
  });

  return kana.map((k) => ({
    id: k.id,
    type: k.type as KanaCharacter["type"],
    character: k.character,
    romaji: k.romaji,
    row: k.row,
    status: (k.progress[0]?.status ?? "unlearned") as ProgressStatus,
  }));
}
