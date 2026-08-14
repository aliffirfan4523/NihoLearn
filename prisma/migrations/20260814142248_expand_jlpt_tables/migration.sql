-- CreateTable
CREATE TABLE "VocabProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wordId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unlearned',
    "notes" TEXT,
    "nextReviewAt" DATETIME,
    "masteredAt" DATETIME,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "KanjiProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kanjiId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unlearned',
    "notes" TEXT,
    "masteredAt" DATETIME,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GrammarProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "grammarId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unlearned',
    "notes" TEXT,
    "masteredAt" DATETIME,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StudySession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationMinutes" INTEGER NOT NULL,
    "level" TEXT NOT NULL,
    "activities" TEXT NOT NULL,
    "wordsReviewed" INTEGER,
    "kanjiReviewed" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "VocabProgress_wordId_key" ON "VocabProgress"("wordId");

-- CreateIndex
CREATE UNIQUE INDEX "KanjiProgress_kanjiId_key" ON "KanjiProgress"("kanjiId");

-- CreateIndex
CREATE UNIQUE INDEX "GrammarProgress_grammarId_key" ON "GrammarProgress"("grammarId");
