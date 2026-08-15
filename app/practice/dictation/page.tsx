import { DictationEngine } from "@/components/practice/dictation/DictationEngine";

export const metadata = {
  title: "Japanese Audio Dictation | NihoLearn",
  description: "Listen to natural Japanese sentences at adjustable speeds and transcribe what you hear with character diff checking.",
};

export default function DictationPracticePage() {
  return <DictationEngine />;
}
