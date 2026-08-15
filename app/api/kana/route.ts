import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import type { ProgressStatus } from "@/types";

const statuses: ProgressStatus[] = ["unlearned", "reviewing", "mastered"];

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const type = request.nextUrl.searchParams.get("type");

    // Read the shared Kana reference joined with the user's progress.
    const kana = await prisma.kana.findMany({
      where: type ? { type } : undefined,
      orderBy: [{ type: "asc" }, { row: "asc" }, { id: "asc" }],
      include: {
        progress: {
          where: { userId: user.id },
          select: { id: true, status: true },
        },
      },
    });

    const data = kana.map((k) => ({
      id: k.id,
      type: k.type,
      character: k.character,
      romaji: k.romaji,
      row: k.row,
      status: (k.progress[0]?.status ?? "unlearned") as ProgressStatus,
      progressId: k.progress[0]?.id ?? null,
    }));

    return NextResponse.json({ data, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to load kana." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = (await request.json()) as {
      kanaId?: string;
      status?: ProgressStatus;
      batch?: Array<{ kanaId: string; status: ProgressStatus }>;
    };

    // Handle batch update
    if (body.batch && Array.isArray(body.batch)) {
      const updates = body.batch.filter((item) => item.kanaId && statuses.includes(item.status));
      await Promise.all(
        updates.map((item) =>
          prisma.kanaProgress.upsert({
            where: { userId_kanaId: { userId: user.id, kanaId: item.kanaId } },
            update: {
              status: item.status,
              masteredAt: item.status === "mastered" ? new Date() : null,
            },
            create: {
              userId: user.id,
              kanaId: item.kanaId,
              status: item.status,
              masteredAt: item.status === "mastered" ? new Date() : null,
            },
          })
        )
      );

      return NextResponse.json({ success: true, updatedCount: updates.length, error: null });
    }

    // Handle single update
    if (!body.kanaId || !body.status || !statuses.includes(body.status)) {
      return NextResponse.json({ data: null, error: "Invalid kana status update." }, { status: 400 });
    }

    const data = await prisma.kanaProgress.upsert({
      where: { userId_kanaId: { userId: user.id, kanaId: body.kanaId } },
      update: {
        status: body.status,
        masteredAt: body.status === "mastered" ? new Date() : null,
      },
      create: {
        userId: user.id,
        kanaId: body.kanaId,
        status: body.status,
        masteredAt: body.status === "mastered" ? new Date() : null,
      },
    });

    return NextResponse.json({ data, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to update kana." }, { status: 500 });
  }
}
