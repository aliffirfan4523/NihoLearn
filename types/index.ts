export type KanaType = "hiragana" | "katakana";
export type JLPTLevel = "N5" | "N4" | "N3" | "N2" | "N1";
export type ProgressStatus = "unlearned" | "reviewing" | "mastered";
export type StudyActivity = "vocabulary" | "kanji" | "grammar" | "reading" | "listening" | "writing" | "kana";

export interface KanaCharacter {
  id: string;
  type: KanaType;
  character: string;
  romaji: string;
  row: string;
  status: ProgressStatus;
}

export interface VocabWord {
  id: string;
  level: JLPTLevel;
  word: string;
  reading: string;
  romaji: string;
  meaning: string[];
  partOfSpeech: string;
  exampleSentence?: string;
  status?: ProgressStatus;
  notes?: string;
}

export interface KanjiEntry {
  id: string;
  level: JLPTLevel;
  character: string;
  onyomi: string[];
  kunyomi: string[];
  meaning: string[];
  strokeCount: number;
  exampleWords: string[];
  status?: ProgressStatus;
  notes?: string;
}

export interface GrammarPoint {
  id: string;
  level: JLPTLevel;
  title: string;
  meaning: string;
  structure: string;
  examples: Array<{
    japanese: string;
    reading: string;
    english: string;
  }>;
  status?: ProgressStatus;
  notes?: string;
}

export interface StudySession {
  id: string;
  date: string;
  durationMinutes: number;
  level: string;
  activities: StudyActivity[];
  wordsReviewed?: number;
  kanjiReviewed?: number;
  notes?: string;
}

export interface LevelStats {
  level: JLPTLevel | "kana";
  vocab: { total: number; mastered: number; reviewing: number; unlearned: number };
  kanji: { total: number; mastered: number; reviewing: number; unlearned: number };
  grammar: { total: number; mastered: number; reviewing: number; unlearned: number };
}
