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

    const progress = await prisma.grammarProgress.findMany({
      where: {
        userId: user.id,
        ...(level ? { level } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: [{ level: "asc" }, { grammarId: "asc" }],
    });

    return NextResponse.json({ data: progress, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to load grammar." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = (await request.json()) as {
      grammarId?: string;
      level?: string;
      status?: ProgressStatus;
      notes?: string;
      batch?: Array<{ grammarId: string; level: string; status: ProgressStatus; notes?: string }>;
    };

    // Handle batch update
    if (body.batch && Array.isArray(body.batch)) {
      const updates = body.batch.filter((item) => item.grammarId && item.level && statuses.includes(item.status));
      await Promise.all(
        updates.map((item) =>
          prisma.grammarProgress.upsert({
            where: { userId_grammarId: { userId: user.id, grammarId: item.grammarId } },
            update: {
              level: item.level,
              status: item.status,
              notes: item.notes,
              masteredAt: item.status === "mastered" ? new Date() : null,
            },
            create: {
              userId: user.id,
              grammarId: item.grammarId,
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

    // Handle single update
    if (!body.grammarId || !body.level || !body.status || !statuses.includes(body.status)) {
      return NextResponse.json({ data: null, error: "Invalid grammar update." }, { status: 400 });
    }

    const data = await prisma.grammarProgress.upsert({
      where: { userId_grammarId: { userId: user.id, grammarId: body.grammarId } },
      update: {
        level: body.level,
        status: body.status,
        notes: body.notes,
        masteredAt: body.status === "mastered" ? new Date() : null,
      },
      create: {
        userId: user.id,
        grammarId: body.grammarId,
        level: body.level,
        status: body.status,
        notes: body.notes,
        masteredAt: body.status === "mastered" ? new Date() : null,
      },
    });

    return NextResponse.json({ data, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to update grammar." }, { status: 500 });
  }
}
