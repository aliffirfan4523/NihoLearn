import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { ProgressStatus } from "@/types";

export const dynamic = "force-dynamic";

const statuses: ProgressStatus[] = ["unlearned", "reviewing", "mastered"];

export async function GET(request: NextRequest) {
  try {
    const rawLevel = request.nextUrl.searchParams.get("level");
    const status = request.nextUrl.searchParams.get("status");
    const search = request.nextUrl.searchParams.get("search");

    const level = rawLevel && rawLevel !== "all" ? rawLevel.toUpperCase() : undefined;

    let user = null;
    try {
      user = await getCurrentUser();
    } catch {
      user = null;
    }

    let kanjiList: any[] = [];

    if ((prisma as any).kanji) {
      kanjiList = await (prisma as any).kanji.findMany({
        where: {
          ...(level ? { jlpt: level } : {}),
          ...(search
            ? {
                OR: [
                  { character: { contains: search } },
                  { meaning: { contains: search, mode: "insensitive" } },
                  { description: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        orderBy: [{ frequency: "asc" }, { id: "asc" }],
        include: user
          ? {
              progress: {
                where: { userId: user.id },
                select: { id: true, status: true, notes: true, masteredAt: true },
              },
            }
          : undefined,
      });
    } else {
      // Fallback SQL query when Prisma client model was cached prior to hot reload
      const whereClauses: string[] = [];
      const params: any[] = [];
      if (level) {
        params.push(level);
        whereClauses.push(`jlpt = $${params.length}`);
      }
      if (search) {
        params.push(`%${search}%`);
        whereClauses.push(
          `(character LIKE $${params.length} OR meaning ILIKE $${params.length} OR description ILIKE $${params.length})`
        );
      }
      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
      kanjiList = await (prisma as any).$queryRawUnsafe(
        `SELECT id, character, strokes, "radicalNumber", frequency, jlpt, meaning, onyomi, kunyomi, examples, begins, "usedIn", "componentIn", description FROM "Kanji" ${whereSql} ORDER BY frequency ASC, id ASC`,
        ...params
      );

      // Join progress if user is authenticated
      if (user && (prisma as any).kanjiProgress) {
        const progressList = await (prisma as any).kanjiProgress.findMany({
          where: { userId: user.id },
          select: { kanjiId: true, status: true, notes: true, masteredAt: true },
        });
        const progressMap = new Map(progressList.map((p: any) => [p.kanjiId, p]));
        kanjiList = kanjiList.map((k) => ({
          ...k,
          progress: progressMap.has(k.character) ? [progressMap.get(k.character)] : [],
        }));
      }
    }

    const data = kanjiList
      .map((k: any) => {
        let onyomi: string[] = [];
        let kunyomi: string[] = [];
        let examples: Array<{ word: string; reading: string; meaning: string }> = [];

        try {
          if (k.onyomi) {
            onyomi = typeof k.onyomi === "string" ? JSON.parse(k.onyomi) : k.onyomi;
          }
        } catch {}
        try {
          if (k.kunyomi) {
            kunyomi = typeof k.kunyomi === "string" ? JSON.parse(k.kunyomi) : k.kunyomi;
          }
        } catch {}
        try {
          if (k.examples) {
            examples = typeof k.examples === "string" ? JSON.parse(k.examples) : k.examples;
          }
        } catch {}

        const userProgress = k.progress && k.progress.length > 0 ? k.progress[0] : null;

        return {
          id: k.id,
          character: k.character,
          strokes: k.strokes ?? 1,
          radicalNumber: k.radicalNumber,
          frequency: k.frequency,
          jlpt: k.jlpt,
          meaning: k.meaning,
          onyomi: Array.isArray(onyomi) ? onyomi : [],
          kunyomi: Array.isArray(kunyomi) ? kunyomi : [],
          examples: Array.isArray(examples) ? examples : [],
          begins: k.begins,
          usedIn: k.usedIn,
          componentIn: k.componentIn,
          description: k.description,
          status: (userProgress?.status ?? "unlearned") as ProgressStatus,
          notes: userProgress?.notes ?? null,
        };
      })
      .filter((k) => (status && status !== "all" ? k.status === status : true));

    return NextResponse.json({ data, error: null });
  } catch (error: any) {
    console.error("GET /api/kanji error:", error);
    return NextResponse.json(
      { data: null, error: error?.message || "Failed to load kanji." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ data: null, error: "Authentication required." }, { status: 401 });
    }

    const body = (await request.json()) as {
      kanjiId?: string;
      level?: string;
      status?: ProgressStatus;
      notes?: string;
      batch?: Array<{ kanjiId: string; level: string; status: ProgressStatus; notes?: string }>;
    };

    // Handle batch update
    if (body.batch && Array.isArray(body.batch)) {
      const updates = body.batch.filter((item) => item.kanjiId && item.level && statuses.includes(item.status));
      await Promise.all(
        updates.map((item) =>
          prisma.kanjiProgress.upsert({
            where: { userId_kanjiId: { userId: user.id, kanjiId: item.kanjiId } },
            update: {
              level: item.level.toUpperCase(),
              status: item.status,
              notes: item.notes,
              masteredAt: item.status === "mastered" ? new Date() : null,
            },
            create: {
              userId: user.id,
              kanjiId: item.kanjiId,
              level: item.level.toUpperCase(),
              status: item.status,
              notes: item.notes,
              masteredAt: item.status === "mastered" ? new Date() : null,
            },
          })
        )
      );

      return NextResponse.json({ success: true, updatedCount: updates.length, error: null });
    }

    if (!body.kanjiId || !body.level || !body.status || !statuses.includes(body.status)) {
      return NextResponse.json({ data: null, error: "Invalid kanji update." }, { status: 400 });
    }

    const data = await prisma.kanjiProgress.upsert({
      where: { userId_kanjiId: { userId: user.id, kanjiId: body.kanjiId } },
      update: {
        level: body.level.toUpperCase(),
        status: body.status,
        notes: body.notes,
        masteredAt: body.status === "mastered" ? new Date() : null,
      },
      create: {
        userId: user.id,
        kanjiId: body.kanjiId,
        level: body.level.toUpperCase(),
        status: body.status,
        notes: body.notes,
        masteredAt: body.status === "mastered" ? new Date() : null,
      },
    });

    return NextResponse.json({ data, error: null });
  } catch (error: any) {
    console.error("POST /api/kanji error:", error);
    return NextResponse.json(
      { data: null, error: error?.message || "Failed to update kanji." },
      { status: 500 }
    );
  }
}
