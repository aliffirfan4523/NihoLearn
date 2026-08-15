import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { calculateUserStreakAndStats } from "@/lib/stats-calc";

export async function GET() {
  try {
    const user = await requireUser();

    const [
      kanaTotal,
      kanaMastered,
      vocabN5Total,
      vocabN5Mastered,
      kanjiN5Total,
      kanjiN5Mastered,
      grammarN5Total,
      grammarN5Mastered,
      allSessions,
    ] = await Promise.all([
      prisma.kanaProgress.count({ where: { userId: user.id } }),
      prisma.kanaProgress.count({ where: { userId: user.id, status: "mastered" } }),
      prisma.vocabProgress.count({ where: { userId: user.id, level: "N5" } }),
      prisma.vocabProgress.count({ where: { userId: user.id, level: "N5", status: "mastered" } }),
      prisma.kanjiProgress.count({ where: { userId: user.id, level: "N5" } }),
      prisma.kanjiProgress.count({ where: { userId: user.id, level: "N5", status: "mastered" } }),
      prisma.grammarProgress.count({ where: { userId: user.id, level: "N5" } }),
      prisma.grammarProgress.count({ where: { userId: user.id, level: "N5", status: "mastered" } }),
      prisma.studySession.findMany({ where: { userId: user.id }, orderBy: { date: "desc" } }),
    ]);

    const userStats = calculateUserStreakAndStats(allSessions, kanaMastered);

    return NextResponse.json({
      data: {
        kana: { total: kanaTotal, mastered: kanaMastered },
        n5: {
          vocab: { total: vocabN5Total, mastered: vocabN5Mastered },
          kanji: { total: kanjiN5Total, mastered: kanjiN5Mastered },
          grammar: { total: grammarN5Total, mastered: grammarN5Mastered },
        },
        streak: userStats.streak,
        totalSessions: userStats.totalSessions,
        totalMinutes: userStats.totalStudiedMinutes,
        kanaReviews: userStats.kanaReviews,
        kanaAttempts: userStats.kanaAttempts,
        kanaAnswers: userStats.kanaAnswers,
        kanaAccuracy: userStats.kanaAccuracy,
        recentSessions: allSessions.slice(0, 5),
      },
      error: null,
    });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to load stats." }, { status: 500 });
  }
}
