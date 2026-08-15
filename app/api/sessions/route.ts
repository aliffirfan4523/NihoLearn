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
      activities?: string[] | string;
      wordsReviewed?: number;
      kanjiReviewed?: number;
      notes?: string;
    };

    const duration = Math.max(1, Math.round(body.durationMinutes || 1));
    const level = body.level || "N5";
    const activitiesArray = Array.isArray(body.activities)
      ? body.activities
      : typeof body.activities === "string"
      ? [body.activities]
      : ["general"];

    const data = await prisma.studySession.create({
      data: {
        userId: user.id,
        date: body.date ? new Date(body.date) : new Date(),
        durationMinutes: duration,
        level: level,
        activities: JSON.stringify(activitiesArray),
        wordsReviewed: body.wordsReviewed || 0,
        kanjiReviewed: body.kanjiReviewed || 0,
        notes: typeof body.notes === "object" ? JSON.stringify(body.notes) : body.notes || null,
      },
    });

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error("Failed to create study session:", error);
    return NextResponse.json({ data: null, error: "Failed to create session." }, { status: 500 });
  }
}
