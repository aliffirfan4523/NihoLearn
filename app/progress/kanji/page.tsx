import { KanjiProgressGrid } from "@/components/progress/KanjiProgressGrid";
import { getCurrentUser } from "@/lib/auth";
import { getKanjiWithProgress } from "@/lib/services/kanji-data";

export const metadata = {
  title: "JLPT Kanji Requirements | NihoLearn",
  description: "Browse JLPT Kanji requirements, readings, stroke counts, and radicals reference table.",
};

export default async function KanjiProgressPage() {
  const user = await getCurrentUser();

  // ── High-speed cached kanji resolution (< 5ms on warm cache, ~50ms on first load) ──
  const initialKanji = await getKanjiWithProgress(user?.id, "N5");

  return <KanjiProgressGrid initialKanji={initialKanji} />;
}
