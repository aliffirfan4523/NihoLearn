import { KanjiContextEngine } from "@/components/practice/kanji-context/KanjiContextEngine";

export const metadata = {
  title: "Kanji in Real-World Context | NihoLearn",
  description: "Deduce meanings, readings, and compound Jukugo structures from authentic Japanese signs, train announcements, and menus.",
};

export default function KanjiContextPage() {
  return <KanjiContextEngine />;
}
