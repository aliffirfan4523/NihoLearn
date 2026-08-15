export interface RadicalItem {
  radicalNumber: number;
  radical: string;
  strokes: number;
  name: string;
  meaning: string;
  examples: string[];
}

export const radicalsTableList: RadicalItem[] = [
  { radicalNumber: 1, radical: "一", strokes: 1, name: "いち (Ichi)", meaning: "One", examples: ["一", "丁", "七", "万"] },
  { radicalNumber: 2, radical: "丨", strokes: 1, name: "ぼう (Bou)", meaning: "Stick / Line", examples: ["中", "串"] },
  { radicalNumber: 3, radical: "丶", strokes: 1, name: "てん (Ten)", meaning: "Dot", examples: ["丸", "主", "丹"] },
  { radicalNumber: 4, radical: "丿", strokes: 1, name: "の (No)", meaning: "Bend / Slash", examples: ["久", "千", "乏"] },
  { radicalNumber: 5, radical: "乙", strokes: 1, name: "おつ (Otsu)", meaning: "Second / Curved line", examples: ["九", "乞", "也"] },
  { radicalNumber: 6, radical: "亅", strokes: 1, name: "はねぼう (Hanebou)", meaning: "Hook", examples: ["了", "予", "事"] },
  { radicalNumber: 9, radical: "人 (亻)", strokes: 2, name: "ひと / にんべん (Ninben)", meaning: "Person / Human", examples: ["休", "体", "作", "使"] },
  { radicalNumber: 30, radical: "口", strokes: 3, name: "くち (Kuchi)", meaning: "Mouth / Opening", examples: ["言", "古", "品", "告"] },
  { radicalNumber: 72, radical: "日", strokes: 4, name: "ひ / にちへん (Nichi)", meaning: "Sun / Day", examples: ["明", "時", "晩", "春"] },
  { radicalNumber: 75, radical: "木", strokes: 4, name: "き / きへん (Kihen)", meaning: "Tree / Wood", examples: ["林", "森", "校", "村"] },
  { radicalNumber: 85, radical: "水 (氵)", strokes: 3, name: "さんずい (Sanzui)", meaning: "Water", examples: ["海", "池", "湖", "洗"] },
  { radicalNumber: 86, radical: "火 (灬)", strokes: 4, name: "ひ / れんが (Renga)", meaning: "Fire", examples: ["点", "熱", "照", "黒"] },
];
