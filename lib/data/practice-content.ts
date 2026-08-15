// Rich datasets for Japanese practice trainers

export interface ParticleExercise {
  id: string;
  level: "N5" | "N4" | "N3";
  japanese: string; // e.g. "私 [blank] 学生です。"
  reading: string; // e.g. "わたし [blank] がくせいです。"
  translation: string;
  correctParticle: string;
  options: string[];
  explanation: string;
}

export const PARTICLE_EXERCISES: ParticleExercise[] = [
  // ── N5 PARTICLES ──
  {
    id: "p-1",
    level: "N5",
    japanese: "私 [blank] 田中と申します。",
    reading: "わたし [blank] たなかともうします。",
    translation: "I am Tanaka (humble).",
    correctParticle: "は",
    options: ["は", "が", "を", "に"],
    explanation: "「は」(wa) is the topic marker indicating what the sentence is about (the topic 'As for me...').",
  },
  {
    id: "p-2",
    level: "N5",
    japanese: "毎朝７時 [blank] 起きます。",
    reading: "まいあさ ななじ [blank] おきます。",
    translation: "I wake up at 7 o'clock every morning.",
    correctParticle: "に",
    options: ["に", "で", "を", "へ"],
    explanation: "「に」(ni) marks a specific numerical point in time at which an action occurs.",
  },
  {
    id: "p-3",
    level: "N5",
    japanese: "図書館 [blank] 本を読みます。",
    reading: "としょかん [blank] ほんをよみます。",
    translation: "I read books at the library.",
    correctParticle: "で",
    options: ["で", "に", "を", "へ"],
    explanation: "「で」(de) marks the location where an action takes place.",
  },
  {
    id: "p-4",
    level: "N5",
    japanese: "りんご [blank] 食べました。",
    reading: "りんご [blank] たべました。",
    translation: "I ate an apple.",
    correctParticle: "を",
    options: ["を", "は", "が", "に"],
    explanation: "「を」(o/wo) marks the direct object of a transitive action verb.",
  },
  {
    id: "p-5",
    level: "N5",
    japanese: "明日、東京 [blank] 行きます。",
    reading: "あした、とうきょう [blank] いきます。",
    translation: "Tomorrow, I will go to Tokyo.",
    correctParticle: "へ",
    options: ["へ", "で", "を", "が"],
    explanation: "「へ」(e) marks the direction or destination of movement verbs (行く, 来る, 帰る).",
  },
  {
    id: "p-6",
    level: "N5",
    japanese: "友達 [blank] 一緒に映画を見ました。",
    reading: "ともだち [blank] いっしょに えいがを みました。",
    translation: "I watched a movie together with my friend.",
    correctParticle: "と",
    options: ["と", "に", "で", "を"],
    explanation: "「と」(to) indicates companionship or doing an action 'together with' someone.",
  },
  {
    id: "p-7",
    level: "N5",
    japanese: "日本語の辞書 [blank] ありません。",
    reading: "にほんごの じしょ [blank] ありません。",
    translation: "There is no Japanese dictionary.",
    correctParticle: "が",
    options: ["が", "を", "で", "へ"],
    explanation: "With the existence verbs ある (inanimate) and いる (animate), the existing subject is marked with 「が」(ga).",
  },
  {
    id: "p-8",
    level: "N5",
    japanese: "電車 [blank] 大学へ通っています。",
    reading: "でんしゃ [blank] だいがくへ かよっています。",
    translation: "I commute to university by train.",
    correctParticle: "で",
    options: ["で", "に", "を", "と"],
    explanation: "「で」(de) marks the means or instrument used to perform an action (by train, by car, with chopsticks).",
  },
  {
    id: "p-9",
    level: "N5",
    japanese: "田中さん [blank] 英語を教えました。",
    reading: "たなかさん [blank] えいごを おしえました。",
    translation: "I taught English to Mr. Tanaka.",
    correctParticle: "に",
    options: ["に", "で", "を", "から"],
    explanation: "「に」(ni) indicates the recipient or indirect object of an action (giving, teaching, lending to someone).",
  },
  {
    id: "p-10",
    level: "N5",
    japanese: "駅 [blank] 家まで歩いて１０分です。",
    reading: "えき [blank] うちまで あるいて じゅっぷんです。",
    translation: "It is a 10-minute walk from the station to my house.",
    correctParticle: "から",
    options: ["から", "まで", "より", "に"],
    explanation: "「から」(kara) indicates the starting point of time or physical location ('from X').",
  },

  // ── N4 PARTICLES ──
  {
    id: "p-11",
    level: "N4",
    japanese: "雨 [blank] 降っているので、傘を持っていきます。",
    reading: "あめ [blank] ふっているので、かさを もっていきます。",
    translation: "Because it's raining, I will take an umbrella.",
    correctParticle: "が",
    options: ["が", "を", "は", "で"],
    explanation: "Natural phenomena (rain, snow, wind) take the subject marker 「が」(ga) with verbs like 降る or 吹く.",
  },
  {
    id: "p-12",
    level: "N4",
    japanese: "新幹線はバス [blank] 速いです。",
    reading: "しんかんせんは バス [blank] はやいです。",
    translation: "The Shinkansen is faster than a bus.",
    correctParticle: "より",
    options: ["より", "ほど", "から", "と"],
    explanation: "「より」(yori) indicates the baseline / standard of comparison ('faster than X').",
  },
  {
    id: "p-13",
    level: "N4",
    japanese: "この部屋はあの部屋 [blank] 広くないです。",
    reading: "このへやは あのへや [blank] ひろくないです。",
    translation: "This room is not as spacious as that room.",
    correctParticle: "ほど",
    options: ["ほど", "より", "だけ", "しか"],
    explanation: "「ほど〜ない」(hodo... nai) expresses 'not as... as X' in negative comparisons.",
  },
  {
    id: "p-14",
    level: "N4",
    japanese: "財布の中に１００円 [blank] ありません。",
    reading: "さいふの なかに ひゃくえん [blank] ありません。",
    translation: "I only have 100 yen in my wallet (nothing more).",
    correctParticle: "しか",
    options: ["しか", "だけ", "も", "より"],
    explanation: "「しか」(shika) pairs strictly with negative verbs to mean 'nothing except / only'.",
  },
  {
    id: "p-15",
    level: "N4",
    japanese: "先生 [blank] 褒められて、とても嬉しかったです。",
    reading: "せんせい [blank] ほめられて、とても うれしかったです。",
    translation: "I was praised by my teacher and felt very happy.",
    correctParticle: "に",
    options: ["に", "で", "を", "から"],
    explanation: "In passive voice constructions (受け身), the agent who performs the action upon the subject is marked with 「に」(ni).",
  },
  {
    id: "p-16",
    level: "N4",
    japanese: "日本料理の中 [blank] 、寿司が一番好きです。",
    reading: "にほんりょうりの なか [blank] 、すしが いちばん すきです。",
    translation: "Among Japanese dishes, I like sushi the most.",
    correctParticle: "で",
    options: ["で", "に", "から", "は"],
    explanation: "「の中で」(no naka de) specifies the scope or category within which a superlative choice is made.",
  },

  // ── N3 PARTICLES ──
  {
    id: "p-17",
    level: "N3",
    japanese: "彼 [blank] 対して、親切に接するべきです。",
    reading: "かれ [blank] たいして、しんせつに せっするべきです。",
    translation: "You should treat him kindly.",
    correctParticle: "に",
    options: ["に", "を", "で", "と"],
    explanation: "The grammar pattern 「〜に対して」(ni taishite) means 'towards / in regard to / facing'.",
  },
  {
    id: "p-18",
    level: "N3",
    japanese: "日本の歴史 [blank] ついて論文を書きました。",
    reading: "にほんの れきし [blank] ついて ろんぶんを かきました。",
    translation: "I wrote a thesis about Japanese history.",
    correctParticle: "に",
    options: ["に", "を", "で", "へ"],
    explanation: "The compound particle pattern 「〜について」(ni tsuite) means 'about / regarding'.",
  },
  {
    id: "p-19",
    level: "N3",
    japanese: "台風 [blank] よって、多くの電車が止まりました。",
    reading: "たいふう [blank] よって、おおくの でんしゃが とまりました。",
    translation: "Due to the typhoon, many trains were stopped.",
    correctParticle: "に",
    options: ["に", "で", "を", "と"],
    explanation: "「〜によって」(ni yotte) expresses cause, reason, or means ('due to / by means of').",
  },
  {
    id: "p-20",
    level: "N3",
    japanese: "年齢 [blank] かかわらず、誰でも参加できます。",
    reading: "ねんれい [blank] かかわらず、だれでも さんかできます。",
    translation: "Regardless of age, anyone can participate.",
    correctParticle: "に",
    options: ["に", "を", "で", "は"],
    explanation: "「〜にかかわらず」(ni kakawarazu) means 'regardless of / without distinction of'.",
  },
  {
    id: "p-21",
    level: "N3",
    japanese: "子供 [blank] とって、遊びは大切な学びの場です。",
    reading: "こども [blank] とって、あそびは たいせつな まなびの ばです。",
    translation: "For children, play is an important place of learning.",
    correctParticle: "に",
    options: ["に", "を", "で", "と"],
    explanation: "「〜にとって」(ni totte) means 'for / from the perspective of'.",
  },
  {
    id: "p-22",
    level: "N3",
    japanese: "期待 [blank] 応えて、優勝することができました。",
    reading: "きたい [blank] こたえて、ゆうしょうすることが できました。",
    translation: "In response to their expectations, we were able to win first prize.",
    correctParticle: "に",
    options: ["に", "を", "へ", "で"],
    explanation: "「〜に応えて」(ni kotaete) means 'in response to / meeting (expectations, requests)'.",
  },
];

// Sentence Scramble Exercises
export interface SentenceScrambleExercise {
  id: string;
  level: "N5" | "N4" | "N3";
  fullSentence: string;
  reading: string;
  translation: string;
  tiles: string[]; // correct sequence
}

export const SCRAMBLE_EXERCISES: SentenceScrambleExercise[] = [
  // ── N5 SCRAMBLE ──
  {
    id: "sc-1",
    level: "N5",
    fullSentence: "私は毎朝コーヒーを飲みます。",
    reading: "わたしは まいあさ こーひーを のみます。",
    translation: "I drink coffee every morning.",
    tiles: ["私は", "毎朝", "コーヒーを", "飲みます。"],
  },
  {
    id: "sc-2",
    level: "N5",
    fullSentence: "日曜日にお母さんとデパートへ行きました。",
    reading: "にちようびに おかあさんと でぱーとへ いきました。",
    translation: "I went to the department store with my mother on Sunday.",
    tiles: ["日曜日に", "お母さんと", "デパートへ", "行きました。"],
  },
  {
    id: "sc-3",
    level: "N5",
    fullSentence: "机の上に新しい本があります。",
    reading: "つくえのうえに あたらしいほんが あります。",
    translation: "There is a new book on top of the desk.",
    tiles: ["机の上に", "新しい", "本が", "あります。"],
  },
  {
    id: "sc-4",
    level: "N5",
    fullSentence: "田中さんは図書館で日本語を勉強します。",
    reading: "たなかさんは としょかんで にほんごを べんきょうします。",
    translation: "Mr. Tanaka studies Japanese at the library.",
    tiles: ["田中さんは", "図書館で", "日本語を", "勉強します。"],
  },
  {
    id: "sc-5",
    level: "N5",
    fullSentence: "昨日友達と一緒に美味しいラーメンを食べました。",
    reading: "きのう ともだちと いっしょに おいしいらーめんを たべました。",
    translation: "Yesterday, I ate delicious ramen together with my friend.",
    tiles: ["昨日", "友達と一緒に", "美味しいラーメンを", "食べました。"],
  },
  {
    id: "sc-6",
    level: "N5",
    fullSentence: "私の部屋には大きなテレビがあります。",
    reading: "わたしのへやには おおきなてれびが あります。",
    translation: "There is a large television in my room.",
    tiles: ["私の部屋には", "大きな", "テレビが", "あります。"],
  },

  // ── N4 SCRAMBLE ──
  {
    id: "sc-7",
    level: "N4",
    fullSentence: "日本語が上手に話せるようになりたいです。",
    reading: "にほんごが じょうずに はなせるように なりたいです。",
    translation: "I want to become able to speak Japanese fluently.",
    tiles: ["日本語が", "上手に", "話せるように", "なりたいです。"],
  },
  {
    id: "sc-8",
    level: "N4",
    fullSentence: "宿題を忘れないようにメモをしておきます。",
    reading: "しゅくだいを わすれないように めもを しておきます。",
    translation: "I will make a note so that I don't forget my homework.",
    tiles: ["宿題を", "忘れないように", "メモを", "しておきます。"],
  },
  {
    id: "sc-9",
    level: "N4",
    fullSentence: "来週のテストのために毎晩遅くまで復習しています。",
    reading: "らいしゅうの てすとのために まいばん おそくまで ふくしゅうしています。",
    translation: "For next week's test, I am reviewing late every night.",
    tiles: ["来週のテストのために", "毎晩", "遅くまで", "復習しています。"],
  },
  {
    id: "sc-10",
    level: "N4",
    fullSentence: "雨が降るかもしれないので傘を持って行きます。",
    reading: "あめが ふるかもしれないので かさを もって いきます。",
    translation: "Because it might rain, I will take an umbrella.",
    tiles: ["雨が", "降るかもしれないので", "傘を", "持って行きます。"],
  },
  {
    id: "sc-11",
    level: "N4",
    fullSentence: "先生に質問があるなら早く聞いたほうがいいですよ。",
    reading: "せんせいに しつもんがあるなら はやく きいたほうが いいですよ。",
    translation: "If you have a question for the teacher, you had better ask soon.",
    tiles: ["先生に", "質問があるなら", "早く", "聞いたほうがいいですよ。"],
  },

  // ── N3 SCRAMBLE ──
  {
    id: "sc-12",
    level: "N3",
    fullSentence: "健康のために毎日野菜をたくさん食べることにしています。",
    reading: "けんこうのために まいにち やさいを たくさん たべることに しています。",
    translation: "For my health, I make it a rule to eat a lot of vegetables every day.",
    tiles: ["健康のために", "毎日", "野菜をたくさん", "食べることに", "しています。"],
  },
  {
    id: "sc-13",
    level: "N3",
    fullSentence: "日本に住んでいるうちに色々な名所を訪れたいです。",
    reading: "にほんに すんでいるうちに いろいろな めいしょを おとずれたいです。",
    translation: "While I am living in Japan, I want to visit various famous spots.",
    tiles: ["日本に", "住んでいるうちに", "色々な名所を", "訪れたいです。"],
  },
  {
    id: "sc-14",
    level: "N3",
    fullSentence: "長時間の会議の末にようやく新しい方針が決まりました。",
    reading: "ちょうじかんの かいぎのすえに ようやく あたらしいほうしんが きまりました。",
    translation: "After a long meeting, the new policy was finally decided.",
    tiles: ["長時間の会議の末に", "ようやく", "新しい方針が", "決まりました。"],
  },
  {
    id: "sc-15",
    level: "N3",
    fullSentence: "努力したおかげで希望の大学に合格することができました。",
    reading: "どりょくしたおかげで きぼうの だいがくに ごうかくすることが できました。",
    translation: "Thanks to my hard work, I was able to pass the entrance exam of my desired university.",
    tiles: ["努力したおかげで", "希望の大学に", "合格することが", "できました。"],
  },
];

// Grammar Pattern Matcher
export interface GrammarPatternExercise {
  id: string;
  level: "N5" | "N4" | "N3";
  scenario: string;
  sentence: string;
  correctPattern: string;
  options: string[];
  meaning: string;
  explanation: string;
}

export const GRAMMAR_PATTERN_EXERCISES: GrammarPatternExercise[] = [
  // ── N5 GRAMMAR PATTERNS ──
  {
    id: "gp-1",
    level: "N5",
    scenario: "You are asking permission to take a photo in a museum.",
    sentence: "ここで写真を撮って___いいですか。",
    correctPattern: "〜てもいい",
    options: ["〜てもいい", "〜てはいけない", "〜てください", "〜てから"],
    meaning: "Expressing permission (May I / Is it okay to...?)",
    explanation: "Verb [Te-form] + もいいですか is used to ask polite permission to do something.",
  },
  {
    id: "gp-2",
    level: "N5",
    scenario: "Giving helpful health advice to someone running a fever.",
    sentence: "熱があるなら、早く寝た___。",
    correctPattern: "〜ほうがいい",
    options: ["〜ほうがいい", "〜てはいけない", "〜たり〜たり", "〜ことができる"],
    meaning: "Giving advice / recommendation (It's better to...)",
    explanation: "Verb [Ta-form] + ほうがいい expresses strong yet thoughtful advice or recommendations.",
  },
  {
    id: "gp-3",
    level: "N5",
    scenario: "Prohibiting someone from smoking in a non-smoking area.",
    sentence: "ここでタバコを吸っ___。",
    correctPattern: "〜てはいけない",
    options: ["〜てはいけない", "〜てもいい", "〜たほうがいい", "〜てみる"],
    meaning: "Strict prohibition (Must not / You cannot...)",
    explanation: "Verb [Te-form] + ははいけません / ははいけない expresses strict prohibition.",
  },
  {
    id: "gp-4",
    level: "N5",
    scenario: "Describing listing multiple representative actions on your day off.",
    sentence: "休みの日は本を読ん___、映画を見___します。",
    correctPattern: "〜たり〜たりする",
    options: ["〜たり〜たりする", "〜ながら", "〜てから", "〜てもいい"],
    meaning: "Listing representative actions (Doing things like X and Y)",
    explanation: "Verb [Ta-form] + り + Verb [Ta-form] + りする lists non-exhaustive activities.",
  },

  // ── N4 GRAMMAR PATTERNS ──
  {
    id: "gp-5",
    level: "N4",
    scenario: "Explaining an action done in advance for future preparation.",
    sentence: "パーティーの前に部屋を掃除して___。",
    correctPattern: "〜ておく",
    options: ["〜ておく", "〜てしまう", "〜てみる", "〜ていく"],
    meaning: "Doing something in advance for preparation",
    explanation: "Verb [Te-form] + おく (oku) means to perform an action in advance for a future purpose.",
  },
  {
    id: "gp-6",
    level: "N4",
    scenario: "Expressing regret after accidentally leaving your wallet on the train.",
    sentence: "財布を電車の中に忘れて___。",
    correctPattern: "〜てしまう",
    options: ["〜てしまう", "〜ておく", "〜てくる", "〜ている"],
    meaning: "Expressing completion with regret / accidentally doing something",
    explanation: "Verb [Te-form] + しまう (shimau) conveys completion of an action with regret or unintended consequences.",
  },
  {
    id: "gp-7",
    level: "N4",
    scenario: "Attempting to eat spicy wasabi for the very first time to see what it's like.",
    sentence: "本場のわさびを少し食べ___。",
    correctPattern: "〜てみる",
    options: ["〜てみる", "〜ておく", "〜てしまう", "〜てくる"],
    meaning: "Trying something out to see how it is (give it a try)",
    explanation: "Verb [Te-form] + みる (miru) means to do an action as a trial or experiment.",
  },
  {
    id: "gp-8",
    level: "N4",
    scenario: "Describing multitasking: listening to music while studying.",
    sentence: "音楽を聴き___勉強するのが好きです。",
    correctPattern: "〜ながら",
    options: ["〜ながら", "〜たあとで", "〜てから", "〜とおりに"],
    meaning: "Simultaneous actions (While doing X, doing Y)",
    explanation: "Verb [Masu-stem] + ながら (nagara) indicates two actions performed simultaneously by the same subject.",
  },
  {
    id: "gp-9",
    level: "N4",
    scenario: "Declaring your intention to study abroad in Japan next year.",
    sentence: "来年、日本へ留学し___と思っています。",
    correctPattern: "〜ようと思う",
    options: ["〜ようと思う", "〜てしまう", "〜たばかり", "〜はずだ"],
    meaning: "Expressing one's volition / intention (Thinking of doing...)",
    explanation: "Verb [Volitional form] + と思う expresses intention or plans formed in the speaker's mind.",
  },

  // ── N3 GRAMMAR PATTERNS ──
  {
    id: "gp-10",
    level: "N3",
    scenario: "Stating a condition that is strictly essential for an experiment to proceed.",
    sentence: "先生の許可が___、この実験はできません。",
    correctPattern: "〜ないことには",
    options: ["〜ないことには", "〜に反して", "〜に応じて", "〜ばかりか"],
    meaning: "Unless / Without doing X, Y cannot happen",
    explanation: "Verb [Nai-form] + ことには expresses 'unless X happens, Y cannot be realized'.",
  },
  {
    id: "gp-11",
    level: "N3",
    scenario: "Expressing gratitude that thanks to the teacher's guidance, you passed.",
    sentence: "先生のご指導の___、合格することができました。",
    correctPattern: "〜おかげで",
    options: ["〜おかげで", "〜せいで", "〜わりに", "〜くせに"],
    meaning: "Thanks to (positive cause and beneficial outcome)",
    explanation: "Noun + の / Verb plain + おかげで expresses gratitude for a positive result.",
  },
  {
    id: "gp-12",
    level: "N3",
    scenario: "Blaming a sudden delay on the heavy rainstorm.",
    sentence: "大雨の___、電車が大幅に遅れてしまいました。",
    correctPattern: "〜せいで",
    options: ["〜せいで", "〜おかげで", "〜につれて", "〜反面"],
    meaning: "Because of / Blame on (negative cause resulting in undesirable outcome)",
    explanation: "Noun + の / Verb plain + せいで attributes blame to a cause for a bad result.",
  },
  {
    id: "gp-13",
    level: "N3",
    scenario: "Expressing that something happens every single time you hear a nostalgic song.",
    sentence: "この曲を聴く___、故郷の家族を思い出します。",
    correctPattern: "〜たびに",
    options: ["〜たびに", "〜うちに", "〜最中に", "〜途中で"],
    meaning: "Every time / Whenever X happens, Y always follows",
    explanation: "Noun + の / Verb [Dictionary form] + たびに means 'every time X happens'.",
  },
  {
    id: "gp-14",
    level: "N3",
    scenario: "Urging someone to eat the warm ramen before it gets completely cold.",
    sentence: "ラーメンが温かい___、早く召し上がってください。",
    correctPattern: "〜うちに",
    options: ["〜うちに", "〜たびに", "〜あまり", "〜うえに"],
    meaning: "While / Before a state changes",
    explanation: "Adjective / Verb [Dictionary or Continuous] + うちに means doing something while a favorable state lasts.",
  },
];

// Keigo / Politeness Converter Exercises
export interface KeigoExercise {
  id: string;
  plain: string;
  polite: string;
  sonkeigo: string; // Honorific (respect for others' actions)
  kenjougo: string; // Humble (lowering oneself/in-group actions)
  meaning: string;
  contextNote?: string;
}

export const KEIGO_EXERCISES: KeigoExercise[] = [
  {
    id: "k-1",
    plain: "行く (iku)",
    polite: "行きます",
    sonkeigo: "いらっしゃる / おいでになる",
    kenjougo: "参る (まいる) / 伺う (うかがう)",
    meaning: "To go",
    contextNote: "Use いらっしゃる when the client/superior is going; use 参る or 伺う when you are going to their office.",
  },
  {
    id: "k-2",
    plain: "来る (kuru)",
    polite: "来ます",
    sonkeigo: "いらっしゃる / お見えになる / お越しになる",
    kenjougo: "参る (まいる)",
    meaning: "To come",
    contextNote: "When welcoming a client: 『よくお越しくださいました』; when arriving: 『田中が参りました』.",
  },
  {
    id: "k-3",
    plain: "いる (iru)",
    polite: "います",
    sonkeigo: "いらっしゃる / おいでになる",
    kenjougo: "おる",
    meaning: "To be (animate/present)",
    contextNote: "Sonkeigo: 『社長はいらっしゃいますか』 vs Humble: 『はい、社内におります』.",
  },
  {
    id: "k-4",
    plain: "言う (iu)",
    polite: "言います",
    sonkeigo: "おっしゃる",
    kenjougo: "申す (もうす) / 申し上げる",
    meaning: "To say / To tell",
    contextNote: "Customer says: 『お客様がおっしゃいました』 vs You introduce: 『田中と申します』.",
  },
  {
    id: "k-5",
    plain: "食べる / 飲む (taberu / nomu)",
    polite: "食べます / 飲みます",
    sonkeigo: "召し上がる (めしあがる)",
    kenjougo: "いただく / 頂戴する",
    meaning: "To eat / To drink",
    contextNote: "Offer to guest: 『どうぞ召し上がってください』 vs Before receiving: 『いただきます』.",
  },
  {
    id: "k-6",
    plain: "見る (miru)",
    polite: "見ます",
    sonkeigo: "ご覧になる (ごらんになる)",
    kenjougo: "拝見する (はいけんする)",
    meaning: "To see / To look at",
    contextNote: "Ask client to view: 『資料をご覧ください』 vs When checking client's document: 『拝見します』.",
  },
  {
    id: "k-7",
    plain: "する (suru)",
    polite: "します",
    sonkeigo: "なさる / される",
    kenjougo: "いたす",
    meaning: "To do",
    contextNote: "Asking what boss will do: 『どうなさいますか』 vs Committing to help: 『私が手配いたします』.",
  },
  {
    id: "k-8",
    plain: "知っている (shitte iru)",
    polite: "知っています",
    sonkeigo: "ご存じです (ごぞんじです)",
    kenjougo: "存じております / 存じ上げております",
    meaning: "To know",
    contextNote: "Ask client: 『その件をご存じですか』 vs Humble answer: 『はい、存じ上げております』.",
  },
  {
    id: "k-9",
    plain: "聞く / 尋ねる / 訪ねる (kiku / tazuneru)",
    polite: "聞きます / 尋ねます",
    sonkeigo: "お聞きになる",
    kenjougo: "伺う (うかがう) / 拝聴する",
    meaning: "To ask / To inquire / To visit",
    contextNote: "When visiting client office: 『明日10時に伺います』; asking question: 『お話を伺いました』.",
  },
  {
    id: "k-10",
    plain: "会う (au)",
    polite: "会います",
    sonkeigo: "お会いになる",
    kenjougo: "お目にかかる (おめにかかる)",
    meaning: "To meet",
    contextNote: "Saying to a business partner: 『お目にかかれて光栄です』 (Honored to meet you).",
  },
  {
    id: "k-11",
    plain: "もらう (morau)",
    polite: "もらいます",
    sonkeigo: "お受け取りになる",
    kenjougo: "いただく / 頂戴する (ちょうだいする)",
    meaning: "To receive",
    contextNote: "When receiving a business card: 『お名刺を頂戴いたします』.",
  },
  {
    id: "k-12",
    plain: "あげる (ageru)",
    polite: "あげます",
    sonkeigo: "お与えになる",
    kenjougo: "差し上げる (さしあげる)",
    meaning: "To give",
    contextNote: "Offering gift to client: 『ささやかですが、お土産を差し上げます』.",
  },
  {
    id: "k-13",
    plain: "わかる (wakaru)",
    polite: "わかります / わかりました",
    sonkeigo: "ご理解になる",
    kenjougo: "かしこまりました / 承知いたしました",
    meaning: "To understand / Acknowledge",
    contextNote: "Business acknowledgement standard: 『かしこまりました』 or 『承知いたしました』 (Never '了解です' to superiors).",
  },
  {
    id: "k-14",
    plain: "着る (kiru)",
    polite: "着ます",
    sonkeigo: "お召しになる (おめしになる)",
    kenjougo: "身につける / 着用する",
    meaning: "To wear",
    contextNote: "Praising client outfit: 『素敵なコートをお召しですね』.",
  },
];

// Dictation sentences
export interface DictationExercise {
  id: string;
  audioPrompt: string;
  japanese: string;
  reading: string;
  romaji: string;
  translation: string;
  level: "N5" | "N4" | "N3";
  hint?: string;
}

export const DICTATION_EXERCISES: DictationExercise[] = [
  // ── N5 DICTATION ──
  {
    id: "d-1",
    audioPrompt: "おはようございます。きょうもがんばりましょう。",
    japanese: "おはようございます。今日も頑張りましょう。",
    reading: "おはようございます。きょうもがんばりましょう。",
    romaji: "ohayou gozaimasu. kyou mo ganbarimashou.",
    translation: "Good morning! Let's do our best today too.",
    level: "N5",
    hint: "Morning greeting and encouragement",
  },
  {
    id: "d-2",
    audioPrompt: "すみません、このえきからとうきょうタワーまでどういきますか。",
    japanese: "すみません、この駅から東京タワーまでどう行きますか。",
    reading: "すみません、このえきからとうきょうたわーまでどういきますか。",
    romaji: "sumimasen, kono eki kara toukyou tawaa made dou ikimasu ka.",
    translation: "Excuse me, how do I get to Tokyo Tower from this station?",
    level: "N5",
    hint: "Asking for directions to a famous landmark",
  },
  {
    id: "d-3",
    audioPrompt: "わたしはまいにち、あさごはんをたべてからがっこうへいきます。",
    japanese: "私は毎日、朝ご飯を食べてから学校へ行きます。",
    reading: "わたしは まいにち、あさごはんを たべてから がっこうへ いきます。",
    romaji: "watashi wa mainichi, asagohan o tabete kara gakkou e ikimasu.",
    translation: "Every day, I go to school after eating breakfast.",
    level: "N5",
    hint: "Daily morning routine with 〜てから",
  },
  {
    id: "d-4",
    audioPrompt: "きのう、ともだちといっしょにおいしいラーメンをたべました。",
    japanese: "昨日、友達と一緒においしいラーメンを食べました。",
    reading: "きのう、ともだちと いっしょに おいしい らーめんを たべました。",
    romaji: "kinou, tomodachi to issho ni oishii raamen o tabemashita.",
    translation: "Yesterday, I ate delicious ramen together with a friend.",
    level: "N5",
    hint: "Past action with a friend",
  },
  {
    id: "d-5",
    audioPrompt: "すみません、メニューをみせてください。みずもおねがいします。",
    japanese: "すみません、メニューを見せてください。水もお願いします。",
    reading: "すみません、めにゅーを みせてください。みずも おねがいします。",
    romaji: "sumimasen, menyuu o misete kudasai. mizu mo onegaishimasu.",
    translation: "Excuse me, please show me the menu. Water as well, please.",
    level: "N5",
    hint: "Polite request at a restaurant",
  },

  // ── N4 DICTATION ──
  {
    id: "d-6",
    audioPrompt: "らいしゅうのしけんのために、まいばんふくしゅうしています。",
    japanese: "来週の試験のために、毎晩復習しています。",
    reading: "らいしゅうの しけんのために、まいばん ふくしゅう しています。",
    romaji: "raishuu no shiken no tame ni, maiban fukushuu shiteimasu.",
    translation: "For next week's exam, I review every night.",
    level: "N4",
    hint: "Preparation for upcoming test (〜のために)",
  },
  {
    id: "d-7",
    audioPrompt: "てんきよほうによると、あしたはごごからあめがふるそうです。",
    japanese: "天気予報によると、明日は午後から雨が降るそうです。",
    reading: "てんきよほうによると、あしたは ごごから あめが ふるそうです。",
    romaji: "tenki yohou ni yoru to, ashita wa gogo kara ame ga furu sou desu.",
    translation: "According to the weather forecast, it is said it will rain from tomorrow afternoon.",
    level: "N4",
    hint: "Hearsay grammar (〜によると ... 〜そうだ)",
  },
  {
    id: "d-8",
    audioPrompt: "にほんごがもっとじょうずにすらすらはなせるようになりたいです。",
    japanese: "日本語がもっと上手にすらすら話せるようになりたいです。",
    reading: "にほんごが もっと じょうずに すらすら はなせるように なりたいです。",
    romaji: "nihongo ga motto jouzu ni surasura hanaseru you ni naritai desu.",
    translation: "I want to become able to speak Japanese more fluently.",
    level: "N4",
    hint: "Expressing a desired capability (〜ようになる)",
  },
  {
    id: "d-9",
    audioPrompt: "パスポートをなくしてしまったので、たいしかんへいかなければなりません。",
    japanese: "パスポートをなくしてしまったので、大使館へ行かなければなりません。",
    reading: "ぱすぽーとを なくしてしまったので、たいしかんへ いかなければなりません。",
    romaji: "pasupooto o nakushite shimatta node, taishikan e ikanakereba narimasen.",
    translation: "Because I lost my passport, I have to go to the embassy.",
    level: "N4",
    hint: "Regret (〜てしまう) and obligation (〜なければならない)",
  },
  {
    id: "d-10",
    audioPrompt: "しゅくだいをおわらせてから、ゲームをしてあそびました。",
    japanese: "宿題を終わらせてから、ゲームをして遊びました。",
    reading: "しゅくだいを おわらせてから、げーむをして あそびました。",
    romaji: "shukudai o owarasete kara, geemu o shite asobimashita.",
    translation: "After finishing my homework, I played games and had fun.",
    level: "N4",
    hint: "Sequential actions with transitive verb",
  },

  // ── N3 DICTATION ──
  {
    id: "d-11",
    audioPrompt: "健康のために毎日一万歩歩くことにしています。",
    japanese: "健康のために毎日一万歩歩くことにしています。",
    reading: "けんこうのために まいにち いちまんぽ あるくことに しています。",
    romaji: "kenkou no tame ni mainichi ichimanpo aruku koto ni shiteimasu.",
    translation: "For my health, I make it a habit to walk 10,000 steps every day.",
    level: "N3",
    hint: "Habitual rule (〜ことにしている)",
  },
  {
    id: "d-12",
    audioPrompt: "どんなに忙しくても、睡眠時間だけはしっかり確保するべきです。",
    japanese: "どんなに忙しくても、睡眠時間だけはしっかり確保するべきです。",
    reading: "どんなに いそがしくても、すいみんじかん だけは しっかり かくほするべきです。",
    romaji: "donna ni isogashikutemo, suimin jikan dake wa shikkari kakuho suru beki desu.",
    translation: "No matter how busy you are, you should secure adequate sleep time.",
    level: "N3",
    hint: "No matter how (どんなに〜ても) + obligation (〜べき)",
  },
  {
    id: "d-13",
    audioPrompt: "先輩のアドバイスのおかげで、無事にプロジェクトを完了できました。",
    japanese: "先輩のアドバイスのおかげで、無事にプロジェクトを完了できました。",
    reading: "せんぱいの あどばいすの おかげで、ぶじに ぷろじぇくとを かんりょう できました。",
    romaji: "senpai no adobaisu no okage de, buji ni purojekuto o kanryou dekimashita.",
    translation: "Thanks to my senior's advice, we were able to complete the project smoothly.",
    level: "N3",
    hint: "Gratitude expression (〜のおかげで)",
  },
];

// Shadowing Exercises
export interface ShadowingLine {
  speaker?: string;
  japanese: string;
  reading: string;
  english: string;
}

export interface ShadowingExercise {
  id: string;
  title: string;
  level: "N5" | "N4" | "N3";
  theme: string;
  description: string;
  lines: ShadowingLine[];
}

export const SHADOWING_EXERCISES: ShadowingExercise[] = [
  {
    id: "sh-1",
    title: "Self Introduction at Work",
    level: "N5",
    theme: "Business Greeting",
    description: "Learn polite introductory Japanese for greeting coworkers and introducing your background.",
    lines: [
      {
        speaker: "Tanaka",
        japanese: "はじめまして。田中と申します。",
        reading: "はじめまして。たなかと もうします。",
        english: "Nice to meet you. My name is Tanaka.",
      },
      {
        speaker: "Tanaka",
        japanese: "今年からこちらの部署で働くことになりました。",
        reading: "ことしから こちらの ぶしょで はたらくことに なりました。",
        english: "I will be working in this department starting this year.",
      },
      {
        speaker: "Tanaka",
        japanese: "至らない点も多いと思いますが、一生懸命頑張ります。",
        reading: "いたらない てんも おおいと おもいますが、いっしょうけんめい がんばります。",
        english: "I still have much to learn, but I will do my absolute best.",
      },
      {
        speaker: "Tanaka",
        japanese: "どうぞよろしくお願いいたします。",
        reading: "どうぞ よろしく おねがいいたします。",
        english: "I look forward to working with you all.",
      },
    ],
  },
  {
    id: "sh-2",
    title: "Ordering at a Traditional Cafe",
    level: "N5",
    theme: "Daily Life & Dining",
    description: "Practice smooth conversational rhythm when entering a coffee shop, requesting a seat, and ordering.",
    lines: [
      {
        speaker: "Staff",
        japanese: "いらっしゃいませ。何名様でしょうか。",
        reading: "いらっしゃいませ。なんめいさま でしょうか。",
        english: "Welcome! How many people in your party?",
      },
      {
        speaker: "Customer",
        japanese: "一人です。窓側の席は空いていますか。",
        reading: "ひとりです。まどがわの せきは あいていますか。",
        english: "Just one. Is a window seat available?",
      },
      {
        speaker: "Staff",
        japanese: "はい、どうぞこちらの席へご案内いたします。",
        reading: "はい、どうぞ こちらの せきへ ごあんない いたします。",
        english: "Yes, please allow me to show you to this table.",
      },
      {
        speaker: "Customer",
        japanese: "アイスコーヒーと抹茶ケーキをお願いします。",
        reading: "あいすこーひーと まっちゃけーきを おねがいします。",
        english: "An iced coffee and matcha cake, please.",
      },
      {
        speaker: "Staff",
        japanese: "かしこまりました。少々お待ちくださいませ。",
        reading: "かしこまりました。しょうしょう おまち くださいませ。",
        english: "Understood right away. Please wait just a moment.",
      },
    ],
  },
  {
    id: "sh-3",
    title: "Asking Directions in Shinjuku",
    level: "N4",
    theme: "Travel & Transit",
    description: "Navigate Japanese train stations and ask friendly locals for walking directions.",
    lines: [
      {
        speaker: "Traveler",
        japanese: "すみません、ちょっとお聞きしてもよろしいですか。",
        reading: "すみません、ちょっと おききしても よろしいですか。",
        english: "Excuse me, may I ask you a quick question?",
      },
      {
        speaker: "Local",
        japanese: "はい、何でしょうか。道に迷われましたか。",
        reading: "はい、なんでしょうか。みちに まよわれましたか。",
        english: "Yes, what is it? Are you lost?",
      },
      {
        speaker: "Traveler",
        japanese: "東京都庁に行きたいのですが、どの出口を出ればいいですか。",
        reading: "とうきょうとちょうに いきたいのですが、どのでぐちを でれば いいですか。",
        english: "I want to go to the Tokyo Metropolitan Government Building. Which exit should I take?",
      },
      {
        speaker: "Local",
        japanese: "西口を出て、地下通路をまっすぐ５分ほど歩くと着きますよ。",
        reading: "にしぐちを でて、ちかつうろを まっすぐ ごふんほど あるくと つきますよ。",
        english: "Take the West Exit, walk straight through the underground passage for about 5 minutes, and you'll arrive.",
      },
      {
        speaker: "Traveler",
        japanese: "分かりやすく教えていただき、ありがとうございます！",
        reading: "わかりやすく おしえていただき、ありがとう ございます！",
        english: "Thank you very much for the clear explanation!",
      },
    ],
  },
  {
    id: "sh-4",
    title: "Checking into a Kyoto Ryokan",
    level: "N4",
    theme: "Hospitality & Travel",
    description: "Master polite hotel Japanese when confirming reservations and asking about hot springs and dining.",
    lines: [
      {
        speaker: "Guest",
        japanese: "こんばんは。本日予約しているスミスと申します。",
        reading: "こんばんは。ほんじつ よやくしている すみすと もうします。",
        english: "Good evening. My name is Smith, I have a reservation for today.",
      },
      {
        speaker: "Staff",
        japanese: "スミス様、ようこそお越しくださいました。お部屋をご用意しております。",
        reading: "すみすさま、ようこそ おこしくださいました。おへやを ごようい しております。",
        english: "Mr. Smith, welcome! We have your traditional room prepared.",
      },
      {
        speaker: "Guest",
        japanese: "温泉は何時から利用できますか。",
        reading: "おんせんは なんじから りよう できますか。",
        english: "From what time can we use the hot spring bath?",
      },
      {
        speaker: "Staff",
        japanese: "大浴場は夜通しご利用いただけます。夕食は七時にお部屋へお持ちします。",
        reading: "だいよくじょうは よどおし ごりよう いただけます。ゆうしょくは しちじに おへやへ おもちします。",
        english: "The main bath is available all night. Dinner will be served to your room at 7:00 PM.",
      },
    ],
  },
  {
    id: "sh-5",
    title: "Discussing Weekend Plans with a Colleague",
    level: "N3",
    theme: "Casual Business & Social",
    description: "Natural conversational transitions, giving recommendations, and making plans with peers.",
    lines: [
      {
        speaker: "Kenji",
        japanese: "今度の週末、何か予定ある？もしよかったらハイキングに行かない？",
        reading: "こんどの しゅうまつ、なにか よてい ある？もし よかったら はいきんぐに いかない？",
        english: "Do you have any plans this upcoming weekend? If you'd like, want to go hiking?",
      },
      {
        speaker: "Yuki",
        japanese: "いいね！高尾山あたりはどう？紅葉が見頃らしいよ。",
        reading: "いいね！たかおさん あたりは どう？こうようが みごろ らしいよ。",
        english: "Sounds great! How about around Mt. Takao? I heard the autumn leaves are at their peak.",
      },
      {
        speaker: "Kenji",
        japanese: "最高だね。朝早く出発すれば混雑を避けられると思うんだ。",
        reading: "さいこうだね。あさはやく しゅっぱつ すれば こんざつを さけられると おもうんだ。",
        english: "Awesome. If we leave early in the morning, I think we can beat the crowds.",
      },
      {
        speaker: "Yuki",
        japanese: "賛成！じゃあ新宿駅に朝七時半集合にしようか。",
        reading: "さんせい！じゃあ しんじゅくえきに あさ しちじはんに しゅうごうに しようか。",
        english: "Agreed! Let's meet at Shinjuku Station at 7:30 AM then.",
      },
    ],
  },
];

