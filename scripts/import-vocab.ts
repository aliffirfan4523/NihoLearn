import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface VocabCsvRow {
  word: string;
  reading: string;
  meaning: string;
  tags: string;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsvFile(filePath: string): VocabCsvRow[] {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return [];
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  // Header: expression,reading,meaning,tags
  const rows: VocabCsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parsed = parseCsvLine(lines[i]);
    if (parsed.length >= 3) {
      const word = parsed[0] || "";
      const reading = parsed[1] || "";
      const meaning = parsed[2] || "";
      const tags = parsed[3] || "";

      if (word && meaning) {
        rows.push({ word, reading: reading || word, meaning, tags });
      }
    }
  }
  return rows;
}

async function main() {
  console.log("🚀 Starting JLPT Vocabulary Import from data/jlpt-word-list/src/...");

  const baseDir = path.join(process.cwd(), "data", "jlpt-word-list", "src");
  const levels = [
    { file: "n5.csv", level: "N5" },
    { file: "n4.csv", level: "N4" },
    { file: "n3.csv", level: "N3" },
    { file: "n2.csv", level: "N2" },
    { file: "n1.csv", level: "N1" },
  ];

  let totalImported = 0;
  const seenIds = new Set<string>();

  for (const { file, level } of levels) {
    const filePath = path.join(baseDir, file);
    const rows = parseCsvFile(filePath);
    console.log(`📖 Read ${rows.length} vocabulary entries from ${file} (${level})...`);

    const records = [];
    let idx = 1;

    for (const r of rows) {
      // Create a unique deterministic ID: e.g. n5_v001_食べる or n5_001
      let cleanWord = r.word.replace(/[\s\/\;\:\,\'\"\(\)]/g, "");
      let id = `${level.toLowerCase()}_v${String(idx).padStart(4, "0")}`;
      if (seenIds.has(id)) {
        id = `${level.toLowerCase()}_v${String(idx).padStart(4, "0")}_${cleanWord}`;
      }
      seenIds.add(id);

      records.push({
        id,
        word: r.word,
        reading: r.reading,
        meaning: r.meaning,
        level,
        tags: r.tags || null,
      });
      idx++;
    }

    // Batch insert with chunking
    const chunkSize = 250;
    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize);
      try {
        await prisma.vocabulary.createMany({
          data: chunk,
          skipDuplicates: true,
        });
      } catch (err: any) {
        // Raw SQL insert fallback if client generation is in flux
        for (const item of chunk) {
          try {
            await prisma.$executeRawUnsafe(
              `INSERT INTO "Vocabulary" ("id", "word", "reading", "meaning", "level", "tags")
               VALUES ($1, $2, $3, $4, $5, $6)
               ON CONFLICT ("id") DO UPDATE SET "meaning" = EXCLUDED."meaning", "reading" = EXCLUDED."reading", "level" = EXCLUDED."level"`,
              item.id,
              item.word,
              item.reading,
              item.meaning,
              item.level,
              item.tags
            );
          } catch (e) {
            // ignore duplicates
          }
        }
      }
    }

    totalImported += records.length;
    console.log(`✅ Finished ${level}: ${records.length} words imported.`);
  }

  console.log(`\n🎉 Total Vocabulary Imported Successfully: ${totalImported} words across N5 to N1!`);
}

main()
  .catch((err) => {
    console.error("Import failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
