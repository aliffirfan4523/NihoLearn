import { SentenceScrambleEngine } from "@/components/practice/sentence-scramble/SentenceScrambleEngine";

export const metadata = {
  title: "Sentence Scramble | NihoLearn",
  description: "Arrange scrambled Japanese word tiles into grammatically correct SOV word order with audio feedback.",
};

export default function SentenceScramblePage() {
  return <SentenceScrambleEngine />;
}
