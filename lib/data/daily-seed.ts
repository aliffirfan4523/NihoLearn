// Deterministic daily challenge generator seeded by date YYYY-MM-DD.
// All question banks are fetched from the database by the caller
// (see /api/content/*) and passed in via DailyDatasets.
import type { DailyQuestion } from "./daily-types";

export type { DailyQuestion } from "./daily-types";

export interface DailyBankPayload {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  kanji?: string;
  meaning?: string;
  reading?: string;
}

export interface DailyDatasets {
  kanjiBank: DailyBankPayload[];
  vocabBank: DailyBankPayload[];
  cultureBank: DailyBankPayload[];
  particles: Array<{
    id: string;
    japanese: string;
    translation: string;
    options: string[];
    correctParticle: string;
    explanation: string;
  }>;
  dictation: Array<{
    id: string;
    audioPrompt: string;
    japanese: string;
    reading: string;
    translation: string;
  }>;
  grammar: Array<{
    id: string;
    title: string;
    meaning: string;
    structure: string;
    examples: Array<{ japanese: string; english: string }>;
  }>;
}

// Simple seeded PRNG (Mulberry32)
function createPRNG(seedStr: string) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }

  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

// Shuffle array deterministically
function seededShuffle<T>(arr: T[], prng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Generates up to 10 deterministic daily questions for a given date string
 * YYYY-MM-DD, drawing from the database-backed datasets passed in.
 */
export function generateDailyChallenge(dateStr: string, ds: DailyDatasets): DailyQuestion[] {
  const prng = createPRNG(dateStr);
  const questions: DailyQuestion[] = [];

  // 1 & 2: Kanji Questions (2 questions)
  const shuffledKanji = seededShuffle(ds.kanjiBank, prng);
  if (shuffledKanji.length >= 2) {
    questions.push({
      id: `q-kanji-1-${dateStr}`,
      category: "kanji",
      typeLabel: "Kanji Recognition",
      prompt: shuffledKanji[0].question,
      options: seededShuffle(shuffledKanji[0].options, prng),
      correctAnswer: shuffledKanji[0].answer,
      explanation: shuffledKanji[0].explanation,
      details: { kanji: shuffledKanji[0].kanji, meaning: shuffledKanji[0].meaning },
    });

    questions.push({
      id: `q-kanji-2-${dateStr}`,
      category: "kanji",
      typeLabel: "Kanji Reading & Compounds",
      prompt: shuffledKanji[1].question,
      options: seededShuffle(shuffledKanji[1].options, prng),
      correctAnswer: shuffledKanji[1].answer,
      explanation: shuffledKanji[1].explanation,
      details: { kanji: shuffledKanji[1].kanji, meaning: shuffledKanji[1].meaning },
    });
  }

  // 3, 4, 5: Vocabulary Questions (3 questions)
  const shuffledVocab = seededShuffle(ds.vocabBank, prng);
  if (shuffledVocab.length >= 3) {
    for (let i = 0; i < 3; i++) {
      questions.push({
        id: `q-vocab-${i + 1}-${dateStr}`,
        category: "vocabulary",
        typeLabel:
          i === 0 ? "Vocabulary Meaning" : i === 1 ? "Vocabulary in Context" : "Vocabulary Nuance",
        prompt: shuffledVocab[i].question,
        options: seededShuffle(shuffledVocab[i].options, prng),
        correctAnswer: shuffledVocab[i].answer,
        explanation: shuffledVocab[i].explanation,
        details: { reading: shuffledVocab[i].reading },
      });
    }
  }

  // 6: Particle question
  const shuffledParticles = seededShuffle(ds.particles, prng);
  if (shuffledParticles.length > 0) {
    questions.push({
      id: `q-grammar-1-${dateStr}`,
      category: "grammar",
      typeLabel: "Particle Picker",
      prompt: `Choose the correct particle for the blank: "${shuffledParticles[0].japanese}"`,
      subtitle: `Translation: "${shuffledParticles[0].translation}"`,
      options: seededShuffle(shuffledParticles[0].options, prng),
      correctAnswer: shuffledParticles[0].correctParticle,
      explanation: shuffledParticles[0].explanation,
    });
  }

  // 7: Grammar pattern meaning
  const shuffledGrammar = seededShuffle(ds.grammar, prng);
  if (shuffledGrammar.length > 0) {
    const targetGrammar = shuffledGrammar[0];
    const distractors = shuffledGrammar
      .filter((g) => g.id !== targetGrammar.id)
      .slice(0, 3)
      .map((g) => g.meaning);
    const grammarOptions = seededShuffle([targetGrammar.meaning, ...distractors], prng);

    questions.push({
      id: `q-grammar-2-${dateStr}`,
      category: "grammar",
      typeLabel: "Grammar Pattern Meaning",
      prompt: `What is the function of the Japanese grammar pattern 「${targetGrammar.title}」?`,
      subtitle: `Example: ${targetGrammar.examples[0]?.japanese || ""}`,
      options: grammarOptions,
      correctAnswer: targetGrammar.meaning,
      explanation: `Structure: ${targetGrammar.structure}. Example: ${targetGrammar.examples[0]?.english || ""}`,
    });
  }

  // 8 & 9: Audio & Dictation (2 questions)
  const shuffledDictation = seededShuffle(ds.dictation, prng);
  if (shuffledDictation.length >= 3) {
    questions.push({
      id: `q-audio-1-${dateStr}`,
      category: "audio",
      typeLabel: "Listening & Dictation",
      prompt: "Listen to the spoken Japanese audio and select the matching English meaning:",
      subtitle: "Click the audio button to play the natural Japanese pronunciation.",
      audioText: shuffledDictation[0].audioPrompt || shuffledDictation[0].reading,
      options: seededShuffle(
        [
          shuffledDictation[0].translation,
          shuffledDictation[1].translation,
          shuffledDictation[2].translation,
          "Please turn off the lights before leaving.",
        ],
        prng
      ),
      correctAnswer: shuffledDictation[0].translation,
      explanation: `Spoken: 「${shuffledDictation[0].japanese}」 (${shuffledDictation[0].reading}). Translation: ${shuffledDictation[0].translation}`,
    });

    questions.push({
      id: `q-audio-2-${dateStr}`,
      category: "audio",
      typeLabel: "Audio Transcript Matching",
      prompt: "Listen to the sentence and choose the correct Japanese transcript:",
      subtitle: "Pay close attention to particle sounds and polite verb endings.",
      audioText: shuffledDictation[1].audioPrompt || shuffledDictation[1].reading,
      options: seededShuffle(
        [
          shuffledDictation[1].japanese,
          shuffledDictation[0].japanese,
          shuffledDictation[2].japanese,
          "明日は図書館へ行って勉強します。",
        ],
        prng
      ),
      correctAnswer: shuffledDictation[1].japanese,
      explanation: `Correct transcript: 「${shuffledDictation[1].japanese}」. Meaning: ${shuffledDictation[1].translation}`,
    });
  }

  // 10: Japanese Culture / Idiom / Proverb (1 question)
  const shuffledCulture = seededShuffle(ds.cultureBank, prng);
  if (shuffledCulture.length > 0) {
    questions.push({
      id: `q-culture-1-${dateStr}`,
      category: "culture",
      typeLabel: "Culture & Proverb Dojo",
      prompt: shuffledCulture[0].question,
      options: seededShuffle(shuffledCulture[0].options, prng),
      correctAnswer: shuffledCulture[0].answer,
      explanation: shuffledCulture[0].explanation,
    });
  }

  return questions;
}
