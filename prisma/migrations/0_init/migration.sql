-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'email',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "knowsKana" BOOLEAN NOT NULL DEFAULT false,
    "dailyVocabGoal" INTEGER NOT NULL DEFAULT 5,
    "dailyGrammarGoal" INTEGER NOT NULL DEFAULT 2,
    "japaneseLevel" TEXT NOT NULL DEFAULT 'Complete Beginner',
    "profileCompleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kana" (
    "id" TEXT NOT NULL,
    "character" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "row" TEXT NOT NULL,

    CONSTRAINT "Kana_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanaProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kanaId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unlearned',
    "masteredAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KanaProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kanji" (
    "id" TEXT NOT NULL,
    "character" TEXT NOT NULL,
    "strokes" INTEGER,
    "radicalNumber" INTEGER,
    "frequency" INTEGER,
    "jlpt" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "onyomi" TEXT,
    "kunyomi" TEXT,
    "examples" TEXT,
    "begins" INTEGER,
    "usedIn" INTEGER,
    "componentIn" INTEGER,
    "description" TEXT,

    CONSTRAINT "Kanji_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vocabulary" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "reading" TEXT NOT NULL,
    "romaji" TEXT,
    "meaning" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "partOfSpeech" TEXT,
    "exampleSentence" TEXT,
    "tags" TEXT,

    CONSTRAINT "Vocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocabProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
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
    "userId" TEXT NOT NULL,
    "kanjiId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unlearned',
    "notes" TEXT,
    "masteredAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KanjiProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClozeExercise" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "sentenceWithBlank" TEXT NOT NULL,
    "fullSentence" TEXT NOT NULL,
    "reading" TEXT NOT NULL,
    "englishTranslation" TEXT NOT NULL,
    "hint" TEXT,
    "targetWord" TEXT NOT NULL,
    "distractors" TEXT NOT NULL,

    CONSTRAINT "ClozeExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticleExercise" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "japanese" TEXT NOT NULL,
    "reading" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "correctParticle" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,

    CONSTRAINT "ParticleExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrambleExercise" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "fullSentence" TEXT NOT NULL,
    "reading" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "tiles" TEXT NOT NULL,

    CONSTRAINT "ScrambleExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrammarPatternExercise" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "scenario" TEXT NOT NULL,
    "sentence" TEXT NOT NULL,
    "correctPattern" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,

    CONSTRAINT "GrammarPatternExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeigoExercise" (
    "id" TEXT NOT NULL,
    "plain" TEXT NOT NULL,
    "polite" TEXT NOT NULL,
    "sonkeigo" TEXT NOT NULL,
    "kenjougo" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "contextNote" TEXT,

    CONSTRAINT "KeigoExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DictationExercise" (
    "id" TEXT NOT NULL,
    "audioPrompt" TEXT NOT NULL,
    "japanese" TEXT NOT NULL,
    "reading" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "hint" TEXT,

    CONSTRAINT "DictationExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShadowingExercise" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "lines" TEXT NOT NULL,

    CONSTRAINT "ShadowingExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordPair" (
    "id" TEXT NOT NULL,
    "pairType" TEXT NOT NULL,
    "themeCategory" TEXT,
    "wordA" TEXT NOT NULL,
    "wordB" TEXT NOT NULL,
    "relationLabel" TEXT NOT NULL,
    "level" TEXT NOT NULL,

    CONSTRAINT "WordPair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuriganaPassage" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "readTime" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "sentences" TEXT NOT NULL,
    "comprehensionQuestions" TEXT NOT NULL,

    CONSTRAINT "FuriganaPassage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanjiContextSnippet" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "domainEmoji" TEXT NOT NULL,
    "scenarioTitle" TEXT NOT NULL,
    "snippetText" TEXT NOT NULL,
    "targetKanji" TEXT NOT NULL,
    "targetReading" TEXT NOT NULL,
    "targetMeaning" TEXT NOT NULL,
    "kanjiBreakdown" TEXT NOT NULL,
    "contextQuestion" TEXT NOT NULL,
    "readingQuestion" TEXT NOT NULL,

    CONSTRAINT "KanjiContextSnippet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrammarLesson" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "structure" TEXT NOT NULL,
    "examples" TEXT NOT NULL,

    CONSTRAINT "GrammarLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verb" (
    "id" TEXT NOT NULL,
    "kanji" TEXT NOT NULL,
    "reading" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "verbType" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "forms" TEXT NOT NULL,

    CONSTRAINT "Verb_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingStory" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "titleJapanese" TEXT NOT NULL,
    "titleRomaji" TEXT NOT NULL,
    "titleEnglish" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "readTime" TEXT NOT NULL,
    "pixelArtEmoji" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "sentences" TEXT NOT NULL,
    "questions" TEXT NOT NULL,

    CONSTRAINT "ReadingStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanaMnemonic" (
    "character" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "kanji" TEXT,
    "wordRomaji" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "mnemonic" TEXT NOT NULL,
    "secondaryWord" TEXT,

    CONSTRAINT "KanaMnemonic_pkey" PRIMARY KEY ("character")
);

-- CreateTable
CREATE TABLE "RadicalItem" (
    "radicalNumber" INTEGER NOT NULL,
    "radical" TEXT NOT NULL,
    "strokes" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "examples" TEXT NOT NULL,

    CONSTRAINT "RadicalItem_pkey" PRIMARY KEY ("radicalNumber")
);

-- CreateTable
CREATE TABLE "DailyBankItem" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "payload" TEXT NOT NULL,

    CONSTRAINT "DailyBankItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrammarProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
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
    "userId" TEXT NOT NULL,
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
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "KanaProgress_userId_kanaId_key" ON "KanaProgress"("userId", "kanaId");

-- CreateIndex
CREATE UNIQUE INDEX "Kanji_character_key" ON "Kanji"("character");

-- CreateIndex
CREATE INDEX "Kanji_jlpt_idx" ON "Kanji"("jlpt");

-- CreateIndex
CREATE INDEX "Vocabulary_level_idx" ON "Vocabulary"("level");

-- CreateIndex
CREATE INDEX "Vocabulary_word_idx" ON "Vocabulary"("word");

-- CreateIndex
CREATE INDEX "VocabProgress_userId_level_idx" ON "VocabProgress"("userId", "level");

-- CreateIndex
CREATE UNIQUE INDEX "VocabProgress_userId_wordId_key" ON "VocabProgress"("userId", "wordId");

-- CreateIndex
CREATE UNIQUE INDEX "KanjiProgress_userId_kanjiId_key" ON "KanjiProgress"("userId", "kanjiId");

-- CreateIndex
CREATE INDEX "ClozeExercise_level_idx" ON "ClozeExercise"("level");

-- CreateIndex
CREATE INDEX "ParticleExercise_level_idx" ON "ParticleExercise"("level");

-- CreateIndex
CREATE INDEX "ScrambleExercise_level_idx" ON "ScrambleExercise"("level");

-- CreateIndex
CREATE INDEX "GrammarPatternExercise_level_idx" ON "GrammarPatternExercise"("level");

-- CreateIndex
CREATE INDEX "DictationExercise_level_idx" ON "DictationExercise"("level");

-- CreateIndex
CREATE INDEX "ShadowingExercise_level_idx" ON "ShadowingExercise"("level");

-- CreateIndex
CREATE INDEX "WordPair_level_idx" ON "WordPair"("level");

-- CreateIndex
CREATE INDEX "FuriganaPassage_level_idx" ON "FuriganaPassage"("level");

-- CreateIndex
CREATE INDEX "KanjiContextSnippet_level_idx" ON "KanjiContextSnippet"("level");

-- CreateIndex
CREATE INDEX "GrammarLesson_level_idx" ON "GrammarLesson"("level");

-- CreateIndex
CREATE INDEX "Verb_level_idx" ON "Verb"("level");

-- CreateIndex
CREATE INDEX "ReadingStory_level_idx" ON "ReadingStory"("level");

-- CreateIndex
CREATE INDEX "KanaMnemonic_romaji_idx" ON "KanaMnemonic"("romaji");

-- CreateIndex
CREATE INDEX "RadicalItem_strokes_idx" ON "RadicalItem"("strokes");

-- CreateIndex
CREATE INDEX "DailyBankItem_category_idx" ON "DailyBankItem"("category");

-- CreateIndex
CREATE UNIQUE INDEX "GrammarProgress_userId_grammarId_key" ON "GrammarProgress"("userId", "grammarId");

-- AddForeignKey
ALTER TABLE "KanaProgress" ADD CONSTRAINT "KanaProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanaProgress" ADD CONSTRAINT "KanaProgress_kanaId_fkey" FOREIGN KEY ("kanaId") REFERENCES "Kana"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabProgress" ADD CONSTRAINT "VocabProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabProgress" ADD CONSTRAINT "VocabProgress_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanjiProgress" ADD CONSTRAINT "KanjiProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanjiProgress" ADD CONSTRAINT "KanjiProgress_kanjiId_fkey" FOREIGN KEY ("kanjiId") REFERENCES "Kanji"("character") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammarProgress" ADD CONSTRAINT "GrammarProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

