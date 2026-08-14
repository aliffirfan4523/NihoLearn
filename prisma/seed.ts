import { PrismaClient } from "@prisma/client";
import { kanaSeed } from "../lib/data/kana";
import { n5Vocab } from "../lib/data/n5-vocab";
import { n5Kanji } from "../lib/data/n5-kanji";
import { n5Grammar } from "../lib/data/n5-grammar";

const prisma = new PrismaClient();

async function main() {
  // Kana
  for (const kana of kanaSeed) {
    await prisma.kanaProgress.upsert({
      where: { id: kana.id },
      update: { character: kana.character, type: kana.type, romaji: kana.romaji, row: kana.row },
      create: { id: kana.id, character: kana.character, type: kana.type, romaji: kana.romaji, row: kana.row },
    });
  }
  const kanaCount = await prisma.kanaProgress.count();

  // Vocabulary
  for (const word of n5Vocab) {
    await prisma.vocabProgress.upsert({
      where: { wordId: word.id },
      update: { level: word.level },
      create: { wordId: word.id, level: word.level },
    });
  }
  const vocabCount = await prisma.vocabProgress.count();

  // Kanji
  for (const kanji of n5Kanji) {
    await prisma.kanjiProgress.upsert({
      where: { kanjiId: kanji.id },
      update: { level: kanji.level },
      create: { kanjiId: kanji.id, level: kanji.level },
    });
  }
  const kanjiCount = await prisma.kanjiProgress.count();

  // Grammar
  for (const grammar of n5Grammar) {
    await prisma.grammarProgress.upsert({
      where: { grammarId: grammar.id },
      update: { level: grammar.level },
      create: { grammarId: grammar.id, level: grammar.level },
    });
  }
  const grammarCount = await prisma.grammarProgress.count();

  console.log(`Seeded: ${kanaCount} kana, ${vocabCount} vocab, ${kanjiCount} kanji, ${grammarCount} grammar`);
}

main().finally(async () => {
  await prisma.$disconnect();
});
