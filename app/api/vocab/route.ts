import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { ProgressStatus } from "@/types";

const statuses: ProgressStatus[] = ["unlearned", "reviewing", "mastered"];

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const searchParams = request.nextUrl.searchParams;
    const levelParam = searchParams.get("level")?.toUpperCase();
    const statusParam = searchParams.get("status");
    const searchQuery = searchParams.get("q")?.trim();
    const readingStarts = searchParams.get("readingStarts")?.trim();
    const limit = parseInt(searchParams.get("limit") || "1000", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // 1. Fetch vocabulary from Database
    let vocabList: any[] = [];
    try {
      const whereClause: any = {};
      if (levelParam && ["N5", "N4", "N3", "N2", "N1"].includes(levelParam)) {
        whereClause.level = levelParam;
      }
      if (readingStarts) {
        whereClause.reading = { startsWith: readingStarts };
      }
      if (searchQuery) {
        whereClause.OR = [
          { word: { contains: searchQuery, mode: "insensitive" } },
          { reading: { contains: searchQuery, mode: "insensitive" } },
          { meaning: { contains: searchQuery, mode: "insensitive" } },
        ];
      }

      vocabList = await (prisma as any).vocabulary.findMany({
        where: whereClause,
        orderBy: [{ id: "asc" }],
        take: limit,
        skip: offset,
      });
    } catch {
      // Raw SQL Fallback
      try {
        let sql = `SELECT * FROM "Vocabulary" WHERE 1=1`;
        const params: any[] = [];
        let pIdx = 1;

        if (levelParam && ["N5", "N4", "N3", "N2", "N1"].includes(levelParam)) {
          sql += ` AND "level" = $${pIdx++}`;
          params.push(levelParam);
        }
        if (readingStarts) {
          sql += ` AND "reading" LIKE $${pIdx++}`;
          params.push(`${readingStarts}%`);
        }
        if (searchQuery) {
          sql += ` AND ("word" ILIKE $${pIdx} OR "reading" ILIKE $${pIdx} OR "meaning" ILIKE $${pIdx})`;
          params.push(`%${searchQuery}%`);
          pIdx++;
        }

        sql += ` ORDER BY "id" ASC LIMIT ${limit} OFFSET ${offset}`;
        vocabList = await prisma.$queryRawUnsafe(sql, ...params);
      } catch (rawErr) {
        console.error("SQL Fallback error:", rawErr);
        vocabList = [];
      }
    }

    // 2. Attach User Progress
    const progressMap: Record<string, { status: ProgressStatus; notes?: string | null }> = {};
    if (user?.id) {
      try {
        const userProgress = await (prisma as any).vocabProgress.findMany({
          where: { userId: user.id },
        });
        for (const p of userProgress) {
          progressMap[p.wordId] = {
            status: p.status as ProgressStatus,
            notes: p.notes,
          };
        }
      } catch {
        try {
          const rawProg: any[] = await prisma.$queryRawUnsafe(
            `SELECT "wordId", "status", "notes" FROM "VocabProgress" WHERE "userId" = $1`,
            user.id
          );
          for (const p of rawProg) {
            progressMap[p.wordId] = {
              status: p.status as ProgressStatus,
              notes: p.notes,
            };
          }
        } catch {}
      }
    }

    // 3. Merge vocabulary with progress
    const merged = vocabList.map((item) => {
      const prog = progressMap[item.id] || { status: "unlearned" };
      let meaningList: string[] = [];
      try {
        meaningList = typeof item.meaning === "string" ? item.meaning.split(",").map((m: string) => m.trim()) : [item.meaning];
      } catch {
        meaningList = [String(item.meaning || "")];
      }

      return {
        id: item.id,
        word: item.word,
        reading: item.reading,
        romaji: item.romaji || "",
        meaning: meaningList,
        level: item.level,
        partOfSpeech: item.partOfSpeech || "",
        exampleSentence: item.exampleSentence || null,
        tags: item.tags || null,
        status: prog.status,
        notes: prog.notes || null,
      };
    });

    const finalFiltered = statusParam
      ? merged.filter((item) => item.status === statusParam)
      : merged;

    return NextResponse.json({
      data: finalFiltered,
      total: finalFiltered.length,
      error: null,
    });
  } catch (err: any) {
    console.error("GET /api/vocab error:", err);
    return NextResponse.json({ data: [], error: "Failed to load vocabulary." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

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
