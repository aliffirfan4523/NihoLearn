import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Loading JLPT Kanji dictionary files...");

  const baseDir = path.join(process.cwd(), "public", "jlpt-kanji-dictionary");
  const kanjiRaw = JSON.parse(fs.readFileSync(path.join(baseDir, "jlpt-kanji.json"), "utf8"));

  console.log(`Found ${kanjiRaw.length} kanji records in jlpt-kanji.json.`);

  // Load dictionary parts
  const d1 = JSON.parse(fs.readFileSync(path.join(baseDir, "dictionary_part_1.json"), "utf8"));
  const d2 = JSON.parse(fs.readFileSync(path.join(baseDir, "dictionary_part_2.json"), "utf8"));
  const d3 = JSON.parse(fs.readFileSync(path.join(baseDir, "dictionary_part_3.json"), "utf8"));
  const d4 = JSON.parse(fs.readFileSync(path.join(baseDir, "dictionary_part_4.json"), "utf8"));
  const allDict = [...d1, ...d2, ...d3, ...d4];

  console.log(`Loaded ${allDict.length} dictionary words for readings & example extraction.`);

  // Index single-character entries for Onyomi / Kunyomi readings
  const singleCharMap = new Map();
  // Index words by kanji characters contained
  const kanjiWordsMap = new Map();

  for (const entry of allDict) {
    if (!entry.kanji) continue;

    if (entry.kanji.length === 1) {
      if (!singleCharMap.has(entry.kanji)) {
        singleCharMap.set(entry.kanji, []);
      }
      singleCharMap.get(entry.kanji).push(entry);
    }

    // Index for examples
    for (const char of entry.kanji) {
      if (!kanjiWordsMap.has(char)) {
        kanjiWordsMap.set(char, []);
      }
      const list = kanjiWordsMap.get(char);
      if (list.length < 5) {
        list.push({
          word: entry.kanji,
          reading: entry.reading,
          meaning: Array.isArray(entry.glossary_en) ? entry.glossary_en[0] : entry.glossary_en,
        });
      }
    }
  }

  // Transform all 2,136 kanji
  const records = kanjiRaw.map((k) => {
    // 1. Extract clean English meaning
    let meaning = "";
    if (k.description) {
      const match = k.description.match(/means ([^\.]+)\./i);
      if (match && match[1]) {
        meaning = match[1].trim();
      }
    }
    if (!meaning) {
      const singles = singleCharMap.get(k.kanji) || [];
      if (singles.length > 0 && singles[0].glossary_en && singles[0].glossary_en[0]) {
        meaning = singles[0].glossary_en[0];
      } else {
        meaning = k.kanji;
      }
    }

    // 2. Extract readings
    const singles = singleCharMap.get(k.kanji) || [];
    const readings = singles.map((s) => s.reading).filter(Boolean);
    const uniqueReadings = [...new Set(readings)];

    // Separate Katakana (Onyomi) vs Hiragana (Kunyomi) if applicable, or store readings
    const onyomi = uniqueReadings.filter((r) => /^[\u30a0-\u30ff]+$/.test(r));
    const kunyomi = uniqueReadings.filter((r) => /^[\u3040-\u309f]+$/.test(r));

    // 3. Extract examples
    const examples = kanjiWordsMap.get(k.kanji) || [];

    // Fallback strokes
    const strokes = typeof k.strokes === "number" ? k.strokes : (k.kanji === "一" ? 1 : 1);

    return {
      id: k.kanji,
      character: k.kanji,
      strokes: strokes,
      radicalNumber: k.radical_number || null,
      frequency: k.frequency || null,
      jlpt: k.jlpt || "N1",
      meaning: meaning,
      onyomi: JSON.stringify(onyomi.length > 0 ? onyomi : uniqueReadings),
      kunyomi: JSON.stringify(kunyomi.length > 0 ? kunyomi : []),
      examples: JSON.stringify(examples.slice(0, 4)),
      begins: k.begins || 0,
      usedIn: k.used_in || 0,
      componentIn: k.component_in || 0,
      description: k.description || null,
    };
  });

  console.log(`Prepared ${records.length} formatted kanji records for database insertion.`);

  // Chunked batch insert / upsert using prisma.kanji.createMany
  const CHUNK_SIZE = 500;
  for (let i = 0; i < records.length; i += CHUNK_SIZE) {
    const chunk = records.slice(i, i + CHUNK_SIZE);
    console.log(`Inserting chunk ${i / CHUNK_SIZE + 1} (${chunk.length} kanji)...`);
    await prisma.kanji.createMany({
      data: chunk,
      skipDuplicates: true,
    });
  }

  const finalCount = await prisma.kanji.count();
  console.log(`\n🎉 Success! Total Kanji in database now: ${finalCount}`);
}

main()
  .catch((e) => {
    console.error("Import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
