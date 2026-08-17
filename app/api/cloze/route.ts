import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireUser();
    const levelParam = request.nextUrl.searchParams.get("level")?.toUpperCase();

    const rows = await prisma.clozeExercise.findMany({
      where: levelParam && levelParam !== "ALL" ? { level: levelParam } : undefined,
      orderBy: { id: "asc" },
    });

    const data = rows.map((r) => ({
      id: r.id,
      level: r.level,
      sentenceWithBlank: r.sentenceWithBlank,
      fullSentence: r.fullSentence,
      reading: r.reading,
      englishTranslation: r.englishTranslation,
      hint: r.hint,
      targetWord: JSON.parse(r.targetWord) as { word: string; reading: string; meaning: string },
      distractors: JSON.parse(r.distractors) as Array<{ word: string; reading: string; meaning: string }>,
    }));

    return NextResponse.json({ data, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to load cloze exercises." }, { status: 500 });
  }
}
