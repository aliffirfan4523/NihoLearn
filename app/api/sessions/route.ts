import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireUser();
    const sessions = await prisma.studySession.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ data: sessions, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to load sessions." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = (await request.json()) as {
      date?: string;
      durationMinutes?: number;
      level?: string;
      activities?: string[];
      wordsReviewed?: number;
      kanjiReviewed?: number;
      notes?: string;
    };

    if (!body.durationMinutes || !body.level || !body.activities) {
      return NextResponse.json({ data: null, error: "Invalid session data." }, { status: 400 });
    }

    const data = await prisma.studySession.create({
      data: {
        userId: user.id,
        date: body.date ? new Date(body.date) : new Date(),
        durationMinutes: body.durationMinutes,
        level: body.level,
        activities: JSON.stringify(body.activities),
        wordsReviewed: body.wordsReviewed,
        kanjiReviewed: body.kanjiReviewed,
        notes: body.notes,
      },
    });

    return NextResponse.json({ data, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to create session." }, { status: 500 });
  }
}
