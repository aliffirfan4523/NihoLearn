import { KanjiQuiz } from "@/components/practice/KanjiQuiz";

export const metadata = {
  title: "Kanji Practice | NihoLearn",
  description: "Practice JLPT Kanji recognition, meaning, and readings.",
};

export default function KanjiPracticePage() {
  return <KanjiQuiz />;
}
