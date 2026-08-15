import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import type { ProgressStatus } from "@/types";

const statuses: ProgressStatus[] = ["unlearned", "reviewing", "mastered"];

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const level = request.nextUrl.searchParams.get("level");
    const status = request.nextUrl.searchParams.get("status");

    const progress = await prisma.vocabProgress.findMany({
      where: {
        userId: user.id,
        ...(level ? { level } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: [{ level: "asc" }, { wordId: "asc" }],
    });

    return NextResponse.json({ data: progress, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to load vocab." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = (await request.json()) as {
      wordId?: string;
      level?: string;
      status?: ProgressStatus;
      notes?: string;
      batch?: Array<{ wordId: string; level: string; status: ProgressStatus; notes?: string }>;
    };

    if (body.batch && Array.isArray(body.batch)) {
      const updates = body.batch.filter((item) => item.wordId && item.level && statuses.includes(item.status));
      await Promise.all(
        updates.map((item) =>
          prisma.vocabProgress.upsert({
            where: { userId_wordId: { userId: user.id, wordId: item.wordId } },
            update: {
              level: item.level,
              status: item.status,
              notes: item.notes,
              masteredAt: item.status === "mastered" ? new Date() : null,
            },
            create: {
              userId: user.id,
              wordId: item.wordId,
              level: item.level,
              status: item.status,
              notes: item.notes,
              masteredAt: item.status === "mastered" ? new Date() : null,
            },
          })
        )
      );

      return NextResponse.json({ success: true, updatedCount: updates.length, error: null });
    }

    if (!body.wordId || !body.level || !body.status || !statuses.includes(body.status)) {
      return NextResponse.json({ data: null, error: "Invalid vocab update." }, { status: 400 });
    }

    const data = await prisma.vocabProgress.upsert({
      where: { userId_wordId: { userId: user.id, wordId: body.wordId } },
      update: {
        level: body.level,
        status: body.status,
        notes: body.notes,
        masteredAt: body.status === "mastered" ? new Date() : null,
      },
      create: {
        userId: user.id,
        wordId: body.wordId,
        level: body.level,
        status: body.status,
        notes: body.notes,
        masteredAt: body.status === "mastered" ? new Date() : null,
      },
    });

    return NextResponse.json({ data, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to update vocab." }, { status: 500 });
  }
}
