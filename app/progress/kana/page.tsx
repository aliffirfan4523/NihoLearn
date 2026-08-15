import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { KanaProgressView, type KanaProgressStats } from "@/components/progress/KanaProgressView";
import { hiraganaSeed } from "@/lib/data/hiragana";
import { katakanaSeed } from "@/lib/data/katakana";

export const metadata = {
  title: "Kana Progress | NihoLearn",
  description: "Hiragana and Katakana row breakdown, accuracy overview, and mastery tracker.",
};

export default async function KanaProgressPage() {
  const user = await requireUser();

  const [allProgress, recentSessions] = await Promise.all([
    prisma.kanaProgress.findMany({
      where: { userId: user.id },
    }),
    prisma.studySession.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 10,
    }),
  ]);

  const masteredRows = allProgress.filter((p) => p.status === "mastered");
  const reviewingRows = allProgress.filter((p) => p.status === "reviewing");

  const masteredIdSet = masteredRows.map((p) => p.kanaId);

  const basicHiraIds = new Set(hiraganaSeed.slice(0, 46).map((k) => k.id));
  const dakutenHiraIds = new Set(hiraganaSeed.slice(46, 71).map((k) => k.id));
  const combiHiraIds = new Set(hiraganaSeed.slice(71).map((k) => k.id));

  const basicKataIds = new Set(katakanaSeed.slice(0, 46).map((k) => k.id));
  const dakutenKataIds = new Set(katakanaSeed.slice(46, 71).map((k) => k.id));
  const combiKataIds = new Set(katakanaSeed.slice(71).map((k) => k.id));

  let basicHiraCount = 0;
  let dakutenHiraCount = 0;
  let combiHiraCount = 0;

  let basicKataCount = 0;
  let dakutenKataCount = 0;
  let combiKataCount = 0;

  for (const id of masteredIdSet) {
    if (basicHiraIds.has(id)) basicHiraCount++;
    else if (dakutenHiraIds.has(id)) dakutenHiraCount++;
    else if (combiHiraIds.has(id)) combiHiraCount++;
    else if (basicKataIds.has(id)) basicKataCount++;
    else if (dakutenKataIds.has(id)) dakutenKataCount++;
    else if (combiKataIds.has(id)) combiKataCount++;
  }

  // Aggregate struggle items from reviewing rows and recent session notes
  const allKanaMap = new Map(
    [...hiraganaSeed, ...katakanaSeed].map((k) => [k.id, k])
  );

  const struggleMap = new Map<string, { id: string; character: string; romaji: string }>();

  // 1. From KanaProgress reviewing status
  for (const r of reviewingRows) {
    const k = allKanaMap.get(r.kanaId);
    if (k && !masteredIdSet.includes(k.id)) {
      struggleMap.set(k.id, { id: k.id, character: k.character, romaji: k.romaji });
    }
  }

  // 2. From recent sessions notes
  for (const s of recentSessions) {
    if (s.notes) {
      try {
        const parsed = JSON.parse(s.notes);
        if (parsed.struggles && Array.isArray(parsed.struggles)) {
          for (const item of parsed.struggles) {
            if (item.kanaId && !masteredIdSet.includes(item.kanaId)) {
              struggleMap.set(item.kanaId, {
                id: item.kanaId,
                character: item.character ?? item.kanaId,
                romaji: item.romaji ?? "",
              });
            }
          }
        }
      } catch {}
    }
  }

  const struggles = Array.from(struggleMap.values());

  const stats: KanaProgressStats = {
    basicHiraCount,
    dakutenHiraCount,
    combiHiraCount,
    basicKataCount,
    dakutenKataCount,
    combiKataCount,
    totalMastered: masteredIdSet.length,
    totalKana: hiraganaSeed.length + katakanaSeed.length,
    masteredIdSet,
    struggles,
  };

  return <KanaProgressView stats={stats} />;
}
