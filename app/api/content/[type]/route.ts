import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { CONTENT_REGISTRY } from "@/lib/content-registry";

// GET /api/content/<type>?level=N5&category=kanji
// Serves every DB-backed practice content table (see lib/content-registry.ts).
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    await requireUser();
    const { type } = await params;
    const entry = CONTENT_REGISTRY[type];
    if (!entry) {
      return NextResponse.json({ data: null, error: "Unknown content type." }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const level = searchParams.get("level")?.toUpperCase();
    const category = searchParams.get("category")?.toLowerCase();

    const where: Record<string, string> = {};
    if (entry.hasLevel && level && level !== "ALL") where.level = level;
    if (entry.hasCategory && category && category !== "all") where.category = category;

    const orderBy = entry.orderBy.split("_");
    const model = (prisma as any)[entry.model];
    const rows = await model.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { [orderBy[0]]: orderBy[1] },
    });

    const data = rows.map((row: Record<string, unknown>) => {
      for (const field of entry.jsonFields) {
        if (typeof row[field] === "string") {
          try {
            row[field] = JSON.parse(row[field] as string);
          } catch {}
        }
      }
      return row;
    });

    return NextResponse.json({ data, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to load content." }, { status: 500 });
  }
}
