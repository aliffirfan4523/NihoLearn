// Rich datasets for Vocabulary & Reading Practice Suite

export interface ClozeExercise {
  id: string;
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  sentenceWithBlank: string; // e.g. "毎朝コーヒーを [___] ます。"
  fullSentence: string;      // "毎朝コーヒーを飲みます。"
  reading: string;           // "まいあさ こーひーを のみます。"
  englishTranslation: string;// "I drink coffee every morning."
  targetWord: {
    word: string;
    reading: string;
    meaning: string;
  };
  distractors: Array<{
    word: string;
    reading: string;
    meaning: string;
  }>;
  hint: string;
}

export const CLOZE_DATASET: ClozeExercise[] = [
  {
    id: "cloze-1",
    level: "N5",
    sentenceWithBlank: "毎朝７時に [___] ます。",
    fullSentence: "毎朝７時に起きます。",
    reading: "まいあさ ななじに おきます。",
    englishTranslation: "I wake up at 7 o'clock every morning.",
    targetWord: { word: "起き", reading: "おき", meaning: "to wake up / get up" },
    distractors: [
      { word: "食べ", reading: "たべ", meaning: "to eat" },
      { word: "飲み", reading: "のみ", meaning: "to drink" },
      { word: "行き", reading: "いき", meaning: "to go" },
    ],
    hint: "Think about what action you do first thing in the morning when opening your eyes.",
  },
  {
    id: "cloze-2",
    level: "N5",
    sentenceWithBlank: "図書館で静かに本を [___] ます。",
    fullSentence: "図書館で静かに本を読みます。",
    reading: "としょかんで しずかに ほんを よみます。",
    englishTranslation: "I read books quietly at the library.",
    targetWord: { word: "読み", reading: "よみ", meaning: "to read" },
    distractors: [
      { word: "書き", reading: "かき", meaning: "to write" },
      { word: "買い", reading: "かい", meaning: "to buy" },
      { word: "聞き", reading: "きき", meaning: "to listen / hear" },
    ],
    hint: "An action you perform with books (本) at a library.",
  },
  {
    id: "cloze-3",
    level: "N5",
    sentenceWithBlank: "のどが渇いたので、冷たい水を [___] たいです。",
    fullSentence: "のどが渇いたので、冷たい水を飲みたいです。",
    reading: "のどがかわいたので、つめたいみずを のみたいです。",
    englishTranslation: "Because I'm thirsty, I want to drink cold water.",
    targetWord: { word: "飲み", reading: "のみ", meaning: "to drink" },
    distractors: [
      { word: "食べ", reading: "たべ", meaning: "to eat" },
      { word: "作り", reading: "つくり", meaning: "to make" },
      { word: "買い", reading: "かい", meaning: "to buy" },
    ],
    hint: "The action done with water (水) when thirsty.",
  },
  {
    id: "cloze-4",
    level: "N5",
    sentenceWithBlank: "駅の近くの店で新しい靴を [___] ました。",
    fullSentence: "駅の近くの店で新しい靴を買いました。",
    reading: "えきのちかくのみせで あたらしいくつを かいました。",
    englishTranslation: "I bought new shoes at a shop near the station.",
    targetWord: { word: "買い", reading: "かい", meaning: "to buy" },
    distractors: [
      { word: "売り", reading: "うり", meaning: "to sell" },
      { word: "貸し", reading: "かし", meaning: "to lend" },
      { word: "待ち", reading: "まち", meaning: "to wait" },
    ],
    hint: "Purchasing something at a store (店).",
  },
  {
    id: "cloze-5",
    level: "N5",
    sentenceWithBlank: "昨日の夜は疲れていたので、早く [___] ました。",
    fullSentence: "昨日の夜は疲れていたので、早く寝ました。",
    reading: "きのうのよるは つかれていたので、はやく ねました。",
    englishTranslation: "Because I was tired last night, I went to sleep early.",
    targetWord: { word: "寝", reading: "ね", meaning: "to sleep / go to bed" },
    distractors: [
      { word: "出", reading: "で", meaning: "to leave / exit" },
      { word: "歩き", reading: "あるき", meaning: "to walk" },
      { word: "働き", reading: "はたらき", meaning: "to work" },
    ],
    hint: "What you do at night when you are tired (疲れている).",
  },
  {
    id: "cloze-6",
    level: "N4",
    sentenceWithBlank: "日本語が上手に [___] ように、毎日練習しています。",
    fullSentence: "日本語が上手に話せるように、毎日練習しています。",
    reading: "にほんごが じょうずに はなせるように、まいにち れんしゅうしています。",
    englishTranslation: "I practice every day so that I can speak Japanese fluently.",
    targetWord: { word: "話せる", reading: "はなせる", meaning: "to be able to speak" },
    distractors: [
      { word: "走れる", reading: "はしれる", meaning: "to be able to run" },
      { word: "泳げる", reading: "およげる", meaning: "to be able to swim" },
      { word: "飛べる", reading: "とべる", meaning: "to be able to fly" },
    ],
    hint: "Language ability (日本語が上手に...).",
  },
  {
    id: "cloze-7",
    level: "N4",
    sentenceWithBlank: "雨が激しく [___] 始めたので、傘をさしました。",
    fullSentence: "雨が激しく降り始めたので、傘をさしました。",
    reading: "あめが はげしく ふりはじめたので、かさを さしました。",
    englishTranslation: "Because it began raining heavily, I opened my umbrella.",
    targetWord: { word: "降り", reading: "ふり", meaning: "to fall (rain/snow)" },
    distractors: [
      { word: "鳴り", reading: "なり", meaning: "to ring / chime" },
      { word: "吹い", reading: "ふい", meaning: "to blow (wind)" },
      { word: "光り", reading: "ひかり", meaning: "to shine / flash" },
    ],
    hint: "The verb used specifically for rain (雨) or snow (雪).",
  },
  {
    id: "cloze-8",
    level: "N4",
    sentenceWithBlank: "約束の時間を [___] ないように、アラームをセットした。",
    fullSentence: "約束の時間を忘れないように、アラームをセットした。",
    reading: "やくそくのじかんを わすれないように、あらーむを せっとした。",
    englishTranslation: "I set an alarm so that I would not forget the appointment time.",
    targetWord: { word: "忘れ", reading: "わすれ", meaning: "to forget" },
    distractors: [
      { word: "守ら", reading: "まもら", meaning: "to protect / keep" },
      { word: "遅れ", reading: "おくれ", meaning: "to be late" },
      { word: "失わ", reading: "うしなわ", meaning: "to lose" },
    ],
    hint: "To forget information or an appointment.",
  },
  {
    id: "cloze-9",
    level: "N3",
    sentenceWithBlank: "このプロジェクトを [___] ために、チーム全員で協力した。",
    fullSentence: "このプロジェクトを成功させるために、チーム全員で協力した。",
    reading: "このぷろじぇくとを せいこうさせるために、ちーむぜんいんで きょうりょくした。",
    englishTranslation: "The entire team cooperated to make this project a success.",
    targetWord: { word: "成功させる", reading: "せいこうさせる", meaning: "to make successful" },
    distractors: [
      { word: "失敗する", reading: "しっぱいする", meaning: "to fail" },
      { word: "延期する", reading: "えんきする", meaning: "to postpone" },
      { word: "中断する", reading: "ちゅうだんする", meaning: "to interrupt" },
    ],
    hint: "A positive outcome for a group effort (協力).",
  },
  {
    id: "cloze-10",
    level: "N3",
    sentenceWithBlank: "最新の技術を [___] して、新しい製品を開発した。",
    fullSentence: "最新の技術を応用して、新しい製品を開発した。",
    reading: "さいしんのぎじゅつを おうようして、あたらしいせいひんを かいはつした。",
    englishTranslation: "We developed a new product by applying cutting-edge technology.",
    targetWord: { word: "応用", reading: "おうよう", meaning: "practical application" },
    distractors: [
      { word: "拒否", reading: "きょひ", meaning: "rejection / refusal" },
      { word: "破壊", reading: "はかい", meaning: "destruction" },
      { word: "批判", reading: "ひはん", meaning: "criticism" },
    ],
    hint: "Applying or adapting technology into a product.",
  },
];

// Antonyms & Synonyms for Word Association
export interface WordPair {
  id: string;
  type: "antonym" | "synonym" | "theme";
  themeCategory?: string;
  wordA: {
    kanji: string;
    reading: string;
    romaji: string;
    meaning: string;
  };
  wordB: {
    kanji: string;
    reading: string;
    romaji: string;
    meaning: string;
  };
  relationLabel: string;
  level: "N5" | "N4" | "N3";
}

export const WORD_PAIRS: WordPair[] = [
  // Antonyms (対義語)
  {
    id: "pair-1",
    type: "antonym",
    level: "N5",
    relationLabel: "Opposites (Antonyms)",
    wordA: { kanji: "大きい", reading: "おおきい", romaji: "ookii", meaning: "Big / Large" },
    wordB: { kanji: "小さい", reading: "ちいさい", romaji: "chiisai", meaning: "Small / Little" },
  },
  {
    id: "pair-2",
    type: "antonym",
    level: "N5",
    relationLabel: "Opposites (Antonyms)",
    wordA: { kanji: "高い", reading: "たかい", romaji: "takai", meaning: "Expensive / High" },
    wordB: { kanji: "安い", reading: "やすい", romaji: "yasui", meaning: "Cheap / Inexpensive" },
  },
  {
    id: "pair-3",
    type: "antonym",
    level: "N5",
    relationLabel: "Opposites (Antonyms)",
    wordA: { kanji: "暑い", reading: "あつい", romaji: "atsui", meaning: "Hot (Weather)" },
    wordB: { kanji: "寒い", reading: "さむい", romaji: "samui", meaning: "Cold (Weather)" },
  },
  {
    id: "pair-4",
    type: "antonym",
    level: "N5",
    relationLabel: "Opposites (Antonyms)",
    wordA: { kanji: "行く", reading: "いく", romaji: "iku", meaning: "To go" },
    wordB: { kanji: "来る", reading: "くる", romaji: "kuru", meaning: "To come" },
  },
  {
    id: "pair-5",
    type: "antonym",
    level: "N5",
    relationLabel: "Opposites (Antonyms)",
    wordA: { kanji: "買う", reading: "かう", romaji: "kau", meaning: "To buy" },
    wordB: { kanji: "売る", reading: "うる", romaji: "uru", meaning: "To sell" },
  },
  {
    id: "pair-6",
    type: "antonym",
    level: "N5",
    relationLabel: "Opposites (Antonyms)",
    wordA: { kanji: "上", reading: "うえ", romaji: "ue", meaning: "Above / Top" },
    wordB: { kanji: "下", reading: "した", romaji: "shita", meaning: "Below / Under" },
  },
  {
    id: "pair-7",
    type: "antonym",
    level: "N5",
    relationLabel: "Opposites (Antonyms)",
    wordA: { kanji: "前", reading: "まえ", romaji: "mae", meaning: "Front / Before" },
    wordB: { kanji: "後ろ", reading: "うしろ", romaji: "ushiro", meaning: "Back / Behind" },
  },
  {
    id: "pair-8",
    type: "antonym",
    level: "N4",
    relationLabel: "Opposites (Antonyms)",
    wordA: { kanji: "始める", reading: "はじめる", romaji: "hajimeru", meaning: "To begin / start" },
    wordB: { kanji: "終わる", reading: "おわる", romaji: "owaru", meaning: "To end / finish" },
  },
  {
    id: "pair-9",
    type: "antonym",
    level: "N4",
    relationLabel: "Opposites (Antonyms)",
    wordA: { kanji: "強い", reading: "つよい", romaji: "tsuyoi", meaning: "Strong / Powerful" },
    wordB: { kanji: "弱い", reading: "よわい", romaji: "yowai", meaning: "Weak / Fragile" },
  },
  {
    id: "pair-10",
    type: "antonym",
    level: "N4",
    relationLabel: "Opposites (Antonyms)",
    wordA: { kanji: "開ける", reading: "あける", romaji: "akeru", meaning: "To open" },
    wordB: { kanji: "閉める", reading: "しめる", romaji: "shimeru", meaning: "To close" },
  },
  {
    id: "pair-11",
    type: "antonym",
    level: "N3",
    relationLabel: "Opposites (Antonyms)",
    wordA: { kanji: "成功", reading: "せいこう", romaji: "seikou", meaning: "Success" },
    wordB: { kanji: "失敗", reading: "しっぱい", romaji: "shippai", meaning: "Failure" },
  },
  {
    id: "pair-12",
    type: "antonym",
    level: "N3",
    relationLabel: "Opposites (Antonyms)",
    wordA: { kanji: "増加", reading: "ぞうか", romaji: "zouka", meaning: "Increase / Growth" },
    wordB: { kanji: "減少", reading: "げんしょう", romaji: "genshou", meaning: "Decrease / Reduction" },
  },
  // Synonyms (類義語)
  {
    id: "syn-1",
    type: "synonym",
    level: "N5",
    relationLabel: "Similar Meaning (Synonyms)",
    wordA: { kanji: "綺麗", reading: "きれい", romaji: "kirei", meaning: "Pretty / Clean" },
    wordB: { kanji: "美しい", reading: "うつくしい", romaji: "utsukushii", meaning: "Beautiful" },
  },
  {
    id: "syn-2",
    type: "synonym",
    level: "N4",
    relationLabel: "Similar Meaning (Synonyms)",
    wordA: { kanji: "大切", reading: "たいせつ", romaji: "taisetsu", meaning: "Important / Precious" },
    wordB: { kanji: "大事", reading: "だいじ", romaji: "daiji", meaning: "Important / Serious" },
  },
  {
    id: "syn-3",
    type: "synonym",
    level: "N4",
    relationLabel: "Similar Meaning (Synonyms)",
    wordA: { kanji: "急に", reading: "きゅうに", romaji: "kyuuni", meaning: "Suddenly / Abruptly" },
    wordB: { kanji: "突然", reading: "とつぜん", romaji: "totsuzen", meaning: "Suddenly / Unexpectedly" },
  },
];

// Graded Reading Passages for Furigana Removal Drill
export interface FuriganaPassage {
  id: string;
  level: "N5" | "N4" | "N3";
  title: string;
  category: string;
  readTime: string;
  summary: string;
  sentences: Array<{
    id: string;
    japanese: string;
    translation: string;
    tokens: Array<{
      surface: string;
      reading?: string;
      isKanji?: boolean;
      meaning?: string;
    }>;
  }>;
  comprehensionQuestions: Array<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
}

export const FURIGANA_PASSAGES: FuriganaPassage[] = [
  {
    id: "furi-1",
    level: "N5",
    title: "週末の散歩 (Weekend Walk)",
    category: "Daily Life",
    readTime: "2 min",
    summary: "A peaceful Saturday walk through the neighbourhood park and local bakery.",
    sentences: [
      {
        id: "s1",
        japanese: "土曜日の朝、公園へ散歩に行きました。",
        translation: "On Saturday morning, I went for a walk to the park.",
        tokens: [
          { surface: "土曜日", reading: "どようび", isKanji: true, meaning: "Saturday" },
          { surface: "の" },
          { surface: "朝", reading: "あさ", isKanji: true, meaning: "Morning" },
          { surface: "、" },
          { surface: "公園", reading: "こうえん", isKanji: true, meaning: "Park" },
          { surface: "へ" },
          { surface: "散歩", reading: "さんぽ", isKanji: true, meaning: "Stroll / Walk" },
          { surface: "に" },
          { surface: "行き", reading: "いき", isKanji: true, meaning: "To go" },
          { surface: "ました。" },
        ],
      },
      {
        id: "s2",
        japanese: "天気はとても良くて、空が青かったです。",
        translation: "The weather was very nice, and the sky was blue.",
        tokens: [
          { surface: "天気", reading: "てんき", isKanji: true, meaning: "Weather" },
          { surface: "はとても" },
          { surface: "良く", reading: "よく", isKanji: true, meaning: "Good / Nice" },
          { surface: "て、" },
          { surface: "空", reading: "そら", isKanji: true, meaning: "Sky" },
          { surface: "が" },
          { surface: "青かった", reading: "あおかった", isKanji: true, meaning: "Was blue" },
          { surface: "です。" },
        ],
      },
      {
        id: "s3",
        japanese: "公園の木の下で、白い猫を見ました。",
        translation: "Under a tree in the park, I saw a white cat.",
        tokens: [
          { surface: "公園", reading: "こうえん", isKanji: true, meaning: "Park" },
          { surface: "の" },
          { surface: "木", reading: "き", isKanji: true, meaning: "Tree" },
          { surface: "の" },
          { surface: "下", reading: "した", isKanji: true, meaning: "Under" },
          { surface: "で、" },
          { surface: "白い", reading: "しろい", isKanji: true, meaning: "White" },
          { surface: "猫", reading: "ねこ", isKanji: true, meaning: "Cat" },
          { surface: "を" },
          { surface: "見", reading: "み", isKanji: true, meaning: "To see" },
          { surface: "ました。" },
        ],
      },
      {
        id: "s4",
        japanese: "帰り道に美味しいパンを買って、家で食べました。",
        translation: "On the way home, I bought delicious bread and ate it at home.",
        tokens: [
          { surface: "帰り道", reading: "かえりみち", isKanji: true, meaning: "Way back home" },
          { surface: "に" },
          { surface: "美味しい", reading: "おいしい", isKanji: true, meaning: "Delicious" },
          { surface: "パンを" },
          { surface: "買って", reading: "かって", isKanji: true, meaning: "Bought (te-form)" },
          { surface: "、" },
          { surface: "家", reading: "いえ", isKanji: true, meaning: "House / Home" },
          { surface: "で" },
          { surface: "食べ", reading: "たべ", isKanji: true, meaning: "Ate" },
          { surface: "ました。" },
        ],
      },
    ],
    comprehensionQuestions: [
      {
        question: "木の下で何を見ましたか？ (What was seen under the tree?)",
        options: ["白い犬 (White dog)", "白い猫 (White cat)", "黒い鳥 (Black bird)", "小さい花 (Small flower)"],
        correctIndex: 1,
        explanation: "The passage mentions: 「公園の木の下で、白い猫を見ました。」",
      },
      {
        question: "帰り道に何を買いましたか？ (What was bought on the way home?)",
        options: ["お茶 (Tea)", "ケーキ (Cake)", "パン (Bread)", "本 (Book)"],
        correctIndex: 2,
        explanation: "The text says: 「帰り道に美味しいパンを買って...」",
      },
    ],
  },
  {
    id: "furi-2",
    level: "N4",
    title: "駅前の新しい図書館 (The New Library by the Station)",
    category: "Community",
    readTime: "3 min",
    summary: "Discovering modern reading rooms, digital archives, and a rooftop garden at the city library.",
    sentences: [
      {
        id: "s1",
        japanese: "先週、駅の前に新しい市立図書館が開館しました。",
        translation: "Last week, a new municipal library opened in front of the station.",
        tokens: [
          { surface: "先週", reading: "せんしゅう", isKanji: true, meaning: "Last week" },
          { surface: "、" },
          { surface: "駅", reading: "えき", isKanji: true, meaning: "Station" },
          { surface: "の" },
          { surface: "前", reading: "まえ", isKanji: true, meaning: "Front" },
          { surface: "に" },
          { surface: "新しい", reading: "あたらしい", isKanji: true, meaning: "New" },
          { surface: "市立図書館", reading: "しりつとしょかん", isKanji: true, meaning: "City library" },
          { surface: "が" },
          { surface: "開館", reading: "かいかん", isKanji: true, meaning: "Opening of a building/hall" },
          { surface: "しました。" },
        ],
      },
      {
        id: "s2",
        japanese: "建物の中は広くて明るく、たくさんの学習机があります。",
        translation: "The interior of the building is spacious and bright, with many study desks.",
        tokens: [
          { surface: "建物", reading: "たてもの", isKanji: true, meaning: "Building" },
          { surface: "の" },
          { surface: "中", reading: "なか", isKanji: true, meaning: "Inside" },
          { surface: "は" },
          { surface: "広く", reading: "ひろく", isKanji: true, meaning: "Spacious / Wide" },
          { surface: "て" },
          { surface: "明るく", reading: "あかるく", isKanji: true, meaning: "Bright" },
          { surface: "、たくさんの" },
          { surface: "学習机", reading: "がくしゅうづくえ", isKanji: true, meaning: "Study desks" },
          { surface: "が" },
          { surface: "あります。" },
        ],
      },
      {
        id: "s3",
        japanese: "屋上には緑豊かな庭園があり、富士山を眺めることができます。",
        translation: "On the rooftop there is a lush green garden where you can view Mount Fuji.",
        tokens: [
          { surface: "屋上", reading: "おくじょう", isKanji: true, meaning: "Rooftop" },
          { surface: "には" },
          { surface: "緑豊か", reading: "みどりゆたか", isKanji: true, meaning: "Lush green" },
          { surface: "な" },
          { surface: "庭園", reading: "ていえん", isKanji: true, meaning: "Garden" },
          { surface: "があり、" },
          { surface: "富士山", reading: "ふじさん", isKanji: true, meaning: "Mount Fuji" },
          { surface: "を" },
          { surface: "眺める", reading: "ながめる", isKanji: true, meaning: "To gaze at / view" },
          { surface: "ことができます。" },
        ],
      },
    ],
    comprehensionQuestions: [
      {
        question: "屋上で何ができますか？ (What can you do on the rooftop?)",
        options: ["本を借りる (Borrow books)", "富士山を眺める (View Mt. Fuji)", "コーヒーを飲む (Drink coffee)", "寝る (Sleep)"],
        correctIndex: 1,
        explanation: "「屋上には緑豊かな庭園があり、富士山を眺めることができます。」",
      },
    ],
  },
  {
    id: "furi-3",
    level: "N3",
    title: "伝統工芸と現代デザイン (Traditional Crafts & Modern Design)",
    category: "Culture",
    readTime: "3.5 min",
    summary: "How young artisans in Kyoto are blending Edo-era ceramics with contemporary tableware.",
    sentences: [
      {
        id: "s1",
        japanese: "京都の工房では、若い職人たちが伝統的な陶芸技術を継承しています。",
        translation: "In workshops in Kyoto, young artisans are carrying on traditional ceramic techniques.",
        tokens: [
          { surface: "京都", reading: "きょうと", isKanji: true, meaning: "Kyoto" },
          { surface: "の" },
          { surface: "工房", reading: "こうぼう", isKanji: true, meaning: "Workshop" },
          { surface: "では、" },
          { surface: "若い", reading: "わかい", isKanji: true, meaning: "Young" },
          { surface: "職人", reading: "しょくにん", isKanji: true, meaning: "Artisan / Craftsman" },
          { surface: "たちが" },
          { surface: "伝統的", reading: "でんとうてき", isKanji: true, meaning: "Traditional" },
          { surface: "な" },
          { surface: "陶芸", reading: "とうげい", isKanji: true, meaning: "Ceramics / Pottery" },
          { surface: "技術", reading: "ぎじゅつ", isKanji: true, meaning: "Technique / Skill" },
          { surface: "を" },
          { surface: "継承", reading: "けいしょう", isKanji: true, meaning: "Inheriting / Carrying on" },
          { surface: "しています。" },
        ],
      },
      {
        id: "s2",
        japanese: "彼らは古い技法を守りながら、現代の生活に合った新しい器を創り出しています。",
        translation: "While preserving old methods, they create new tableware suited to modern living.",
        tokens: [
          { surface: "彼ら", reading: "かれら", isKanji: true, meaning: "They" },
          { surface: "は" },
          { surface: "古い", reading: "ふるい", isKanji: true, meaning: "Old" },
          { surface: "技法", reading: "ぎほう", isKanji: true, meaning: "Method / Technique" },
          { surface: "を" },
          { surface: "守り", reading: "まもり", isKanji: true, meaning: "Protecting" },
          { surface: "ながら、" },
          { surface: "現代", reading: "げんだい", isKanji: true, meaning: "Modern era" },
          { surface: "の" },
          { surface: "生活", reading: "せいかつ", isKanji: true, meaning: "Life / Living" },
          { surface: "に" },
          { surface: "合った", reading: "あった", isKanji: true, meaning: "Fitting / Suited" },
          { surface: "新しい", reading: "あたらしい", isKanji: true, meaning: "New" },
          { surface: "器", reading: "うつわ", isKanji: true, meaning: "Vessel / Tableware" },
          { surface: "を" },
          { surface: "創り出して", reading: "つくりだして", isKanji: true, meaning: "Creating" },
          { surface: "います。" },
        ],
      },
    ],
    comprehensionQuestions: [
      {
        question: "若い職人たちは何をしていますか？ (What are the young artisans doing?)",
        options: [
          "海外に移住している (Migrating abroad)",
          "伝統技術を継承しながら現代に合った器を創っている (Creating modern tableware while keeping traditional craft)",
          "陶芸を辞めてデジタルアートを始めている (Quitting ceramics to start digital art)",
          "古い器だけを集めて展示している (Only collecting and exhibiting antique wares)",
        ],
        correctIndex: 1,
        explanation: "彼らは伝統的な陶芸技術を継承しながら、現代の生活に合った新しい器を創り出しています。",
      },
    ],
  },
];

// Real-world Kanji Context Snippets
export interface KanjiContextSnippet {
  id: string;
  level: "N5" | "N4" | "N3";
  domain: "Transit" | "Shopping & Food" | "Public Notice" | "Workplace & Study" | "Weather & Safety";
  domainEmoji: string;
  scenarioTitle: string;
  snippetText: string;           // Sentence or sign text e.g. "各駅停車 新宿行き がまいります。"
  targetKanji: string;           // e.g. "各駅停車"
  targetReading: string;         // e.g. "かくえきていしゃ"
  targetMeaning: string;         // e.g. "Local train (stopping at every station)"
  kanjiBreakdown: Array<{
    char: string;
    onyomi: string;
    kunyomi: string;
    meaning: string;
  }>;
  contextQuestion: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  readingQuestion: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export const KANJI_CONTEXT_DATASET: KanjiContextSnippet[] = [
  {
    id: "kc-1",
    level: "N5",
    domain: "Transit",
    domainEmoji: "🚆",
    scenarioTitle: "Train Platform Announcement Board",
    snippetText: "まもなく ２番線に 各駅停車 新宿行きが まいります。黄色い線の 内側へ お下がりください。",
    targetKanji: "各駅停車",
    targetReading: "かくえきていしゃ",
    targetMeaning: "Local train (train stopping at every single station)",
    kanjiBreakdown: [
      { char: "各", onyomi: "カク", kunyomi: "おのおの", meaning: "Each / Every" },
      { char: "駅", onyomi: "エキ", kunyomi: "-", meaning: "Station" },
      { char: "停", onyomi: "テイ", kunyomi: "と・まる", meaning: "Halt / Stop" },
      { char: "車", onyomi: "シャ", kunyomi: "くるま", meaning: "Car / Vehicle" },
    ],
    contextQuestion: {
      prompt: "What type of train service is indicated by 「各駅停車」?",
      options: [
        "Express train that skips minor stations",
        "Local train that stops at every station on the line",
        "Non-stop airport direct shuttle",
        "Freight train not carrying passengers",
      ],
      correctIndex: 1,
      explanation: "「各」(each) + 「駅」(station) + 「停車」(stopping vehicle) means a local train that stops at every single station along the route.",
    },
    readingQuestion: {
      prompt: "What is the correct reading of 「各駅停車」?",
      options: ["かくえきていしゃ", "おのおのえきどまり", "かっこくしゃてい", "かくえきとまり"],
      correctIndex: 0,
      explanation: "The On'yomi compound is pronounced 「かくえきていしゃ」 (kaku-eki-tei-sha).",
    },
  },
  {
    id: "kc-2",
    level: "N5",
    domain: "Shopping & Food",
    domainEmoji: "🍜",
    scenarioTitle: "Ramen Shop Entrance Door Notice",
    snippetText: "【営業案内】本日の 営業時間 は 11:30〜21:00 です。毎週水曜日は 定休日 となっております。",
    targetKanji: "定休日",
    targetReading: "ていきゅうび",
    targetMeaning: "Regular scheduled holiday / Closed day",
    kanjiBreakdown: [
      { char: "定", onyomi: "テイ / ジョウ", kunyomi: "さだ・める", meaning: "Fixed / Regular" },
      { char: "休", onyomi: "キュウ", kunyomi: "やす・む", meaning: "Rest / Holiday" },
      { char: "日", onyomi: "ニチ / ジツ", kunyomi: "ひ / か", meaning: "Day / Sun" },
    ],
    contextQuestion: {
      prompt: "If a shop sign states 「水曜日は 定休日」, what does it mean?",
      options: [
        "The shop offers discount prices on Wednesday",
        "Wednesday is the shop's regular closed holiday",
        "The shop is open 24 hours on Wednesday",
        "Reservations are strictly mandatory on Wednesday",
      ],
      correctIndex: 1,
      explanation: "「定」(fixed) + 「休」(rest) + 「日」(day) = regular fixed day off or closed day.",
    },
    readingQuestion: {
      prompt: "What is the correct reading of 「定休日」?",
      options: ["ていきゅうび", "じょうやすみひ", "さだめやすみ", "ていやすみび"],
      correctIndex: 0,
      explanation: "The standard On'yomi reading is 「ていきゅうび」 (tei-kyuu-bi).",
    },
  },
  {
    id: "kc-3",
    level: "N5",
    domain: "Public Notice",
    domainEmoji: "🚪",
    scenarioTitle: "Emergency Exit Sign in Public Hall",
    snippetText: "火災や 地震の際は、落ち着いて 非常口 の緑色の 誘導灯に 従ってください。",
    targetKanji: "非常口",
    targetReading: "ひじょうぐち",
    targetMeaning: "Emergency Exit",
    kanjiBreakdown: [
      { char: "非", onyomi: "ヒ", kunyomi: "あら・ず", meaning: "Non / Unusual / Emergency" },
      { char: "常", onyomi: "ジョウ", kunyomi: "つね", meaning: "Normal / Usual" },
      { char: "口", onyomi: "コウ / ク", kunyomi: "くち", meaning: "Mouth / Opening / Exit" },
    ],
    contextQuestion: {
      prompt: "Where should you evacuate through during an emergency according to this sign?",
      options: [
        "The kitchen entrance",
        "The green emergency exit (非常口)",
        "The main elevator shaft",
        "The rooftop helipad",
      ],
      correctIndex: 1,
      explanation: "「非常」(unusual / emergency) + 「口」(opening/exit) = Emergency Exit door.",
    },
    readingQuestion: {
      prompt: "What is the correct reading of 「非常口」?",
      options: ["ひじょうぐち", "ひつねぐち", "いじょうくち", "ひじょうこう"],
      correctIndex: 0,
      explanation: "It is read as 「ひじょうぐち」 (hi-jou-guchi) with rendaku voicing on くち -> ぐち.",
    },
  },
  {
    id: "kc-4",
    level: "N4",
    domain: "Transit",
    domainEmoji: "🎫",
    scenarioTitle: "IC Card Automated Gate Sign",
    snippetText: "残額不足 の場合は、改札機の手前にある 自動精算機 でチャージを行ってください。",
    targetKanji: "自動精算機",
    targetReading: "じどうせいさんき",
    targetMeaning: "Automatic Fare Adjustment Machine",
    kanjiBreakdown: [
      { char: "自", onyomi: "ジ / シ", kunyomi: "みずか・ら", meaning: "Self / Auto" },
      { char: "動", onyomi: "ドウ", kunyomi: "うご・く", meaning: "Move" },
      { char: "精", onyomi: "セイ / ショウ", kunyomi: "-", meaning: "Refined / Exact" },
      { char: "算", onyomi: "サン", kunyomi: "-", meaning: "Calculate / Settle" },
      { char: "機", onyomi: "キ", kunyomi: "はた", meaning: "Machine / Mechanism" },
    ],
    contextQuestion: {
      prompt: "When would a passenger use the 「自動精算機」 at a train station?",
      options: [
        "To purchase a souvenir or snack",
        "To adjust their fare / top up card when their balance is insufficient to exit",
        "To request a train delay certificate from the conductor",
        "To book a hotel near the station",
      ],
      correctIndex: 1,
      explanation: "「精算」(fare calculation / settlement) + 「機」(machine) is used when the IC card has insufficient balance (残額不足) to clear the gates.",
    },
    readingQuestion: {
      prompt: "What is the reading of 「自動精算機」?",
      options: ["じどうせいさんき", "じどうけいさんき", "みずからうごきはた", "じどうしょうさんき"],
      correctIndex: 0,
      explanation: "The reading is 「じどうせいさんき」 (ji-dou-sei-san-ki).",
    },
  },
  {
    id: "kc-5",
    level: "N4",
    domain: "Shopping & Food",
    domainEmoji: "🛒",
    scenarioTitle: "Supermarket Fresh Produce Section",
    snippetText: "本日入荷！ 地元農家より 直送 された 朝採れ 新鮮 な 有機野菜 コーナーです。",
    targetKanji: "新鮮",
    targetReading: "しんせん",
    targetMeaning: "Fresh / Vibrant",
    kanjiBreakdown: [
      { char: "新", onyomi: "シン", kunyomi: "あたら・しい", meaning: "New / Fresh" },
      { char: "鮮", onyomi: "セン", kunyomi: "あざ・やか", meaning: "Vivid / Fresh" },
    ],
    contextQuestion: {
      prompt: "How are the vegetables described by the word 「新鮮」?",
      options: [
        "Frozen and imported from overseas",
        "Fresh and recently harvested",
        "Processed and canned",
        "Discounted due to expiration",
      ],
      correctIndex: 1,
      explanation: "「新」(new) + 「鮮」(vivid/fresh) describes freshly harvested, high-quality produce.",
    },
    readingQuestion: {
      prompt: "What is the correct reading of 「新鮮」?",
      options: ["しんせん", "あたらあざやか", "にいせん", "しんぜん"],
      correctIndex: 0,
      explanation: "The standard On'yomi reading is 「しんせん」 (shin-sen).",
    },
  },
  {
    id: "kc-6",
    level: "N3",
    domain: "Weather & Safety",
    domainEmoji: "⚠️",
    scenarioTitle: "Meteorological Agency Disaster Advisory",
    snippetText: "大型で非常に強い 台風 の接近に伴い、大雨警報 と 暴風警報 が発令されました。",
    targetKanji: "警報",
    targetReading: "けいほう",
    targetMeaning: "Emergency Warning / Severe Weather Alert",
    kanjiBreakdown: [
      { char: "警", onyomi: "ケイ", kunyomi: "いまし・める", meaning: "Admonish / Guard / Warn" },
      { char: "報", onyomi: "ホウ", kunyomi: "むく・いる", meaning: "Report / News / Information" },
    ],
    contextQuestion: {
      prompt: "What does the announcement 「大雨警報」 signify?",
      options: [
        "A light pleasant drizzle forecast for tomorrow",
        "An official emergency severe heavy rain warning",
        "A heat wave advisory",
        "A recommendation to plant rain crops",
      ],
      correctIndex: 1,
      explanation: "「警」(warn) + 「報」(report) = official critical warning alert issued during hazardous weather conditions.",
    },
    readingQuestion: {
      prompt: "What is the correct reading of 「警報」?",
      options: ["けいほう", "けいぽう", "けいこく", "きょうほう"],
      correctIndex: 0,
      explanation: "The standard On'yomi reading is 「けいほう」 (kei-hou).",
    },
  },
];
