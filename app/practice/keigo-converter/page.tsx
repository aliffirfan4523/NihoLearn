import { KeigoConverterEngine } from "@/components/practice/keigo-converter/KeigoConverterEngine";

export const metadata = {
  title: "Keigo & Politeness Converter | NihoLearn",
  description: "Master Japanese business honorifics (Sonkeigo) and humble forms (Kenjougo) with conversion drills and interactive reference matrix.",
};

export default function KeigoConverterPage() {
  return <KeigoConverterEngine />;
}
