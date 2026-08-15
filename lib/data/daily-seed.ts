// Deterministic daily challenge generator seeded by date YYYY-MM-DD
import { PARTICLE_EXERCISES, DICTATION_EXERCISES } from "./practice-content";
import { n5Grammar } from "./n5-grammar";
import { hiraganaSeed } from "./hiragana";

export interface DailyQuestion {
  id: string;
  category: "kanji" | "vocabulary" | "grammar" | "audio" | "culture";
  typeLabel: string;
  prompt: string;
  subtitle?: string;
  audioText?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  details?: {
    kanji?: string;
    reading?: string;
    romaji?: string;
    meaning?: string;
  };
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
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Built-in curated question banks
const KANJI_BANK: Array<{
  kanji: string;
  meaning: string;
  onyomi: string;
  kunyomi: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}> = [
  {
    kanji: "日",
    meaning: "Sun / Day",
    onyomi: "ニチ, ジツ",
    kunyomi: "ひ, -び, -か",
    question: "What is the primary meaning of the kanji 「日」?",
    options: ["Sun / Day", "Moon / Month", "Tree / Wood", "Fire"],
    answer: "Sun / Day",
    explanation: "「日」(nichi/hi) represents the Sun or a Day. e.g. 日本 (Nihon / Japan).",
  },
  {
    kanji: "水",
    meaning: "Water",
    onyomi: "スイ",
    kunyomi: "みず",
    question: "What is the Onyomi (Chinese-derived reading) of 「水」 (Water)?",
    options: ["スイ (SUI)", "モク (MOKU)", "カ (KA)", "キン (KIN)"],
    answer: "スイ (SUI)",
    explanation: "「水」 has Kunyomi 'みず' (mizu) and Onyomi 'スイ' (sui, as in 水曜日 sui-youbi / Wednesday).",
  },
  {
    kanji: "山",
    meaning: "Mountain",
    onyomi: "サン, ザン",
    kunyomi: "やま",
    question: "How is 「富士山」 read in Japanese?",
    options: ["ふじさん (Fujisan)", "ふじやま (Fujiyama)", "ふじかわ (Fujikawa)", "ふじうみ (Fujiumi)"],
    answer: "ふじさん (Fujisan)",
    explanation: "富士山 is pronounced ふじさん (Fujisan) using the Onyomi 'サン'.",
  },
  {
    kanji: "友",
    meaning: "Friend",
    onyomi: "ユウ",
    kunyomi: "とも",
    question: "What is the Kunyomi reading for 「友」 in 「友達」?",
    options: ["とも (tomo)", "ゆう (yuu)", "あい (ai)", "ひと (hito)"],
    answer: "とも (tomo)",
    explanation: "「友達」 is pronounced ともだち (tomodachi), where 友 is read as とも (tomo).",
  },
  {
    kanji: "学",
    meaning: "Study / Learning",
    onyomi: "ガク",
    kunyomi: "まな・ぶ",
    question: "Which word means 'Student' in Japanese?",
    options: ["学生 (がくせい)", "先生 (せんせい)", "学校 (がっこう)", "大学 (だいがく)"],
    answer: "学生 (がくせい)",
    explanation: "「学生」(gakusei) combines 学 (learning) and 生 (person/life) to mean student.",
  },
  {
    kanji: "食",
    meaning: "Eat / Food",
    onyomi: "ショク",
    kunyomi: "た・べる, く・う",
    question: "What is the verb form of 「食」 meaning 'to eat'?",
    options: ["食べる (たべる)", "飲む (のむ)", "見る (みる)", "行く (いく)"],
    answer: "食べる (たべる)",
    explanation: "「食べる」(taberu) is the Ichidan verb for 'to eat'.",
  },
];

const VOCAB_BANK: Array<{
  word: string;
  reading: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}> = [
  {
    word: "猫",
    reading: "ねこ (neko)",
    question: "What does 「ねこ」(neko) mean in English?",
    options: ["Cat", "Dog", "Bird", "Fish"],
    answer: "Cat",
    explanation: "「猫 / ねこ」(neko) is the Japanese word for cat.",
  },
  {
    word: "図書館",
    reading: "としょかん (toshokan)",
    question: "Where do you go if someone says: 「図書館へ本を借りに行きます」?",
    options: ["Library", "Bookstore", "Post Office", "Hospital"],
    answer: "Library",
    explanation: "「図書館」(toshokan) means library.",
  },
  {
    word: "美味しい",
    reading: "おいしい (oishii)",
    question: "Choose the antonym (opposite meaning) of 「美味しい」(delicious):",
    options: ["まずい (mazui / unpalatable)", "甘い (amai / sweet)", "辛い (karai / spicy)", "高い (takai / expensive)"],
    answer: "まずい (mazui / unpalatable)",
    explanation: "「まずい」(mazui) means bad-tasting or unpalatable, the opposite of おいしい.",
  },
  {
    word: "約束",
    reading: "やくそく (yakusoku)",
    question: "What is the meaning of the word 「約束」(yakusoku)?",
    options: ["Promise / Appointment", "Memory", "Dream", "Rule"],
    answer: "Promise / Appointment",
    explanation: "「約束」(yakusoku) means a promise or an appointment. e.g. 約束を守る (to keep a promise).",
  },
  {
    word: "空港",
    reading: "くうこう (kuukou)",
    question: "Which vehicle is associated with 「空港」(kuukou)?",
    options: ["飛行機 (Airplane)", "新幹線 (Bullet Train)", "船 (Ship)", "自転車 (Bicycle)"],
    answer: "飛行機 (Airplane)",
    explanation: "「空港」(kuukou) means airport, where airplanes (飛行機 hikouki) arrive and depart.",
  },
];

const CULTURE_BANK: Array<{
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}> = [
  {
    question: "Which polite phrase is traditionally said BEFORE eating a meal in Japan?",
    options: ["いただきます (Itadakimasu)", "ごちそうさまでした (Gochisousama deshita)", "お邪魔します (Ojamashimasu)", "行ってきます (Ittekimasu)"],
    answer: "いただきます (Itadakimasu)",
    explanation: "「いただきます」(Itadakimasu) literally means 'I humbly receive' and is said before eating.",
  },
  {
    question: "What is the traditional Japanese art of paper folding called?",
    options: ["折り紙 (Origami)", "生け花 (Ikebana)", "書道 (Shodou)", "浮世絵 (Ukiyo-e)"],
    answer: "折り紙 (Origami)",
    explanation: "折り紙 (Origami) combines 'ori' (folding) and 'kami' (paper).",
  },
  {
    question: "What does the Japanese proverb 「猿も木から落ちる」 (Saru mo ki kara ochiru) mean?",
    options: [
      "Even experts make mistakes ('Even monkeys fall from trees')",
      "Practice makes perfect",
      "Patience is a virtue",
      "Actions speak louder than words"
    ],
    answer: "Even experts make mistakes ('Even monkeys fall from trees')",
    explanation: "This classic proverb reminds us that anyone, even someone skilled like a monkey climbing trees, can occasionally fail.",
  },
  {
    question: "What is the four-character idiom 「一期一会」 (Ichigo Ichie) translated as?",
    options: ["Treasure once-in-a-lifetime encounters", "Work hard every day", "United as one", "Calm like a mirror"],
    answer: "Treasure once-in-a-lifetime encounters",
    explanation: "一期一会 (Ichigo Ichie), rooted in the Japanese Tea Ceremony, emphasizes treating every meeting as precious and unique.",
  },
];

/**
 * Generates 10 deterministic daily questions for any given date string YYYY-MM-DD.
 */
export function generateDailyChallenge(dateStr: string): DailyQuestion[] {
  const prng = createPRNG(dateStr);
  const questions: DailyQuestion[] = [];

  // 1 & 2: Kanji Questions (2 questions)
  const shuffledKanji = seededShuffle(KANJI_BANK, prng);
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

  // 3, 4, 5: Vocabulary Questions (3 questions)
  const shuffledVocab = seededShuffle(VOCAB_BANK, prng);
  questions.push({
    id: `q-vocab-1-${dateStr}`,
    category: "vocabulary",
    typeLabel: "Vocabulary Meaning",
    prompt: shuffledVocab[0].question,
    options: seededShuffle(shuffledVocab[0].options, prng),
    correctAnswer: shuffledVocab[0].answer,
    explanation: shuffledVocab[0].explanation,
    details: { reading: shuffledVocab[0].reading },
  });

  questions.push({
    id: `q-vocab-2-${dateStr}`,
    category: "vocabulary",
    typeLabel: "Vocabulary in Context",
    prompt: shuffledVocab[1].question,
    options: seededShuffle(shuffledVocab[1].options, prng),
    correctAnswer: shuffledVocab[1].answer,
    explanation: shuffledVocab[1].explanation,
    details: { reading: shuffledVocab[1].reading },
  });

  questions.push({
    id: `q-vocab-3-${dateStr}`,
    category: "vocabulary",
    typeLabel: "Vocabulary Nuance",
    prompt: shuffledVocab[2].question,
    options: seededShuffle(shuffledVocab[2].options, prng),
    correctAnswer: shuffledVocab[2].answer,
    explanation: shuffledVocab[2].explanation,
    details: { reading: shuffledVocab[2].reading },
  });

  // 6 & 7: Grammar & Particles (2 questions)
  const shuffledParticles = seededShuffle(PARTICLE_EXERCISES, prng);
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

  const shuffledGrammar = seededShuffle(n5Grammar, prng);
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

  // 8 & 9: Audio & Dictation (2 questions)
  const shuffledDictation = seededShuffle(DICTATION_EXERCISES, prng);
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

  // 10: Japanese Culture / Idiom / Proverb (1 question)
  const shuffledCulture = seededShuffle(CULTURE_BANK, prng);
  questions.push({
    id: `q-culture-1-${dateStr}`,
    category: "culture",
    typeLabel: "Culture & Proverb Dojo",
    prompt: shuffledCulture[0].question,
    options: seededShuffle(shuffledCulture[0].options, prng),
    correctAnswer: shuffledCulture[0].answer,
    explanation: shuffledCulture[0].explanation,
  });

  return questions;
}
