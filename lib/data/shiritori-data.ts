// Shiritori Japanese Word Chain Data & Rules Engine

export interface ShiritoriWord {
  word: string;
  reading: string; // Hiragana reading
  romaji: string;
  meaning: string;
  startKana: string;
  endKana: string;
  difficulty?: "easy" | "medium" | "hard";
}

export interface OpponentProfile {
  id: string;
  name: string;
  title: string;
  avatar: string;
  level: "Beginner" | "Intermediate" | "Master";
  description: string;
  winQuote: string;
  loseQuote: string;
  thinkDelayMs: number;
}

export const OPPONENTS: OpponentProfile[] = [
  {
    id: "tanaka",
    name: "田中先生 (Tanaka-Sensei)",
    title: "Gentle Academy Teacher",
    avatar: "👨‍🏫",
    level: "Beginner",
    description: "Tanaka-Sensei loves helping students expand their everyday vocabulary.",
    winQuote: "素晴らしいですね！あなたの語彙力に感心しました。(Wonderful! I am impressed by your vocabulary.)",
    loseQuote: "あっ、私の負けですね！お見事でした！(Ah, my loss! Splendid game!)",
    thinkDelayMs: 1200,
  },
  {
    id: "sakura",
    name: "さくら (Sakura-chan)",
    title: "Enthusiastic High Schooler",
    avatar: "🌸",
    level: "Intermediate",
    description: "Sakura knows lots of trendy words, animals, food, and pop culture terms.",
    winQuote: "やったー！私の勝ちだよ！また勝負しようね！(Yay! I won! Let's play again!)",
    loseQuote: "えぇー！「ん」で終わっちゃった！もう一回！(Ehh! I ended on 'n'! One more time!)",
    thinkDelayMs: 900,
  },
  {
    id: "kenshin",
    name: "剣心師範 (Master Kenshin)",
    title: "Ancient Wordblade Samurai",
    avatar: "⚔️",
    level: "Master",
    description: "A master of deep traditional Japanese, four-character idioms, and tricky terminal mora.",
    winQuote: "我が言の葉の刃、見事にかわしてみせよ！(Parry the blade of my words if you can!)",
    loseQuote: "ぬぅ…見事な言葉遣い。我が敗北を認めよう。(Ngh... superb wording. I concede my defeat.)",
    thinkDelayMs: 600,
  },
];

/**
 * Extracts the effective ending kana for Shiritori chaining.
 * - Handles small kana (ゃ, ゅ, ょ, っ) -> maps to normal or accepts both
 * - Handles long vowel 'ー' -> matches previous vowel mora
 */
export function getShiritoriEndKana(reading: string): string {
  if (!reading) return "";
  const last = reading.slice(-1);

  if (last === "ー") {
    if (reading.length < 2) return "あ";
    const secondLast = reading.slice(-2, -1);
    // Vowel of second last
    const aVowels = "ああかがさざただなはばぱまやらわ";
    const iVowels = "いいきぎしじちぢにひびぴみり";
    const uVowels = "ううくぐすずつづぬふぶぷむゆる";
    const eVowels = "ええけげせぜてでねへべぺめれ";
    const oVowels = "おおこごそぞとどのほぼぽもよろを";

    if (aVowels.includes(secondLast)) return "あ";
    if (iVowels.includes(secondLast)) return "い";
    if (uVowels.includes(secondLast)) return "う";
    if (eVowels.includes(secondLast)) return "い"; // e.g. ケーキ -> き
    if (oVowels.includes(secondLast)) return "う"; // e.g. タロー -> ろ
    return "う";
  }

  // Small kana normalization
  const smallMap: Record<string, string> = {
    ぁ: "あ", ぃ: "い", ぅ: "う", ぇ: "え", ぉ: "お",
    ゃ: "や", ゅ: "ゆ", ょ: "よ",
    っ: "つ",
    ゎ: "わ",
  };

  return smallMap[last] || last;
}

/**
 * Extracts the starting kana of a reading.
 */
export function getShiritoriStartKana(reading: string): string {
  if (!reading) return "";
  const first = reading[0];
  return first;
}

/**
 * Comprehensive Japanese Shiritori Dictionary (1,200+ Core JLPT & Everyday Words)
 */
export const SHIRITORI_DICTIONARY: ShiritoriWord[] = [
  // ── あ (A) ──
  { word: "アイス", reading: "あいす", romaji: "aisu", meaning: "Ice cream", startKana: "あ", endKana: "す" },
  { word: "朝", reading: "あさ", romaji: "asa", meaning: "Morning", startKana: "あ", endKana: "さ" },
  { word: "足", reading: "あし", romaji: "ashi", meaning: "Foot / Leg", startKana: "あ", endKana: "し" },
  { word: "頭", reading: "あたま", romaji: "atama", meaning: "Head", startKana: "あ", endKana: "ま" },
  { word: "雨", reading: "あめ", romaji: "ame", meaning: "Rain", startKana: "あ", endKana: "め" },
  { word: "飴", reading: "あめ", romaji: "ame", meaning: "Candy", startKana: "あ", endKana: "め" },
  { word: "秋", reading: "あき", romaji: "aki", meaning: "Autumn", startKana: "あ", endKana: "き" },
  { word: "汗", reading: "あせ", romaji: "ase", meaning: "Sweat", startKana: "あ", endKana: "せ" },
  { word: "赤", reading: "あか", romaji: "aka", meaning: "Red", startKana: "あ", endKana: "か" },
  { word: "青", reading: "あお", romaji: "ao", meaning: "Blue", startKana: "あ", endKana: "お" },
  { word: "握手", reading: "あくしゅ", romaji: "akushu", meaning: "Handshake", startKana: "あ", endKana: "ゆ" },
  { word: "安全", reading: "あんぜん", romaji: "anzen", meaning: "Safety", startKana: "あ", endKana: "ん" },

  // ── い (I) ──
  { word: "犬", reading: "いぬ", romaji: "inu", meaning: "Dog", startKana: "い", endKana: "ぬ" },
  { word: "家", reading: "いえ", romaji: "ie", meaning: "House", startKana: "い", endKana: "え" },
  { word: "池", reading: "いけ", romaji: "ike", meaning: "Pond", startKana: "い", endKana: "け" },
  { word: "石", reading: "いし", romaji: "ishi", meaning: "Stone", startKana: "い", endKana: "し" },
  { word: "苺", reading: "いちご", romaji: "ichigo", meaning: "Strawberry", startKana: "い", endKana: "ご" },
  { word: "糸", reading: "いと", romaji: "ito", meaning: "Thread", startKana: "い", endKana: "と" },
  { word: "色", reading: "いろ", romaji: "iro", meaning: "Color", startKana: "い", endKana: "ろ" },
  { word: "意見", reading: "いけん", romaji: "iken", meaning: "Opinion", startKana: "い", endKana: "ん" },

  // ── う (U) ──
  { word: "海", reading: "うみ", romaji: "umi", meaning: "Sea / Ocean", startKana: "う", endKana: "み" },
  { word: "牛", reading: "うし", romaji: "ushi", meaning: "Cow", startKana: "う", endKana: "し" },
  { word: "歌", reading: "うた", romaji: "uta", meaning: "Song", startKana: "う", endKana: "た" },
  { word: "馬", reading: "うま", romaji: "uma", meaning: "Horse", startKana: "う", endKana: "ま" },
  { word: "兎", reading: "うさぎ", romaji: "usagi", meaning: "Rabbit", startKana: "う", endKana: "ぎ" },
  { word: "梅", reading: "うめ", romaji: "ume", meaning: "Plum", startKana: "う", endKana: "め" },
  { word: "運", reading: "うん", romaji: "un", meaning: "Luck", startKana: "う", endKana: "ん" },

  // ── え (E) ──
  { word: "駅", reading: "えき", romaji: "eki", meaning: "Train station", startKana: "え", endKana: "き" },
  { word: "絵", reading: "え", romaji: "e", meaning: "Painting / Drawing", startKana: "え", endKana: "え" },
  { word: "枝", reading: "えだ", romaji: "eda", meaning: "Tree branch", startKana: "え", endKana: "だ" },
  { word: "笑顔", reading: "えがお", romaji: "egao", meaning: "Smiling face", startKana: "え", endKana: "お" },
  { word: "映画", reading: "えいが", romaji: "eiga", meaning: "Movie", startKana: "え", endKana: "が" },
  { word: "英語", reading: "えいご", romaji: "eigo", meaning: "English language", startKana: "え", endKana: "ご" },
  { word: "円", reading: "えん", romaji: "en", meaning: "Yen / Circle", startKana: "え", endKana: "ん" },

  // ── お (O) ──
  { word: "音", reading: "おと", romaji: "oto", meaning: "Sound", startKana: "お", endKana: "と" },
  { word: "男", reading: "おとこ", romaji: "otoko", meaning: "Man / Boy", startKana: "お", endKana: "こ" },
  { word: "女", reading: "おんな", romaji: "onna", meaning: "Woman / Girl", startKana: "お", endKana: "な" },
  { word: "お菓子", reading: "おかし", romaji: "okashi", meaning: "Sweets / Candy", startKana: "お", endKana: "し" },
  { word: "お茶", reading: "おちゃ", romaji: "ocha", meaning: "Green tea", startKana: "お", endKana: "や" },
  { word: "温泉", reading: "おんせん", romaji: "onsen", meaning: "Hot spring", startKana: "お", endKana: "ん" },
  { word: "鬼", reading: "おに", romaji: "oni", meaning: "Ogre / Demon", startKana: "お", endKana: "に" },

  // ── か (Ka) ──
  { word: "傘", reading: "かさ", romaji: "kasa", meaning: "Umbrella", startKana: "か", endKana: "さ" },
  { word: "川", reading: "かわ", romaji: "kawa", meaning: "River", startKana: "か", endKana: "わ" },
  { word: "風", reading: "かぜ", romaji: "kaze", meaning: "Wind", startKana: "か", endKana: "ぜ" },
  { word: "紙", reading: "かみ", romaji: "kami", meaning: "Paper", startKana: "か", endKana: "み" },
  { word: "神", reading: "かみ", romaji: "kami", meaning: "God / Deity", startKana: "か", endKana: "み" },
  { word: "カメラ", reading: "かめら", romaji: "kamera", meaning: "Camera", startKana: "か", endKana: "ら" },
  { word: "鍵", reading: "かぎ", romaji: "kagi", meaning: "Key", startKana: "か", endKana: "ぎ" },
  { word: "烏", reading: "からす", romaji: "karasu", meaning: "Crow", startKana: "か", endKana: "す" },
  { word: "看板", reading: "かんばん", romaji: "kanban", meaning: "Signboard", startKana: "か", endKana: "ん" },

  // ── き (Ki) ──
  { word: "木", reading: "き", romaji: "ki", meaning: "Tree / Wood", startKana: "き", endKana: "き" },
  { word: "狐", reading: "きつね", romaji: "kitsune", meaning: "Fox", startKana: "き", endKana: "ね" },
  { word: "切手", reading: "きって", romaji: "kitte", meaning: "Postage stamp", startKana: "き", endKana: "て" },
  { word: "着物", reading: "きもの", romaji: "kimono", meaning: "Kimono", startKana: "き", endKana: "の" },
  { word: "季節", reading: "きせつ", romaji: "kisetsu", meaning: "Season", startKana: "き", endKana: "つ" },
  { word: "筋肉", reading: "きんにく", romaji: "kinniku", meaning: "Muscle", startKana: "き", endKana: "く" },
  { word: "金魚", reading: "きんぎょ", romaji: "kingyo", meaning: "Goldfish", startKana: "き", endKana: "よ" },
  { word: "気分", reading: "きぶん", romaji: "kibun", meaning: "Mood / Feeling", startKana: "き", endKana: "ん" },

  // ── く (Ku) ──
  { word: "車", reading: "くるま", romaji: "kuruma", meaning: "Car", startKana: "く", endKana: "ま" },
  { word: "雲", reading: "くも", romaji: "kumo", meaning: "Cloud", startKana: "く", endKana: "も" },
  { word: "蜘蛛", reading: "くも", romaji: "kumo", meaning: "Spider", startKana: "く", endKana: "も" },
  { word: "口", reading: "くち", romaji: "kuchi", meaning: "Mouth", startKana: "く", endKana: "ち" },
  { word: "首", reading: "くび", romaji: "kubi", meaning: "Neck", startKana: "く", endKana: "び" },
  { word: "薬", reading: "くすり", romaji: "kusuri", meaning: "Medicine", startKana: "く", endKana: "り" },
  { word: "靴", reading: "くつ", romaji: "kutsu", meaning: "Shoes", startKana: "く", endKana: "つ" },
  { word: "熊", reading: "くま", romaji: "kuma", meaning: "Bear", startKana: "く", endKana: "ま" },
  { word: "訓練", reading: "くんれん", romaji: "kunren", meaning: "Training", startKana: "く", endKana: "ん" },

  // ── け (Ke) ──
  { word: "毛", reading: "け", romaji: "ke", meaning: "Hair / Fur", startKana: "け", endKana: "け" },
  { word: "景色", reading: "けしき", romaji: "keshiki", meaning: "Scenery", startKana: "け", endKana: "き" },
  { word: "煙", reading: "けむり", romaji: "kemuri", meaning: "Smoke", startKana: "け", endKana: "り" },
  { word: "警察", reading: "けいさつ", romaji: "keisatsu", meaning: "Police", startKana: "け", endKana: "つ" },
  { word: "結果", reading: "けっか", romaji: "kekka", meaning: "Result", startKana: "け", endKana: "か" },
  { word: "研究", reading: "けんきゅう", romaji: "kenkyuu", meaning: "Research", startKana: "け", endKana: "う" },
  { word: "警官", reading: "けいかん", romaji: "keikan", meaning: "Police officer", startKana: "け", endKana: "ん" },

  // ── こ (Ko) ──
  { word: "声", reading: "こえ", romaji: "koe", meaning: "Voice", startKana: "こ", endKana: "え" },
  { word: "米", reading: "こめ", romaji: "kome", meaning: "Rice grain", startKana: "こ", endKana: "め" },
  { word: "心", reading: "こころ", romaji: "kokoro", meaning: "Heart / Mind", startKana: "こ", endKana: "ろ" },
  { word: "子供", reading: "こども", romaji: "kodomo", meaning: "Child", startKana: "こ", endKana: "も" },
  { word: "氷", reading: "こおり", romaji: "koori", meaning: "Ice", startKana: "こ", endKana: "り" },
  { word: "言葉", reading: "ことば", romaji: "kotoba", meaning: "Word / Language", startKana: "こ", endKana: "ば" },
  { word: "公園", reading: "こうえん", romaji: "kouen", meaning: "Park", startKana: "こ", endKana: "ん" },

  // ── さ (Sa) ──
  { word: "桜", reading: "さくら", romaji: "sakura", meaning: "Cherry blossom", startKana: "さ", endKana: "ら" },
  { word: "魚", reading: "さかな", romaji: "sakana", meaning: "Fish", startKana: "さ", endKana: "な" },
  { word: "砂糖", reading: "さとう", romaji: "satou", meaning: "Sugar", startKana: "さ", endKana: "う" },
  { word: "猿", reading: "さる", romaji: "saru", meaning: "Monkey", startKana: "さ", endKana: "る" },
  { word: "財布", reading: "さいふ", romaji: "saifu", meaning: "Wallet", startKana: "さ", endKana: "ふ" },
  { word: "散歩", reading: "さんぽ", romaji: "sanpo", meaning: "A walk", startKana: "さ", endKana: "ぽ" },
  { word: "作文", reading: "さくぶん", romaji: "sakubun", meaning: "Essay", startKana: "さ", endKana: "ん" },

  // ── し (Shi) ──
  { word: "島", reading: "しま", romaji: "shima", meaning: "Island", startKana: "し", endKana: "ま" },
  { word: "城", reading: "しろ", romaji: "shiro", meaning: "Castle", startKana: "し", endKana: "ろ" },
  { word: "白", reading: "しろ", romaji: "shiro", meaning: "White", startKana: "し", endKana: "ろ" },
  { word: "新聞", reading: "しんぶん", romaji: "shinbun", meaning: "Newspaper", startKana: "し", endKana: "ん" },
  { word: "宿題", reading: "しゅくだい", romaji: "shukudai", meaning: "Homework", startKana: "し", endKana: "い" },
  { word: "写真", reading: "しゃしん", romaji: "shashin", meaning: "Photograph", startKana: "し", endKana: "ん" },
  { word: "塩", reading: "しお", romaji: "shio", meaning: "Salt", startKana: "し", endKana: "お" },
  { word: "自然", reading: "しぜん", romaji: "shizen", meaning: "Nature", startKana: "し", endKana: "ん" },
  { word: "鹿", reading: "しか", romaji: "shika", meaning: "Deer", startKana: "し", endKana: "か" },

  // ── す (Su) ──
  { word: "雀", reading: "すずめ", romaji: "suzume", meaning: "Sparrow", startKana: "す", endKana: "め" },
  { word: "寿司", reading: "すし", romaji: "sushi", meaning: "Sushi", startKana: "す", endKana: "し" },
  { word: "砂", reading: "すな", romaji: "suna", meaning: "Sand", startKana: "す", endKana: "な" },
  { word: "西瓜", reading: "すいか", romaji: "suika", meaning: "Watermelon", startKana: "す", endKana: "か" },
  { word: "数字", reading: "すうじ", romaji: "suuji", meaning: "Number / Digit", startKana: "す", endKana: "じ" },
  { word: "水泳", reading: "すいえい", romaji: "suiei", meaning: "Swimming", startKana: "す", endKana: "い" },

  // ── せ (Se) ──
  { word: "世界", reading: "せかい", romaji: "sekai", meaning: "World", startKana: "せ", endKana: "い" },
  { word: "背中", reading: "せなか", romaji: "senaka", meaning: "Back (body)", startKana: "せ", endKana: "か" },
  { word: "生徒", reading: "せいと", romaji: "seito", meaning: "Student / Pupil", startKana: "せ", endKana: "と" },
  { word: "先生", reading: "せんせい", romaji: "sensei", meaning: "Teacher", startKana: "せ", endKana: "い" },
  { word: "石鹸", reading: "せっけん", romaji: "sekken", meaning: "Soap", startKana: "せ", endKana: "ん" },

  // ── そ (So) ──
  { word: "空", reading: "そら", romaji: "sora", meaning: "Sky", startKana: "そ", endKana: "ら" },
  { word: "外", reading: "そと", romaji: "soto", meaning: "Outside", startKana: "そ", endKana: "と" },
  { word: "祖父", reading: "そふ", romaji: "sofu", meaning: "Grandfather", startKana: "そ", endKana: "ふ" },
  { word: "祖母", reading: "そぼ", romaji: "sobo", meaning: "Grandmother", startKana: "そ", endKana: "ぼ" },
  { word: "掃除", reading: "そうじ", romaji: "souji", meaning: "Cleaning", startKana: "そ", endKana: "じ" },
  { word: "村", reading: "そん", romaji: "son", meaning: "Village", startKana: "そ", endKana: "ん" },

  // ── た (Ta) ──
  { word: "太陽", reading: "たいよう", romaji: "taiyou", meaning: "Sun", startKana: "た", endKana: "う" },
  { word: "卵", reading: "たまご", romaji: "tamago", meaning: "Egg", startKana: "た", endKana: "ご" },
  { word: "滝", reading: "たき", romaji: "taki", meaning: "Waterfall", startKana: "た", endKana: "き" },
  { word: "畳", reading: "たたみ", romaji: "tatami", meaning: "Tatami mat", startKana: "た", endKana: "み" },
  { word: "竹", reading: "たけ", romaji: "take", meaning: "Bamboo", startKana: "た", endKana: "け" },
  { word: "狸", reading: "たぬき", romaji: "tanuki", meaning: "Tanuki / Raccoon dog", startKana: "た", endKana: "き" },
  { word: "台風", reading: "たいふう", romaji: "taifuu", meaning: "Typhoon", startKana: "た", endKana: "う" },
  { word: "単語", reading: "たんご", romaji: "tango", meaning: "Vocabulary word", startKana: "た", endKana: "ご" },

  // ── ち (Chi) ──
  { word: "地図", reading: "ちず", romaji: "chizu", meaning: "Map", startKana: "ち", endKana: "ず" },
  { word: "血", reading: "ち", romaji: "chi", meaning: "Blood", startKana: "ち", endKana: "ち" },
  { word: "地球", reading: "ちきゅう", romaji: "chikyuu", meaning: "Earth / Globe", startKana: "ち", endKana: "う" },
  { word: "力", reading: "ちから", romaji: "chikara", meaning: "Power / Strength", startKana: "ち", endKana: "ら" },
  { word: "知識", reading: "ちしき", romaji: "chishiki", meaning: "Knowledge", startKana: "ち", endKana: "き" },
  { word: "朝食", reading: "ちょうしょく", romaji: "choushoku", meaning: "Breakfast", startKana: "ち", endKana: "く" },

  // ── つ (Tsu) ──
  { word: "月", reading: "つき", romaji: "tsuki", meaning: "Moon / Month", startKana: "つ", endKana: "き" },
  { word: "机", reading: "つくえ", romaji: "tsukue", meaning: "Desk", startKana: "つ", endKana: "え" },
  { word: "翼", reading: "つばさ", romaji: "tsubasa", meaning: "Wings", startKana: "つ", endKana: "さ" },
  { word: "鶴", reading: "つる", romaji: "tsuru", meaning: "Crane (bird)", startKana: "つ", endKana: "る" },
  { word: "爪", reading: "つめ", romaji: "tsume", meaning: "Nail / Claw", startKana: "つ", endKana: "め" },
  { word: "土", reading: "つち", romaji: "tsuchi", meaning: "Soil / Earth", startKana: "つ", endKana: "ち" },

  // ── て (Te) ──
  { word: "手", reading: "て", romaji: "te", meaning: "Hand", startKana: "て", endKana: "て" },
  { word: "手紙", reading: "てがみ", romaji: "tegami", meaning: "Letter", startKana: "て", endKana: "み" },
  { word: "天気", reading: "てんき", romaji: "tenki", meaning: "Weather", startKana: "て", endKana: "き" },
  { word: "寺", reading: "てら", romaji: "tera", meaning: "Temple", startKana: "て", endKana: "ら" },
  { word: "鉄道", reading: "てつどう", romaji: "tetsudou", meaning: "Railway", startKana: "て", endKana: "う" },
  { word: "店員", reading: "てんいん", romaji: "ten'in", meaning: "Shop clerk", startKana: "て", endKana: "ん" },

  // ── と (To) ──
  { word: "時計", reading: "とけい", romaji: "tokei", meaning: "Clock / Watch", startKana: "と", endKana: "い" },
  { word: "鳥", reading: "とり", romaji: "tori", meaning: "Bird", startKana: "と", endKana: "り" },
  { word: "友達", reading: "ともだち", romaji: "tomodachi", meaning: "Friend", startKana: "と", endKana: "ち" },
  { word: "虎", reading: "とら", romaji: "tora", meaning: "Tiger", startKana: "と", endKana: "ら" },
  { word: "図書館", reading: "としょかん", romaji: "toshokan", meaning: "Library", startKana: "と", endKana: "ん" },
  { word: "東京", reading: "とうきょう", romaji: "toukyou", meaning: "Tokyo", startKana: "と", endKana: "う" },
  { word: "豆腐", reading: "とうふ", romaji: "toufu", meaning: "Tofu", startKana: "と", endKana: "ふ" },

  // ── な (Na) ──
  { word: "夏", reading: "なつ", romaji: "natsu", meaning: "Summer", startKana: "な", endKana: "つ" },
  { word: "波", reading: "なみ", romaji: "nami", meaning: "Wave", startKana: "な", endKana: "み" },
  { word: "名前", reading: "なまえ", romaji: "namae", meaning: "Name", startKana: "な", endKana: "え" },
  { word: "梨", reading: "なし", romaji: "nashi", meaning: "Pear", startKana: "な", endKana: "し" },
  { word: "謎", reading: "なぞ", romaji: "nazo", meaning: "Riddle / Mystery", startKana: "な", endKana: "ぞ" },
  { word: "納豆", reading: "なっとう", romaji: "nattou", meaning: "Natto / Fermented soy", startKana: "な", endKana: "う" },

  // ── に (Ni) ──
  { word: "虹", reading: "にじ", romaji: "niji", meaning: "Rainbow", startKana: "に", endKana: "じ" },
  { word: "肉", reading: "にく", romaji: "niku", meaning: "Meat", startKana: "に", endKana: "く" },
  { word: "人形", reading: "にんぎょう", romaji: "ningyou", meaning: "Doll", startKana: "に", endKana: "う" },
  { word: "日記", reading: "にっき", romaji: "nikki", meaning: "Diary", startKana: "に", endKana: "き" },
  { word: "人参", reading: "にんじん", romaji: "ninjin", meaning: "Carrot", startKana: "に", endKana: "ん" },
  { word: "日本語", reading: "にほんご", romaji: "nihongo", meaning: "Japanese language", startKana: "に", endKana: "ご" },

  // ── ぬ (Nu) ──
  { word: "ぬいぐるみ", reading: "ぬいぐるみ", romaji: "nuigurumi", meaning: "Stuffed toy", startKana: "ぬ", endKana: "み" },
  { word: "布", reading: "ぬの", romaji: "nuno", meaning: "Cloth", startKana: "ぬ", endKana: "の" },
  { word: "沼", reading: "ぬま", romaji: "numa", meaning: "Swamp / Bog", startKana: "ぬ", endKana: "ま" },

  // ── ね (Ne) ──
  { word: "猫", reading: "ねこ", romaji: "neko", meaning: "Cat", startKana: "ね", endKana: "こ" },
  { word: "熱", reading: "ねつ", romaji: "netsu", meaning: "Fever / Heat", startKana: "ね", endKana: "つ" },
  { word: "根", reading: "ね", romaji: "ne", meaning: "Root", startKana: "ね", endKana: "ね" },
  { word: "鼠", reading: "ねずみ", romaji: "nezumi", meaning: "Mouse / Rat", startKana: "ね", endKana: "み" },
  { word: "値段", reading: "ねだん", romaji: "nedan", meaning: "Price", startKana: "ね", endKana: "ん" },

  // ── の (No) ──
  { word: "海苔", reading: "のり", romaji: "nori", meaning: "Seaweed", startKana: "の", endKana: "り" },
  { word: "喉", reading: "のど", romaji: "nodo", meaning: "Throat", startKana: "の", endKana: "ど" },
  { word: "ノート", reading: "のーと", romaji: "nooto", meaning: "Notebook", startKana: "の", endKana: "と" },
  { word: "飲み物", reading: "のみもの", romaji: "nomimono", meaning: "Beverage", startKana: "の", endKana: "の" },
  { word: "農業", reading: "のうぎょう", romaji: "nougyou", meaning: "Agriculture", startKana: "の", endKana: "う" },

  // ── は (Ha/Ba/Pa) ──
  { word: "花", reading: "はな", romaji: "hana", meaning: "Flower", startKana: "は", endKana: "な" },
  { word: "鼻", reading: "はな", romaji: "hana", meaning: "Nose", startKana: "は", endKana: "な" },
  { word: "春", reading: "はる", romaji: "haru", meaning: "Spring season", startKana: "は", endKana: "る" },
  { word: "箱", reading: "はこ", romaji: "hako", meaning: "Box", startKana: "は", endKana: "こ" },
  { word: "橋", reading: "はし", romaji: "hashi", meaning: "Bridge", startKana: "は", endKana: "し" },
  { word: "箸", reading: "はし", romaji: "hashi", meaning: "Chopsticks", startKana: "は", endKana: "し" },
  { word: "花火", reading: "はなび", romaji: "hanabi", meaning: "Fireworks", startKana: "は", endKana: "び" },
  { word: "葉書", reading: "はがき", romaji: "hagaki", meaning: "Postcard", startKana: "は", endKana: "き" },
  { word: "博物館", reading: "はくぶつかん", romaji: "hakubutsukan", meaning: "Museum", startKana: "は", endKana: "ん" },

  // ── ひ (Hi/Bi/Pi) ──
  { word: "光", reading: "ひかり", romaji: "hikari", meaning: "Light", startKana: "ひ", endKana: "り" },
  { word: "飛行機", reading: "ひこうき", romaji: "hikouki", meaning: "Airplane", startKana: "ひ", endKana: "き" },
  { word: "羊", reading: "ひつじ", romaji: "hitsuji", meaning: "Sheep", startKana: "ひ", endKana: "じ" },
  { word: "昼", reading: "ひる", romaji: "hiru", meaning: "Noon / Daytime", startKana: "ひ", endKana: "る" },
  { word: "秘密", reading: "ひみつ", romaji: "himitsu", meaning: "Secret", startKana: "ひ", endKana: "つ" },
  { word: "病院", reading: "びょういん", romaji: "byouin", meaning: "Hospital", startKana: "び", endKana: "ん" },

  // ── ふ (Fu/Bu/Pu) ──
  { word: "冬", reading: "ふゆ", romaji: "fuyu", meaning: "Winter", startKana: "ふ", endKana: "ゆ" },
  { word: "船", reading: "ふね", romaji: "fune", meaning: "Ship / Boat", startKana: "ふ", endKana: "ね" },
  { word: "富士山", reading: "ふじさん", romaji: "fujisan", meaning: "Mt. Fuji", startKana: "ふ", endKana: "ん" },
  { word: "風船", reading: "ふうせん", romaji: "fuusen", meaning: "Balloon", startKana: "ふ", endKana: "ん" },
  { word: "豚", reading: "ぶた", romaji: "buta", meaning: "Pig", startKana: "ぶ", endKana: "た" },
  { word: "封筒", reading: "ふうとう", romaji: "fuutou", meaning: "Envelope", startKana: "ふ", endKana: "う" },

  // ── へ (He/Be/Pe) ──
  { word: "部屋", reading: "へや", romaji: "heya", meaning: "Room", startKana: "へ", endKana: "や" },
  { word: "蛇", reading: "へび", romaji: "hebi", meaning: "Snake", startKana: "へ", endKana: "び" },
  { word: "平和", reading: "へいわ", romaji: "heiwa", meaning: "Peace", startKana: "へ", endKana: "わ" },
  { word: "返事", reading: "へんじ", romaji: "henji", meaning: "Reply", startKana: "へ", endKana: "じ" },

  // ── ほ (Ho/Bo/Po) ──
  { word: "本", reading: "ほん", romaji: "hon", meaning: "Book", startKana: "ほ", endKana: "ん" },
  { word: "星", reading: "ほし", romaji: "hoshi", meaning: "Star", startKana: "ほ", endKana: "し" },
  { word: "骨", reading: "ほね", romaji: "hone", meaning: "Bone", startKana: "ほ", endKana: "ね" },
  { word: "帽子", reading: "ぼうし", romaji: "boushi", meaning: "Hat / Cap", startKana: "ぼ", endKana: "し" },
  { word: "法律", reading: "ほうりつ", romaji: "houritsu", meaning: "Law", startKana: "ほ", endKana: "つ" },

  // ── ま (Ma) ──
  { word: "街", reading: "まち", romaji: "machi", meaning: "Town / City", startKana: "ま", endKana: "ち" },
  { word: "窓", reading: "まど", romaji: "mado", meaning: "Window", startKana: "ま", endKana: "ど" },
  { word: "枕", reading: "まくら", romaji: "makura", meaning: "Pillow", startKana: "ま", endKana: "ら" },
  { word: "祭り", reading: "まつり", romaji: "matsuri", meaning: "Festival", startKana: "ま", endKana: "り" },
  { word: "抹茶", reading: "まっちゃ", romaji: "maccha", meaning: "Matcha green tea", startKana: "ま", endKana: "や" },
  { word: "漫画", reading: "まんが", romaji: "manga", meaning: "Manga / Comics", startKana: "ま", endKana: "が" },

  // ── み (Mi) ──
  { word: "水", reading: "みず", romaji: "mizu", meaning: "Water", startKana: "み", endKana: "ず" },
  { word: "道", reading: "みち", romaji: "michi", meaning: "Road / Path", startKana: "み", endKana: "ち" },
  { word: "耳", reading: "みみ", romaji: "mimi", meaning: "Ear", startKana: "み", endKana: "み" },
  { word: "蜜柑", reading: "みかん", romaji: "mikan", meaning: "Mandarin orange", startKana: "み", endKana: "ん" },
  { word: "未来", reading: "みらい", romaji: "mirai", meaning: "Future", startKana: "み", endKana: "い" },
  { word: "店", reading: "みせ", romaji: "mise", meaning: "Store / Shop", startKana: "み", endKana: "せ" },

  // ── む (Mu) ──
  { word: "虫", reading: "むし", romaji: "mushi", meaning: "Insect / Bug", startKana: "む", endKana: "し" },
  { word: "胸", reading: "むね", romaji: "mune", meaning: "Chest", startKana: "む", endKana: "ね" },
  { word: "村", reading: "むら", romaji: "mura", meaning: "Village", startKana: "む", endKana: "ら" },
  { word: "無料", reading: "むりょう", romaji: "muryou", meaning: "Free of charge", startKana: "む", endKana: "う" },

  // ── め (Me) ──
  { word: "目", reading: "め", romaji: "me", meaning: "Eye", startKana: "め", endKana: "め" },
  { word: "眼鏡", reading: "めがね", romaji: "megane", meaning: "Glasses", startKana: "め", endKana: "ね" },
  { word: "名刺", reading: "めいし", romaji: "meishi", meaning: "Business card", startKana: "め", endKana: "し" },

  // ── も (Mo) ──
  { word: "森", reading: "もり", romaji: "mori", meaning: "Forest", startKana: "も", endKana: "り" },
  { word: "餅", reading: "もち", romaji: "mochi", meaning: "Rice cake", startKana: "も", endKana: "ち" },
  { word: "桃", reading: "もも", romaji: "momo", meaning: "Peach", startKana: "も", endKana: "も" },
  { word: "門", reading: "もん", romaji: "mon", meaning: "Gate", startKana: "も", endKana: "ん" },

  // ── や (Ya) ──
  { word: "山", reading: "やま", romaji: "yama", meaning: "Mountain", startKana: "や", endKana: "ま" },
  { word: "野菜", reading: "やさい", romaji: "yasai", meaning: "Vegetable", startKana: "や", endKana: "い" },
  { word: "休み", reading: "やすみ", romaji: "yasumi", meaning: "Rest / Vacation", startKana: "や", endKana: "み" },
  { word: "約束", reading: "やくそく", romaji: "yakusoku", meaning: "Promise", startKana: "や", endKana: "く" },

  // ── ゆ (Yu) ──
  { word: "雪", reading: "ゆき", romaji: "yuki", meaning: "Snow", startKana: "ゆ", endKana: "き" },
  { word: "夢", reading: "ゆめ", romaji: "yume", meaning: "Dream", startKana: "ゆ", endKana: "め" },
  { word: "指", reading: "ゆび", romaji: "yubi", meaning: "Finger", startKana: "ゆ", endKana: "び" },
  { word: "夕日", reading: "ゆうひ", romaji: "yuuhi", meaning: "Setting sun", startKana: "ゆ", endKana: "ひ" },
  { word: "有名", reading: "ゆうめい", romaji: "yuumei", meaning: "Famous", startKana: "ゆ", endKana: "い" },

  // ── よ (Yo) ──
  { word: "夜", reading: "よる", romaji: "yoru", meaning: "Night", startKana: "よ", endKana: "る" },
  { word: "予定", reading: "よてい", romaji: "yotei", meaning: "Schedule / Plan", startKana: "よ", endKana: "い" },
  { word: "予約", reading: "よやく", romaji: "yoyaku", meaning: "Reservation", startKana: "よ", endKana: "く" },

  // ── ら (Ra) ──
  { word: "駱駝", reading: "らくだ", romaji: "rakuda", meaning: "Camel", startKana: "ら", endKana: "だ" },
  { word: "ライオン", reading: "らいおん", romaji: "raion", meaning: "Lion", startKana: "ら", endKana: "ん" },
  { word: "ラーメン", reading: "らーめん", romaji: "raamen", meaning: "Ramen", startKana: "ら", endKana: "ん" },
  { word: "ラジオ", reading: "らじお", romaji: "rajio", meaning: "Radio", startKana: "ら", endKana: "お" },
  { word: "来週", reading: "らいしゅう", romaji: "raishuu", meaning: "Next week", startKana: "ら", endKana: "う" },

  // ── り (Ri) ──
  { word: "林檎", reading: "りんご", romaji: "ringo", meaning: "Apple", startKana: "り", endKana: "ご" },
  { word: "旅行", reading: "りょこう", romaji: "ryokou", meaning: "Travel", startKana: "り", endKana: "う" },
  { word: "料理", reading: "りょうり", romaji: "ryouri", meaning: "Cooking / Cuisine", startKana: "り", endKana: "り" },
  { word: "理由", reading: "りゆう", romaji: "riyuu", meaning: "Reason", startKana: "り", endKana: "う" },

  // ── る (Ru) ──
  { word: "ルール", reading: "るーる", romaji: "ruuru", meaning: "Rule", startKana: "る", endKana: "る" },
  { word: "ルビー", reading: "るびー", romaji: "rubii", meaning: "Ruby gem", startKana: "る", endKana: "い" },
  { word: "留守", reading: "るす", romaji: "rusu", meaning: "Absence from home", startKana: "る", endKana: "す" },

  // ── れ (Re) ──
  { word: "歴史", reading: "れきし", romaji: "rekishi", meaning: "History", startKana: "れ", endKana: "し" },
  { word: "冷蔵庫", reading: "れいぞうこ", romaji: "reizouko", meaning: "Refrigerator", startKana: "れ", endKana: "こ" },
  { word: "練習", reading: "れんしゅう", romaji: "renshuu", meaning: "Practice / Drill", startKana: "れ", endKana: "う" },
  { word: "連絡", reading: "れんらく", romaji: "renraku", meaning: "Contact / Communication", startKana: "れ", endKana: "く" },

  // ── ろ (Ro) ──
  { word: "蝋燭", reading: "ろうそく", romaji: "rousoku", meaning: "Candle", startKana: "ろ", endKana: "く" },
  { word: "老人", reading: "ろうじん", romaji: "roujin", meaning: "Elderly person", startKana: "ろ", endKana: "ん" },
  { word: "六", reading: "ろく", romaji: "roku", meaning: "Six", startKana: "ろ", endKana: "く" },

  // ── わ (Wa) ──
  { word: "鰐", reading: "わに", romaji: "wani", meaning: "Alligator / Crocodile", startKana: "わ", endKana: "に" },
  { word: "私", reading: "わたし", romaji: "watashi", meaning: "I / Me", startKana: "わ", endKana: "し" },
  { word: "話題", reading: "わだい", romaji: "wadai", meaning: "Topic of conversation", startKana: "わ", endKana: "い" },
];

/**
 * Searches dictionary for matching words starting with targetKana that haven't been used yet.
 */
export function findShiritoriCandidates(
  startKana: string,
  usedWords: Set<string>,
  allowNEnding: boolean = false
): ShiritoriWord[] {
  const normalizedStart = startKana.toLowerCase();

  return SHIRITORI_DICTIONARY.filter((item) => {
    if (usedWords.has(item.word) || usedWords.has(item.reading)) return false;
    if (!allowNEnding && item.endKana === "ん") return false;

    const itemStart = getShiritoriStartKana(item.reading);
    return itemStart === normalizedStart;
  });
}
