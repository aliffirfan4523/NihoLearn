import { VocabClozeEngine } from "@/components/practice/vocab-cloze/VocabClozeEngine";

export const metadata = {
  title: "Word Fill-in-the-Blank Cloze Drill | NihoLearn",
  description: "Read authentic Japanese context sentences and identify the missing vocabulary word from contextual clues with audio drills.",
};

export default function VocabClozePage() {
  return <VocabClozeEngine />;
}
