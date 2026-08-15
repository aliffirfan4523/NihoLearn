import { DailyChallengeEngine } from "@/components/practice/daily/DailyChallengeEngine";

export const metadata = {
  title: "Daily Challenge Dojo | NihoLearn",
  description: "10-question daily challenge combining Kanji, Vocabulary, Grammar, and Listening with daily streak rewards.",
};

export default function DailyChallengePage() {
  return <DailyChallengeEngine />;
}
