import { ParticlePickerEngine } from "@/components/practice/particles/ParticlePickerEngine";

export const metadata = {
  title: "Particle Picker | NihoLearn",
  description: "Master Japanese particles (は, が, を, に, で, へ, と, から) with real contextual sentence drills.",
};

export default function ParticlePickerPage() {
  return <ParticlePickerEngine />;
}
