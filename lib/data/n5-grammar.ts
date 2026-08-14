import type { GrammarPoint } from "@/types";

export const n5Grammar: GrammarPoint[] = [
  {
    id: "n5_g001",
    level: "N5",
    title: "〜は〜です",
    meaning: "A is B (equational statement)",
    structure: "Noun は Noun です",
    examples: [
      { japanese: "私は学生です。", reading: "わたしはがくせいです。", english: "I am a student." },
      { japanese: "これは本です。", reading: "これはほんです。", english: "This is a book." },
    ],
  },
  {
    id: "n5_g002",
    level: "N5",
    title: "〜じゃないです / 〜ではありません",
    meaning: "A is not B (negative equational)",
    structure: "Noun じゃないです / Noun ではありません",
    examples: [
      { japanese: "私は先生じゃないです。", reading: "わたしはせんせいじゃないです。", english: "I am not a teacher." },
      { japanese: "これは水ではありません。", reading: "これはみずではありません。", english: "This is not water." },
    ],
  },
  {
    id: "n5_g003",
    level: "N5",
    title: "〜が",
    meaning: "Subject marker (identifying the subject)",
    structure: "Noun が",
    examples: [
      { japanese: "猫がいます。", reading: "ねこがいます。", english: "There is a cat." },
      { japanese: "だれが来ますか。", reading: "だれがきますか。", english: "Who is coming?" },
    ],
  },
  {
    id: "n5_g004",
    level: "N5",
    title: "〜を",
    meaning: "Direct object marker",
    structure: "Noun を Verb",
    examples: [
      { japanese: "りんごを食べる。", reading: "りんごをたべる。", english: "I eat an apple." },
      { japanese: "本を読みます。", reading: "ほんをよみます。", english: "I read a book." },
    ],
  },
  {
    id: "n5_g005",
    level: "N5",
    title: "〜に",
    meaning: "Destination / time / purpose marker",
    structure: "Noun に Verb",
    examples: [
      { japanese: "学校に行く。", reading: "がっこうにいく。", english: "I go to school." },
      { japanese: "六時に起きる。", reading: "ろくじにおきる。", english: "I wake up at 6 o'clock." },
    ],
  },
  {
    id: "n5_g006",
    level: "N5",
    title: "〜で",
    meaning: "Location of action / means / tool",
    structure: "Noun で Verb",
    examples: [
      { japanese: "図書館で勉強する。", reading: "としょかんでべんきょうする。", english: "I study at the library." },
      { japanese: "はしで食べる。", reading: "はしでたべる。", english: "I eat with chopsticks." },
    ],
  },
  {
    id: "n5_g007",
    level: "N5",
    title: "〜と",
    meaning: "Together with / and",
    structure: "Noun と Noun / Noun と Verb",
    examples: [
      { japanese: "友だちと行く。", reading: "ともだちといく。", english: "I go with a friend." },
      { japanese: "りんごとみかん。", reading: "りんごとみかん。", english: "Apple and orange." },
    ],
  },
  {
    id: "n5_g008",
    level: "N5",
    title: "〜も",
    meaning: "Also / too",
    structure: "Noun も",
    examples: [
      { japanese: "私も学生です。", reading: "わたしもがくせいです。", english: "I am also a student." },
      { japanese: "これもください。", reading: "これもください。", english: "This one too, please." },
    ],
  },
  {
    id: "n5_g009",
    level: "N5",
    title: "〜の",
    meaning: "Possessive / modifier particle",
    structure: "Noun の Noun",
    examples: [
      { japanese: "私の本です。", reading: "わたしのほんです。", english: "It is my book." },
      { japanese: "日本語の先生。", reading: "にほんごのせんせい。", english: "Japanese teacher." },
    ],
  },
  {
    id: "n5_g010",
    level: "N5",
    title: "〜ている",
    meaning: "Ongoing action / current state",
    structure: "Verb (te-form) + いる",
    examples: [
      { japanese: "食べている。", reading: "たべている。", english: "I am eating." },
      { japanese: "住んでいる。", reading: "すんでいる。", english: "I live (somewhere)." },
    ],
  },
  {
    id: "n5_g011",
    level: "N5",
    title: "〜たい",
    meaning: "Want to do (attached to verb stem)",
    structure: "Verb stem + たい",
    examples: [
      { japanese: "水が飲みたい。", reading: "みずがのみたい。", english: "I want to drink water." },
      { japanese: "行きたいです。", reading: "いきたいです。", english: "I want to go." },
    ],
  },
  {
    id: "n5_g012",
    level: "N5",
    title: "〜ません",
    meaning: "Negative polite form of a verb",
    structure: "Verb (masu-stem) + ません",
    examples: [
      { japanese: "食べません。", reading: "たべません。", english: "I do not eat." },
      { japanese: "行きません。", reading: "いきません。", english: "I am not going." },
    ],
  },
  {
    id: "n5_g013",
    level: "N5",
    title: "〜ましょう",
    meaning: "Let's do (volitional polite)",
    structure: "Verb (masu-stem) + ましょう",
    examples: [
      { japanese: "食べましょう。", reading: "たべましょう。", english: "Let's eat." },
      { japanese: "行きましょう。", reading: "いきましょう。", english: "Let's go." },
    ],
  },
  {
    id: "n5_g014",
    level: "N5",
    title: "〜から",
    meaning: "Because / since (reason)",
    structure: "Sentence から、Sentence",
    examples: [
      { japanese: "寒いから、家にいる。", reading: "さむいから、いえにいる。", english: "Because it's cold, I stay home." },
      { japanese: "忙しいから、行けない。", reading: "いそがしいから、いけない。", english: "Because I'm busy, I can't go." },
    ],
  },
  {
    id: "n5_g015",
    level: "N5",
    title: "〜より",
    meaning: "Comparison (A is more... than B)",
    structure: "Noun より Noun のほうが",
    examples: [
      { japanese: "肉より魚のほうが好きです。", reading: "にくよりさかなのほうがすきです。", english: "I prefer fish over meat." },
      { japanese: "夏より冬のほうが好きです。", reading: "なつよりふゆのほうがすきです。", english: "I prefer winter over summer." },
    ],
  },
];
