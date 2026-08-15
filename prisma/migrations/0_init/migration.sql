warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file (e.g., `prisma.config.ts`).
For more information, see: https://pris.ly/prisma-config

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "KanaProgress" (
    "id" TEXT NOT NULL,
    "character" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "row" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unlearned',
    "masteredAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KanaProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocabProgress" (
    "id" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unlearned',
    "notes" TEXT,
    "nextReviewAt" TIMESTAMP(3),
    "masteredAt" TIMESTAMP(3),
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VocabProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanjiProgress" (
    "id" TEXT NOT NULL,
    "kanjiId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unlearned',
    "notes" TEXT,
    "masteredAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KanjiProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrammarProgress" (
    "id" TEXT NOT NULL,
    "grammarId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unlearned',
    "notes" TEXT,
    "masteredAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrammarProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudySession" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationMinutes" INTEGER NOT NULL,
    "level" TEXT NOT NULL,
    "activities" TEXT NOT NULL,
    "wordsReviewed" INTEGER,
    "kanjiReviewed" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VocabProgress_wordId_key" ON "VocabProgress"("wordId");

-- CreateIndex
CREATE UNIQUE INDEX "KanjiProgress_kanjiId_key" ON "KanjiProgress"("kanjiId");

-- CreateIndex
CREATE UNIQUE INDEX "GrammarProgress_grammarId_key" ON "GrammarProgress"("grammarId");

