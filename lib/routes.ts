export type NavItem = {
  label: string;
  href: string;
  description?: string;
};

export const jlptLevels = ["n5", "n4", "n3", "n2", "n1"] as const;
export type JlptLevelSlug = (typeof jlptLevels)[number];

export const mainNav: NavItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Kana", href: "/kana" },
  { label: "Sessions", href: "/sessions" },
  { label: "Statistics", href: "/stats" },
  { label: "Data Editor", href: "/data" },
];

export const kanaNav: NavItem[] = [
  { label: "Hiragana", href: "/kana/hiragana" },
  { label: "Katakana", href: "/kana/katakana" },
];

export const levelSections = ["vocabulary", "kanji", "grammar"] as const;
export type LevelSection = (typeof levelSections)[number];

export function formatLevel(slug: string) {
  return slug.toUpperCase();
}
