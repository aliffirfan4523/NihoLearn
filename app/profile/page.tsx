import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { UserProfileView } from "@/components/profile/UserProfileView";
import { calculateUserStreakAndStats } from "@/lib/stats-calc";

export const metadata = {
  title: "User Profile | NihoLearn",
  description: "View your Japanese learning statistics, study activity calendar, and JLPT progress breakdown.",
};

export default async function ProfilePage() {
  const user = await requireUser();

  const [kanaCount, vocabCount, kanjiCount, grammarCount, allSessions] = await Promise.all([
    prisma.kanaProgress.count({ where: { userId: user.id } }),
    prisma.vocabProgress.count({ where: { userId: user.id } }),
    prisma.kanjiProgress.count({ where: { userId: user.id } }),
    prisma.grammarProgress.count({ where: { userId: user.id } }),
    prisma.studySession.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    }),
  ]);

  const userStats = calculateUserStreakAndStats(allSessions, kanaCount);

  return (
    <UserProfileView
      user={user}
      stats={{
        kanaCount: userStats.kanaReviews,
        vocabCount,
        kanjiCount,
        grammarCount,
        sessionCount: userStats.totalSessions,
        totalMinutes: userStats.totalStudiedMinutes,
        streak: userStats.streak,
      }}
    />
  );
}
