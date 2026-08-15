export interface StoryWordToken {
  text: string;
  furigana?: string;
  meaning?: string;
  grammarHint?: string;
}

export interface StorySentence {
  id: string;
  tokens: StoryWordToken[];
  fullJapanese: string;
  fullEnglish: string;
}

export interface StoryQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ReadingStory {
  id: string;
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  titleJapanese: string;
  titleRomaji: string;
  titleEnglish: string;
  description: string;
  readTime: string;
  pixelArtEmoji: string;
  category: string;
  isLocked?: boolean;
  sentences: StorySentence[];
  questions: StoryQuizQuestion[];
}

export const readingStories: ReadingStory[] = [
  {
    id: "story_tama_me",
    level: "N5",
    titleJapanese: "タマと わたし",
    titleRomaji: "Tama to Watashi",
    titleEnglish: "Tama and Me",
    description: "A short story about a student and her friendly cat Tama.",
    readTime: "~2 min",
    pixelArtEmoji: "🐱",
    category: "Daily Life",
    isLocked: false,
    sentences: [
      {
        id: "s1",
        fullJapanese: "わたしは まいあさ 七時（しちじ）に おきます。",
        fullEnglish: "I wake up at 7:00 every morning.",
        tokens: [
          { text: "わたし", meaning: "I / me" },
          { text: "は", grammarHint: "Topic marker particle" },
          { text: "まいあさ", meaning: "every morning" },
          { text: "七時", furigana: "しちじ", meaning: "7 o'clock" },
          { text: "に", grammarHint: "Time particle" },
          { text: "おきます", meaning: "to wake up (polite)" },
          { text: "。" },
        ],
      },
      {
        id: "s2",
        fullJapanese: "わたしの ねこは タマです。",
        fullEnglish: "My cat's name is Tama.",
        tokens: [
          { text: "わたし", meaning: "I" },
          { text: "の", grammarHint: "Possessive particle 's" },
          { text: "ねこ", meaning: "cat" },
          { text: "は", grammarHint: "Topic marker" },
          { text: "タマ", meaning: "Tama (name)" },
          { text: "です", meaning: "is / to be (polite)" },
          { text: "。" },
        ],
      },
      {
        id: "s3",
        fullJapanese: "タマは しろくて、とても かわいいです。",
        fullEnglish: "Tama is white and very cute.",
        tokens: [
          { text: "タマ", meaning: "Tama" },
          { text: "は", grammarHint: "Topic marker" },
          { text: "しろくて", meaning: "white (te-form adjective)" },
          { text: "、" },
          { text: "とても", meaning: "very" },
          { text: "かわいい", meaning: "cute" },
          { text: "です", meaning: "is (polite)" },
          { text: "。" },
        ],
      },
      {
        id: "s4",
        fullJapanese: "タマは さかなと みるくが だいすきです。",
        fullEnglish: "Tama loves fish and milk.",
        tokens: [
          { text: "タマ", meaning: "Tama" },
          { text: "は", grammarHint: "Topic marker" },
          { text: "さかな", meaning: "fish" },
          { text: "と", grammarHint: "And / with" },
          { text: "みるく", meaning: "milk" },
          { text: "が", grammarHint: "Subject marker for likes" },
          { text: "だいすき", meaning: "love / like very much" },
          { text: "です", meaning: "is" },
          { text: "。" },
        ],
      },
      {
        id: "s5",
        fullJapanese: "いっしょに こうえんへ いきます。",
        fullEnglish: "We go to the park together.",
        tokens: [
          { text: "いっしょに", meaning: "together" },
          { text: "こうえん", meaning: "park" },
          { text: "へ", grammarHint: "Direction particle 'to'" },
          { text: "いきます", meaning: "to go (polite)" },
          { text: "。" },
        ],
      },
    ],
    questions: [
      {
        question: "何時に おきますか？ (What time do they wake up?)",
        options: ["六時 (6:00)", "七時 (7:00)", "八時 (8:00)", "九時 (9:00)"],
        correctIndex: 1,
        explanation: "The story states: わたしは まいあさ 七時（しちじ）に おきます (I wake up at 7:00 every morning).",
      },
      {
        question: "タマは なにが すきですか？ (What does Tama like?)",
        options: ["にく (Meat)", "さかなと みるく (Fish and Milk)", "ぱん (Bread)", "おちゃ (Tea)"],
        correctIndex: 1,
        explanation: "The story states: タマは さかなと みるくが だいすきです (Tama loves fish and milk).",
      },
    ],
  },
  {
    id: "story_my_house",
    level: "N5",
    titleJapanese: "わたしの いえ",
    titleRomaji: "Watashi no Ie",
    titleEnglish: "My House",
    description: "A short story about the rooms and daily objects inside a student's home.",
    readTime: "~2 min",
    pixelArtEmoji: "🏠",
    category: "Home",
    isLocked: false,
    sentences: [
      {
        id: "h1",
        fullJapanese: "これは わたしの いえです。",
        fullEnglish: "This is my house.",
        tokens: [
          { text: "これ", meaning: "this" },
          { text: "は", grammarHint: "Topic marker" },
          { text: "わたし", meaning: "I" },
          { text: "の", grammarHint: "Possessive 's" },
          { text: "いえ", meaning: "house / home" },
          { text: "です", meaning: "is" },
          { text: "。" },
        ],
      },
      {
        id: "h2",
        fullJapanese: "いえの なかに へやが 三つ（みっつ）あります。",
        fullEnglish: "Inside the house, there are three rooms.",
        tokens: [
          { text: "いえ", meaning: "house" },
          { text: "の", grammarHint: "Possessive / connection" },
          { text: "なか", meaning: "inside" },
          { text: "に", grammarHint: "Location particle" },
          { text: "へや", meaning: "room" },
          { text: "が", grammarHint: "Subject marker" },
          { text: "三つ", furigana: "みっつ", meaning: "three (things)" },
          { text: "あります", meaning: "there is / exist (inanimate)" },
          { text: "。" },
        ],
      },
      {
        id: "h3",
        fullJapanese: "わたしの へやには つくえと ほん棚（だな）があります。",
        fullEnglish: "In my room, there is a desk and a bookshelf.",
        tokens: [
          { text: "わたし", meaning: "I" },
          { text: "の", grammarHint: "Possessive" },
          { text: "へや", meaning: "room" },
          { text: "には", grammarHint: "In (location topic)" },
          { text: "つくえ", meaning: "desk" },
          { text: "と", grammarHint: "And" },
          { text: "ほん棚", furigana: "ほんだな", meaning: "bookshelf" },
          { text: "が", grammarHint: "Subject marker" },
          { text: "あります", meaning: "there is" },
          { text: "。" },
        ],
      },
      {
        id: "h4",
        fullJapanese: "まいにち つくえで にほんごを べんきょうします。",
        fullEnglish: "Every day, I study Japanese at my desk.",
        tokens: [
          { text: "まいにち", meaning: "every day" },
          { text: "つくえ", meaning: "desk" },
          { text: "で", grammarHint: "Action location particle 'at'" },
          { text: "にほんご", meaning: "Japanese language" },
          { text: "を", grammarHint: "Direct object marker" },
          { text: "べんきょうします", meaning: "to study (polite)" },
          { text: "。" },
        ],
      },
    ],
    questions: [
      {
        question: "へやは いくつ ありますか？ (How many rooms are there?)",
        options: ["一つ (1)", "二つ (2)", "三つ (3)", "四つ (4)"],
        correctIndex: 2,
        explanation: "The story states: へやが 三つ（みっつ）あります (There are 3 rooms).",
      },
    ],
  },
  {
    id: "story_morning_routine",
    level: "N5",
    titleJapanese: "朝の様子",
    titleRomaji: "Asa no Yousu",
    titleEnglish: "Daily Morning",
    description: "A short story about a student's morning routine before going to school.",
    readTime: "~2 min",
    pixelArtEmoji: "🌅",
    category: "Daily Life",
    isLocked: false,
    sentences: [
      {
        id: "m1",
        fullJapanese: "あさ、ごはんを たべて、おちゃを のみます。",
        fullEnglish: "In the morning, I eat a meal and drink green tea.",
        tokens: [
          { text: "あさ", meaning: "morning" },
          { text: "、" },
          { text: "ごはん", meaning: "meal / rice" },
          { text: "を", grammarHint: "Object marker" },
          { text: "たべて", meaning: "eat (te-form)" },
          { text: "、" },
          { text: "おちゃ", meaning: "green tea" },
          { text: "を", grammarHint: "Object marker" },
          { text: "のみます", meaning: "to drink (polite)" },
          { text: "。" },
        ],
      },
      {
        id: "m2",
        fullJapanese: "八時半（はちじはん）に がっこうへ いきます。",
        fullEnglish: "At 8:30, I go to school.",
        tokens: [
          { text: "八時半", furigana: "はちじはん", meaning: "8:30" },
          { text: "に", grammarHint: "Time particle" },
          { text: "がっこう", meaning: "school" },
          { text: "へ", grammarHint: "Direction 'to'" },
          { text: "いきます", meaning: "to go" },
          { text: "。" },
        ],
      },
    ],
    questions: [
      {
        question: "何時に がっこうへ いきますか？ (What time do they go to school?)",
        options: ["七時 (7:00)", "八時 (8:00)", "八時半 (8:30)", "九時 (9:00)"],
        correctIndex: 2,
        explanation: "The story states: 八時半（はちじはん）に がっこうへ いきます。",
      },
    ],
  },
  {
    id: "story_ramen_shop",
    level: "N4",
    titleJapanese: "ラーメン屋で",
    titleRomaji: "Raamenya de",
    titleEnglish: "At the Ramen Shop",
    description: "Ordering a hot bowl of ramen in Tokyo with friendly dialogue.",
    readTime: "~3 min",
    pixelArtEmoji: "🍜",
    category: "Food",
    isLocked: false,
    sentences: [
      {
        id: "r1",
        fullJapanese: "駅の近くにおいしいラーメン屋があります。",
        fullEnglish: "There is a delicious ramen shop near the train station.",
        tokens: [
          { text: "駅", furigana: "えき", meaning: "station" },
          { text: "の", grammarHint: "Possessive" },
          { text: "近く", furigana: "ちかく", meaning: "nearby / vicinity" },
          { text: "に", grammarHint: "Location particle" },
          { text: "おいしい", meaning: "delicious" },
          { text: "ラーメン屋", furigana: "ラーメンや", meaning: "ramen restaurant" },
          { text: "が", grammarHint: "Subject marker" },
          { text: "あります", meaning: "there is" },
          { text: "。" },
        ],
      },
      {
        id: "r2",
        fullJapanese: "「いらっしゃいませ！何名様ですか？」と店員が言いました。",
        fullEnglish: "\"Welcome! How many people?\" the clerk asked.",
        tokens: [
          { text: "「いらっしゃいませ", meaning: "welcome (shop greeting)" },
          { text: "！" },
          { text: "何名様", furigana: "なんめいさま", meaning: "how many people (polite)" },
          { text: "ですか", meaning: "is it? (question)" },
          { text: "？」と", grammarHint: "Quotation particle" },
          { text: "店員", furigana: "てんいん", meaning: "clerk / staff" },
          { text: "が", grammarHint: "Subject" },
          { text: "言いました", furigana: "いいました", meaning: "said" },
          { text: "。" },
        ],
      },
    ],
    questions: [
      {
        question: "ラーメン屋は どこに ありますか？ (Where is the ramen shop?)",
        options: ["駅の近く (Near the station)", "学校の中 (Inside the school)", "公園の前 (In front of the park)", "家の中 (Inside the house)"],
        correctIndex: 0,
        explanation: "The story states: 駅の近くにおいしいラーメン屋があります。",
      },
    ],
  },
];
