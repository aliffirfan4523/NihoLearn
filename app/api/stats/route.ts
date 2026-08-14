import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [
      kanaTotal,
      kanaMastered,
      vocabN5Total,
      vocabN5Mastered,
      kanjiN5Total,
      kanjiN5Mastered,
      grammarN5Total,
      grammarN5Mastered,
      totalSessions,
      totalMinutes,
      recentSessions,
    ] = await Promise.all([
      prisma.kanaProgress.count(),
      prisma.kanaProgress.count({ where: { status: "mastered" } }),
      prisma.vocabProgress.count({ where: { level: "N5" } }),
      prisma.vocabProgress.count({ where: { level: "N5", status: "mastered" } }),
      prisma.kanjiProgress.count({ where: { level: "N5" } }),
      prisma.kanjiProgress.count({ where: { level: "N5", status: "mastered" } }),
      prisma.grammarProgress.count({ where: { level: "N5" } }),
      prisma.grammarProgress.count({ where: { level: "N5", status: "mastered" } }),
      prisma.studySession.count(),
      prisma.studySession.aggregate({ _sum: { durationMinutes: true } }),
      prisma.studySession.findMany({ orderBy: { date: "desc" }, take: 5 }),
    ]);

    return NextResponse.json({
      data: {
        kana: { total: kanaTotal, mastered: kanaMastered },
        n5: {
          vocab: { total: vocabN5Total, mastered: vocabN5Mastered },
          kanji: { total: kanjiN5Total, mastered: kanjiN5Mastered },
          grammar: { total: grammarN5Total, mastered: grammarN5Mastered },
        },
        totalSessions,
        totalMinutes: totalMinutes._sum.durationMinutes ?? 0,
        recentSessions,
      },
      error: null,
    });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to load stats." }, { status: 500 });
  }
}
