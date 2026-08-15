import { ShiritoriEngine } from "@/components/practice/shiritori/ShiritoriEngine";

export const metadata = {
  title: "Shiritori Word Chain | NihoLearn",
  description: "Play the traditional Japanese word chain game against AI Sensei. Enforce the classic 'ん' rule and expand your vocabulary!",
};

export default function ShiritoriPracticePage() {
  return <ShiritoriEngine />;
}
