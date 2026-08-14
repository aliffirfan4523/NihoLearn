-- CreateTable
CREATE TABLE "KanaProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "character" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "row" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unlearned',
    "masteredAt" DATETIME,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "KanaProgress_character_key" ON "KanaProgress"("character");
