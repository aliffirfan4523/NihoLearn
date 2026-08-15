import { ReverseTranslationEngine } from "@/components/practice/reverse-translation/ReverseTranslationEngine";

export const metadata = {
  title: "Reverse Translation Recall Practice | NihoLearn",
  description: "Recall and produce Japanese vocabulary from English definitions with multiple choice and typing recall modes.",
};

export default function ReverseTranslationPage() {
  return <ReverseTranslationEngine />;
}
