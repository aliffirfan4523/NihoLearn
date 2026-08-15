import { FuriganaDrillEngine } from "@/components/practice/furigana-drill/FuriganaDrillEngine";

export const metadata = {
  title: "Furigana Removal Reading Drill | NihoLearn",
  description: "Read graded Japanese stories with toggleable furigana stripping, interactive kanji recall prompts, and comprehension checks.",
};

export default function FuriganaDrillPage() {
  return <FuriganaDrillEngine />;
}
