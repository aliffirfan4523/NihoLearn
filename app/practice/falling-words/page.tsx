import { FallingWordsEngine } from "@/components/practice/falling-words/FallingWordsEngine";

export const metadata = {
  title: "Falling Words Arcade | NihoLearn",
  description: "Fast-paced Japanese typing arcade game: blast falling words with kana, romaji, or meanings before they reach the ground!",
};

export default function FallingWordsPage() {
  return <FallingWordsEngine />;
}
