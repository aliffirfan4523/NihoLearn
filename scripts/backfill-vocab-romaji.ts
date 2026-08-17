/**
 * Backfills Vocabulary.romaji (all NULL after the vocab import) by converting
 * each word's kana reading deterministically with kanaToRomaji.
 *
 * Run: npx tsx scripts/backfill-vocab-romaji.ts
 */
import { PrismaClient } from "@prisma/client";
import { kanaToRomaji } from "../lib/japanese-utils";

const prisma = new PrismaClient();

async function main() {
  const vocab = await prisma.vocabulary.findMany({
    where: { OR: [{ romaji: null }, { romaji: "" }] },
    select: { id: true, reading: true },
  });

  console.log(`Backfilling romaji for ${vocab.length} vocabulary rows...`);

  let updated = 0;
  let skipped = 0;
  const BATCH = 8; // stay well under the Prisma connection-pool limit

  for (let i = 0; i < vocab.length; i += BATCH) {
    const batch = vocab.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (v) => {
        const romaji = kanaToRomaji((v.reading || "").trim());
        if (!romaji) {
          skipped++;
          return;
        }
        await prisma.vocabulary.update({
          where: { id: v.id },
          data: { romaji },
        });
        updated++;
      })
    );
    if ((i / BATCH) % 50 === 0) console.log(`  ${i}/${vocab.length}...`);
  }

  console.log(`Done. Updated: ${updated}, skipped (no reading): ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
