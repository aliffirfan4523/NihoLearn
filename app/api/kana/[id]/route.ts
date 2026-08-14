import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { ProgressStatus } from "@/types";

const statuses: ProgressStatus[] = ["unlearned", "reviewing", "mastered"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Partial<{
      character: string;
      type: string;
      romaji: string;
      row: string;
      status: ProgressStatus;
    }>;

    if (body.status && !statuses.includes(body.status)) {
      return NextResponse.json({ data: null, error: "Invalid status." }, { status: 400 });
    }

    const data = await prisma.kanaProgress.update({
      where: { id },
      data: {
        character: body.character,
        type: body.type,
        romaji: body.romaji,
        row: body.row,
        status: body.status,
        masteredAt: body.status === "mastered" ? new Date() : body.status ? null : undefined,
      },
    });

    return NextResponse.json({ data, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to update kana row." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await prisma.kanaProgress.delete({ where: { id } });
    return NextResponse.json({ data, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to delete kana row." }, { status: 500 });
  }
}
