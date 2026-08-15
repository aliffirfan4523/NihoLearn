export interface KanjiRequirementItem {
  id: string;
  kanji: string;
  onyomi: string[];
  kunyomi: string[];
  meaning: string[];
  strokes: number;
  level: "N5" | "N4" | "N3";
  masteryPercent: number; // 0..100
  status: "unlearned" | "learning" | "mastered";
  examples: string[];
}

export interface RadicalItem {
  radical: string;
  strokes: number;
  name: string;
  meaning: string;
  examples: string[];
}

export const n5KanjiRequirementsList: KanjiRequirementItem[] = [
  { id: "kj_001", kanji: "日", onyomi: ["ニチ", "ジツ"], kunyomi: ["ひ", "-び", "-か"], meaning: ["day", "sun", "Japan"], strokes: 4, level: "N5", masteryPercent: 0, status: "unlearned", examples: ["日本 (Japan)", "日曜日 (Sunday)", "今日 (Today)"] },
  { id: "kj_002", kanji: "一", onyomi: ["イチ", "イツ"], kunyomi: ["ひと-", "ひと.つ"], meaning: ["one"], strokes: 1, level: "N5", masteryPercent: 0, status: "unlearned", examples: ["一つ (One thing)", "一日 (First day)", "一人 (One person)"] },
  { id: "kj_003", kanji: "国", onyomi: ["コク"], kunyomi: ["くに"], meaning: ["country"], strokes: 8, level: "N5", masteryPercent: 0, status: "unlearned", examples: ["外国 (Foreign country)", "中国 (China)", "国 (Country)"] },
  { id: "kj_004", kanji: "人", onyomi: ["ジン", "ニン"], kunyomi: ["ひと", "-り", "-と"], meaning: ["person"], strokes: 2, level: "N5", masteryPercent: 0, status: "unlearned", examples: ["日本人 (Japanese person)", "三人 (Three people)", "あの人 (That person)"] },
  { id: "kj_005", kanji: "年", onyomi: ["ネン"], kunyomi: ["とし"], meaning: ["year"], strokes: 6, level: "N5", masteryPercent: 0, status: "unlearned", examples: ["今年 (This year)", "去年 (Last year)", "一年生 (First year student)"] },
  { id: "kj_006", kanji: "大", onyomi: ["ダイ", "タイ"], kunyomi: ["おお-", "おお.きい"], meaning: ["large", "big"], strokes: 3, level: "N5", masteryPercent: 0, status: "unlearned", examples: ["大学 (University)", "大人 (Adult)", "大きい (Big)"] },
  { id: "kj_007", kanji: "十", onyomi: ["ジュウ", "ジッ"], kunyomi: ["とお", "と"], meaning: ["ten"], strokes: 2, level: "N5", masteryPercent: 0, status: "unlearned", examples: ["十 (Ten)", "十分 (Ten minutes / Enough)", "十日 (Tenth day)"] },
  { id: "kj_008", kanji: "二", onyomi: ["ニ", "ジ"], kunyomi: ["ふた", "ふた.つ"], meaning: ["two"], strokes: 2, level: "N5", masteryPercent: 0, status: "unlearned", examples: ["二つ (Two things)", "二人 (Two people)", "二月 (February)"] },
  { id: "kj_009", kanji: "本", onyomi: ["ホン"], kunyomi: ["もと"], meaning: ["book", "origin", "main"], strokes: 5, level: "N5", masteryPercent: 0, status: "unlearned", examples: ["本 (Book)", "日本 (Japan)", "山本 (Yamamoto)"] },
  { id: "kj_010", kanji: "中", onyomi: ["チュウ"], kunyomi: ["なか", "うち", "あた.る"], meaning: ["in", "inside", "middle"], strokes: 4, level: "N5", masteryPercent: 0, status: "unlearned", examples: ["部屋の中 (Inside the room)", "一日中 (All day long)", "中学 (Middle school)"] },
  { id: "kj_011", kanji: "長", onyomi: ["チョウ"], kunyomi: ["なが.い", "おさ"], meaning: ["long", "leader"], strokes: 8, level: "N5", masteryPercent: 0, status: "unlearned", examples: ["長い (Long)", "社長 (Company president)", "校長 (Principal)"] },
  { id: "kj_012", kanji: "出", onyomi: ["シュツ", "スイ"], kunyomi: ["で.る", "-で", "だ.す"], meaning: ["exit", "leave", "go out"], strokes: 5, level: "N5", masteryPercent: 0, status: "unlearned", examples: ["出口 (Exit)", "出る (To go out)", "出す (To take out)"] },
  { id: "kj_013", kanji: "三", onyomi: ["サン", "ゾウ"], kunyomi: ["み", "み.つ", "みっ.つ"], meaning: ["three"], strokes: 3, level: "N5", masteryPercent: 0, status: "unlearned", examples: ["三つ (Three things)", "三月 (March)", "三人 (Three people)"] },
  { id: "kj_014", kanji: "時", onyomi: ["ジ"], kunyomi: ["とき", "-どき"], meaning: ["time", "hour"], strokes: 10, level: "N5", masteryPercent: 0, status: "unlearned", examples: ["何時 (What time)", "時間 (Time / Hours)", "時計 (Watch / Clock)"] },
  { id: "kj_015", kanji: "行", onyomi: ["コウ", "ギョウ", "アン"], kunyomi: ["い.く", "ゆ.く", "おこな.う"], meaning: ["go", "act", "line"], strokes: 6, level: "N5", masteryPercent: 0, status: "unlearned", examples: ["行く (To go)", "銀行 (Bank)", "旅行 (Travel)"] },
  { id: "kj_016", kanji: "見", onyomi: ["ケン"], kunyomi: ["み.る", "み.える", "み.せる"], meaning: ["see", "hopes", "chances"], strokes: 7, level: "N5", masteryPercent: 0, status: "unlearned", examples: ["見る (To see)", "見せる (To show)", "意見 (Opinion)"] },
  { id: "kj_017", kanji: "月", onyomi: ["ゲツ", "ガツ"], kunyomi: ["つき"], meaning: ["month", "moon"], strokes: 4, level: "N5", masteryPercent: 0, status: "unlearned", examples: ["月曜日 (Monday)", "今月 (This month)", "月 (Moon)"] },
  { id: "kj_018", kanji: "後", onyomi: ["ゴ", "コウ"], kunyomi: ["のち", "うし.ろ", "あと"], meaning: ["behind", "back", "later"], strokes: 9, level: "N5", masteryPercent: 0, status: "unlearned", examples: ["午後 (Afternoon / PM)", "後ろ (Behind)", "その後 (After that)"] },
  { id: "kj_019", kanji: "生", onyomi: ["セイ", "ショウ"], kunyomi: ["い.きる", "う.まれる", "なま"], meaning: ["life", "genuine", "birth"], strokes: 5, level: "N5", masteryPercent: 0, status: "unlearned", examples: ["学生 (Student)", "先生 (Teacher)", "生まれる (To be born)"] },
  { id: "kj_020", kanji: "五", onyomi: ["ゴ"], kunyomi: ["いつ", "いつ.つ"], meaning: ["five"], strokes: 4, level: "N5", masteryPercent: 0, status: "unlearned", examples: ["五つ (Five things)", "五月 (May)", "五人 (Five people)"] },
  { id: "kj_021", kanji: "間", onyomi: ["カン", "ケン"], kunyomi: ["あいだ", "ま", "あい"], meaning: ["interval", "space"], strokes: 12, level: "N5", masteryPercent: 0, status: "unlearned", examples: ["時間 (Time)", "間に合う (To be in time)", "この間 (The other day)"] },
  { id: "kj_022", kanji: "上", onyomi: ["ジョウ", "ショウ"], kunyomi: ["うえ", "-うえ", "あ.がる"], meaning: ["above", "up"], strokes: 3, level: "N5", masteryPercent: 0, status: "unlearned", examples: ["上 (Above / On)", "上手 (Skillful)", "上がる (To go up)"] },
  { id: "kj_023", kanji: "東", onyomi: ["トウ"], kunyomi: ["ひがし"], meaning: ["east"], strokes: 8, level: "N5", masteryPercent: 0, status: "unlearned", examples: ["東京 (Tokyo)", "東 (East)", "東口 (East exit)"] },
  { id: "kj_024", kanji: "四", onyomi: ["シ"], kunyomi: ["よ", "よ.つ", "よっ.つ", "よん"], meaning: ["four"], strokes: 5, level: "N5", masteryPercent: 0, status: "unlearned", examples: ["四つ (Four things)", "四月 (April)", "四人 (Four people)"] },
  { id: "kj_025", kanji: "今", onyomi: ["コン", "キン"], kunyomi: ["いま"], meaning: ["now"], strokes: 4, level: "N5", masteryPercent: 0, status: "unlearned", examples: ["今 (Now)", "今日 (Today)", "今月 (This month)"] },
];

export const radicalsTableList: RadicalItem[] = [
  { radical: "一", strokes: 1, name: "いち (Ichi)", meaning: "One", examples: ["一", "丁", "七", "万"] },
  { radical: "丨", strokes: 1, name: "ぼう (Bou)", meaning: "Stick / Line", examples: ["中", "串"] },
  { radical: "丶", strokes: 1, name: "てん (Ten)", meaning: "Dot", examples: ["丸", "主", "丹"] },
  { radical: "丿", strokes: 1, name: "の (No)", meaning: "Bend / Slash", examples: ["久", "千", "乏"] },
  { radical: "乙", strokes: 1, name: "おつ (Otsu)", meaning: "Second / Curved line", examples: ["九", "乞", "也"] },
  { radical: "亅", strokes: 1, name: "はねぼう (Hanebou)", meaning: "Hook", examples: ["了", "予", "事"] },
  { radical: "人 (亻)", strokes: 2, name: "ひと / にんべん (Ninben)", meaning: "Person / Human", examples: ["休", "体", "作", "使"] },
  { radical: "口", strokes: 3, name: "くち (Kuchi)", meaning: "Mouth / Opening", examples: ["言", "古", "品", "告"] },
  { radical: "日", strokes: 4, name: "ひ / にちへん (Nichi)", meaning: "Sun / Day", examples: ["明", "時", "晩", "春"] },
  { radical: "木", strokes: 4, name: "き / きへん (Kihen)", meaning: "Tree / Wood", examples: ["林", "森", "校", "村"] },
  { radical: "水 (氵)", strokes: 3, name: "さんずい (Sanzui)", meaning: "Water", examples: ["海", "池", "湖", "洗"] },
  { radical: "火 (灬)", strokes: 4, name: "ひ / れんが (Renga)", meaning: "Fire", examples: ["点", "熱", "照", "黒"] },
];
