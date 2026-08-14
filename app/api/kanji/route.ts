import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { ProgressStatus } from "@/types";

const statuses: ProgressStatus[] = ["unlearned", "reviewing", "mastered"];

export async function GET(request: NextRequest) {
  try {
    const level = request.nextUrl.searchParams.get("level");
    const status = request.nextUrl.searchParams.get("status");

    const progress = await prisma.kanjiProgress.findMany({
      where: {
        ...(level ? { level } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: [{ level: "asc" }, { kanjiId: "asc" }],
    });

    return NextResponse.json({ data: progress, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to load kanji." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { kanjiId?: string; level?: string; status?: ProgressStatus; notes?: string };

    if (!body.kanjiId || !body.level || !body.status || !statuses.includes(body.status)) {
      return NextResponse.json({ data: null, error: "Invalid kanji update." }, { status: 400 });
    }

    const data = await prisma.kanjiProgress.upsert({
      where: { kanjiId: body.kanjiId },
      update: {
        level: body.level,
        status: body.status,
        notes: body.notes,
        masteredAt: body.status === "mastered" ? new Date() : null,
      },
      create: {
        kanjiId: body.kanjiId,
        level: body.level,
        status: body.status,
        notes: body.notes,
        masteredAt: body.status === "mastered" ? new Date() : null,
      },
    });

    return NextResponse.json({ data, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to update kanji." }, { status: 500 });
  }
}
