/**
 * Registry of DB-backed practice content. Shared by the /api/content route
 * (client fetches) and lib/content.ts (server-component access).
 * `jsonFields` are stored as JSON strings in Postgres and parsed on read.
 */

export interface ContentRegistryEntry {
  /** Prisma model name */
  model: string;
  /** Fields stored as JSON strings that get parsed on read */
  jsonFields: string[];
  /** Supports ?level= filtering on the `level` column */
  hasLevel: boolean;
  /** Supports ?category= filtering on the `category` column */
  hasCategory: boolean;
  orderBy: string;
}

export const CONTENT_REGISTRY: Record<string, ContentRegistryEntry> = {
  particles: {
    model: "particleExercise",
    jsonFields: ["options"],
    hasLevel: true,
    hasCategory: false,
    orderBy: "id_asc",
  },
  scramble: {
    model: "scrambleExercise",
    jsonFields: ["tiles"],
    hasLevel: true,
    hasCategory: false,
    orderBy: "id_asc",
  },
  "grammar-patterns": {
    model: "grammarPatternExercise",
    jsonFields: ["options"],
    hasLevel: true,
    hasCategory: false,
    orderBy: "id_asc",
  },
  keigo: {
    model: "keigoExercise",
    jsonFields: [],
    hasLevel: false,
    hasCategory: false,
    orderBy: "id_asc",
  },
  dictation: {
    model: "dictationExercise",
    jsonFields: [],
    hasLevel: true,
    hasCategory: false,
    orderBy: "id_asc",
  },
  shadowing: {
    model: "shadowingExercise",
    jsonFields: ["lines"],
    hasLevel: true,
    hasCategory: false,
    orderBy: "id_asc",
  },
  "word-pairs": {
    model: "wordPair",
    jsonFields: ["wordA", "wordB"],
    hasLevel: true,
    hasCategory: false,
    orderBy: "id_asc",
  },
  "furigana-passages": {
    model: "furiganaPassage",
    jsonFields: ["sentences", "comprehensionQuestions"],
    hasLevel: true,
    hasCategory: false,
    orderBy: "id_asc",
  },
  "kanji-context": {
    model: "kanjiContextSnippet",
    jsonFields: ["kanjiBreakdown", "contextQuestion", "readingQuestion"],
    hasLevel: true,
    hasCategory: false,
    orderBy: "id_asc",
  },
  grammar: {
    model: "grammarLesson",
    jsonFields: ["examples"],
    hasLevel: true,
    hasCategory: false,
    orderBy: "id_asc",
  },
  verbs: {
    model: "verb",
    jsonFields: ["forms"],
    hasLevel: true,
    hasCategory: false,
    orderBy: "id_asc",
  },
  stories: {
    model: "readingStory",
    jsonFields: ["sentences", "questions"],
    hasLevel: true,
    hasCategory: false,
    orderBy: "id_asc",
  },
  "kana-mnemonics": {
    model: "kanaMnemonic",
    jsonFields: ["secondaryWord"],
    hasLevel: false,
    hasCategory: false,
    orderBy: "romaji_asc",
  },
  radicals: {
    model: "radicalItem",
    jsonFields: ["examples"],
    hasLevel: false,
    hasCategory: false,
    orderBy: "radicalNumber_asc",
  },
  "daily-bank": {
    model: "dailyBankItem",
    jsonFields: ["payload"],
    hasLevel: false,
    hasCategory: true,
    orderBy: "id_asc",
  },
};
