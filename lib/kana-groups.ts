/**
 * Kana row grouping shared by dashboard / roadmap / progress pages.
 * The DB Kana table carries the same `row` values, replacing the old
 * static-seed array slicing (slice(0,46) basic, slice(46,71) dakuten, etc.).
 */

export const BASIC_ROWS = ["a", "ka", "sa", "ta", "na", "ha", "ma", "ya", "ra", "wa"];
export const DAKUTEN_ROWS = ["ga", "za", "da", "ba", "pa"];
export const COMBO_ROWS = [
  "kya", "sha", "cha", "nya", "hya", "mya", "rya",
  "gya", "ja", "bya", "pya",
];

export interface KanaRef {
  id: string;
  type: string;
  character: string;
  romaji: string;
  row: string;
}

export function kanaByGroup<T extends KanaRef>(list: T[], type: "hiragana" | "katakana", rows: string[]): T[] {
  return list.filter((k) => k.type === type && rows.includes(k.row));
}
