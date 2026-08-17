import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { kanaSeed } from "./kana-source";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Kana reference data (shared across all users).
  for (const kana of kanaSeed) {
    await prisma.kana.upsert({
      where: { id: kana.id },
      update: { character: kana.character, type: kana.type, romaji: kana.romaji, row: kana.row },
      create: { id: kana.id, character: kana.character, type: kana.type, romaji: kana.romaji, row: kana.row },
    });
  }

  const kanaCount = await prisma.kana.count();
  console.log(`Seeded ${kanaCount} kana reference rows.`);
}

main().finally(async () => {
  await prisma.$disconnect();
});
