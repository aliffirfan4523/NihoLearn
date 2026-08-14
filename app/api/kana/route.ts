import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { ProgressStatus } from "@/types";

const statuses: ProgressStatus[] = ["unlearned", "reviewing", "mastered"];

export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get("type");

    const kana = await prisma.kanaProgress.findMany({
      where: type ? { type } : undefined,
      orderBy: [{ type: "asc" }, { row: "asc" }, { id: "asc" }],
    });

    return NextResponse.json({ data: kana, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to load kana." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { id?: string; status?: ProgressStatus };

    if (!body.id || !body.status || !statuses.includes(body.status)) {
      return NextResponse.json({ data: null, error: "Invalid kana status update." }, { status: 400 });
    }

    const kana = await prisma.kanaProgress.update({
      where: { id: body.id },
      data: {
        status: body.status,
        masteredAt: body.status === "mastered" ? new Date() : null,
      },
    });

    return NextResponse.json({ data: kana, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to update kana." }, { status: 500 });
  }
}
