import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import type { ProgressStatus } from "@/types";

const statuses: ProgressStatus[] = ["unlearned", "reviewing", "mastered"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
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

    // If a status is provided, update the user's progress for this kana.
    if (body.status) {
      await prisma.kanaProgress.upsert({
        where: { userId_kanaId: { userId: user.id, kanaId: id } },
        update: {
          status: body.status,
          masteredAt: body.status === "mastered" ? new Date() : null,
        },
        create: {
          userId: user.id,
          kanaId: id,
          status: body.status,
          masteredAt: body.status === "mastered" ? new Date() : null,
        },
      });
    }

    // Update reference character fields (character/romaji/type/row are shared).
    const data = await prisma.kana.update({
      where: { id },
      data: {
        character: body.character,
        type: body.type,
        romaji: body.romaji,
        row: body.row,
      },
    });

    return NextResponse.json({ data, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to update kana row." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    // Delete the user's progress for this kana (not the shared reference).
    await prisma.kanaProgress.deleteMany({ where: { userId: user.id, kanaId: id } });
    return NextResponse.json({ data: null, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to delete kana progress." }, { status: 500 });
  }
}
