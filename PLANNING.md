# 日本語トラッカー — Nihongo Tracker
## Full Project Planning Document

---

## 1. Project Overview

A personal Japanese language learning progress tracker covering:
- **Kana**: Hiragana & Katakana (writing systems)
- **JLPT Levels**: N5 → N4 → N3 → N2 → N1 (from beginner to advanced)
- **Progress Tracking**: Vocabulary, grammar, kanji, listening, reading — per level
- **Dashboard**: Visual progress overview across all levels

---

## 2. Framework Recommendation

### ✅ Recommended: **Next.js 14 (App Router) + TypeScript**

| Concern | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 | SSR/SSG, file-based routing, great DX |
| Language | TypeScript | Type safety for complex learning data structures |
| Styling | Tailwind CSS | Fast utility-first, consistent spacing |
| UI Components | shadcn/ui | Accessible, unstyled components, easy to theme |
| Database | SQLite via Prisma | Local-first, zero config, perfect for personal app |
| State | Zustand | Lightweight state for UI progress tracking |
| Charts | Recharts | Simple progress visualizations |
| Auth | NextAuth.js (optional) | If you want login for multiple devices |

### Why Not Other Options?
- **Vite + React (SPA)**: No SSR, harder for SEO, but fine if you want simpler setup
- **Nuxt/Vue**: Less ecosystem for Japanese learning libs
- **Astro**: Better for static sites, not ideal for interactive progress tracking
- **Django/Rails**: Overkill backend for a personal tracker

---

## 3. Feature Scope

### Phase 1 — Core (MVP)
- [ ] Hiragana chart with mastery checkboxes
- [ ] Katakana chart with mastery checkboxes
- [ ] JLPT N5 vocabulary list (800 words) with learned/reviewing/mastered states
- [ ] JLPT N5 grammar points tracker
- [ ] JLPT N5 Kanji tracker (100 kanji)
- [ ] Dashboard with overall progress %

### Phase 2 — Intermediate
- [ ] N4 content (vocabulary, grammar, kanji)
- [ ] Flashcard review mode (SRS-lite)
- [ ] Study session log (date + duration + what you studied)
- [ ] Progress charts (weekly activity, level completion %)
- [ ] Notes per vocabulary word / grammar point

### Phase 3 — Advanced
- [ ] N3, N2, N1 content
- [ ] Full SRS (Spaced Repetition System) with intervals
- [ ] Reading practice log (books, articles, manga)
- [ ] Listening log (podcasts, anime, shows)
- [ ] Export progress as PDF / CSV
- [ ] PWA support (offline, mobile-friendly)

---

## 4. Data Models

### Kana
```typescript
interface KanaCharacter {
  id: string;           // e.g. "hira_a", "kata_ka"
  type: "hiragana" | "katakana";
  romaji: string;       // "a", "ka", "shi"
  character: string;    // "あ", "カ"
  row: string;          // "a-row", "ka-row"
  status: "unlearned" | "learning" | "mastered";
  masteredAt?: Date;
}
```

### JLPT Vocabulary
```typescript
interface VocabWord {
  id: string;
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  word: string;         // "食べる"
  reading: string;      // "たべる"
  romaji: string;       // "taberu"
  meaning: string[];    // ["to eat"]
  partOfSpeech: string; // "verb (ichidan)"
  exampleSentence?: string;
  status: "unlearned" | "reviewing" | "mastered";
  nextReviewAt?: Date;
  notes?: string;
  addedAt: Date;
  masteredAt?: Date;
}
```

### JLPT Kanji
```typescript
interface KanjiEntry {
  id: string;
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  character: string;    // "日"
  onyomi: string[];     // ["ニチ", "ジツ"]
  kunyomi: string[];    // ["ひ", "か"]
  meaning: string[];    // ["day", "sun"]
  strokeCount: number;
  exampleWords: string[];
  status: "unlearned" | "reviewing" | "mastered";
  notes?: string;
}
```

### Grammar Points
```typescript
interface GrammarPoint {
  id: string;
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  title: string;        // "〜ている"
  meaning: string;      // "ongoing action / state"
  structure: string;    // "Verb (te-form) + いる"
  examples: Array<{
    japanese: string;
    reading: string;
    english: string;
  }>;
  status: "unlearned" | "reviewing" | "mastered";
  notes?: string;
}
```

### Study Session
```typescript
interface StudySession {
  id: string;
  date: Date;
  durationMinutes: number;
  level: "N5" | "N4" | "N3" | "N2" | "N1" | "kana" | "mixed";
  activities: Array<"vocabulary" | "kanji" | "grammar" | "reading" | "listening" | "writing" | "kana">;
  wordsReviewed?: number;
  kanjiReviewed?: number;
  notes?: string;
}
```

---

## 5. Page Structure / Routes

```
/                          → Dashboard (overview, streaks, recent activity)
/kana                      → Kana overview (hiragana + katakana progress)
/kana/hiragana             → Full hiragana chart with status toggles
/kana/katakana             → Full katakana chart with status toggles
/n5                        → N5 level overview
/n5/vocabulary             → N5 vocab list + search/filter
/n5/kanji                  → N5 kanji tracker
/n5/grammar                → N5 grammar points
/n4                        → N4 level overview  (same structure)
/n4/vocabulary
/n4/kanji
/n4/grammar
... (same for n3, n2, n1)
/sessions                  → Study session log
/sessions/new              → Log a new study session
/stats                     → Detailed statistics & charts
```

---

## 6. UI/UX Design Direction

### Aesthetic
- **Theme**: Clean Japanese stationery meets minimal tech — think Muji × GitHub
- **Color Palette**:
  - Background: `#FAFAF8` (warm off-white, like washi paper)
  - Surface: `#FFFFFF`
  - Primary accent: `#C84B31` (vermillion, like a hanko stamp)
  - Secondary: `#2D5F8A` (indigo, like Japanese traditional blue)
  - Success/Mastered: `#3D7D52` (forest green)
  - Text: `#1A1A1A`
  - Muted: `#6B6B6B`
- **Typography**: 
  - Display: `Noto Serif JP` (for Japanese characters — authentic feel)
  - UI: `Inter` (clean, readable for English labels)
  - Monospace: `JetBrains Mono` (for furigana / romaji)
- **Signature element**: Kana characters used as large decorative watermarks in card backgrounds

### Progress States (Visual Language)
- ⬜ Unlearned — grey, empty
- 🟡 Reviewing — amber, half-filled
- ✅ Mastered — green, filled with checkmark

---

## 7. Component Architecture

```
components/
├── layout/
│   ├── Sidebar.tsx          # Nav: Dashboard, Kana, N5-N1, Sessions, Stats
│   ├── Header.tsx           # Level breadcrumb + search
│   └── LevelBadge.tsx       # N5/N4/etc colored badge
├── kana/
│   ├── KanaGrid.tsx         # 5×10 grid of kana characters
│   ├── KanaCard.tsx         # Single kana cell with status toggle
│   └── KanaProgressBar.tsx  # "46/46 hiragana mastered"
├── vocabulary/
│   ├── VocabTable.tsx       # Searchable, filterable list
│   ├── VocabCard.tsx        # Word card with flip animation
│   ├── VocabFilter.tsx      # Filter by status/pos
│   └── VocabSearch.tsx
├── kanji/
│   ├── KanjiGrid.tsx
│   └── KanjiCard.tsx        # Shows onyomi/kunyomi/meaning
├── grammar/
│   ├── GrammarList.tsx
│   └── GrammarCard.tsx      # Expandable with examples
├── dashboard/
│   ├── OverallProgress.tsx  # Big stat cards
│   ├── LevelProgressCard.tsx # N5: 240/800 vocab, 45/100 kanji
│   ├── StreakTracker.tsx    # Study streak in days
│   ├── ActivityChart.tsx    # Recharts weekly bar chart
│   └── RecentActivity.tsx  # Last 5 things you studied
├── sessions/
│   ├── SessionList.tsx
│   └── SessionForm.tsx
└── ui/                      # shadcn/ui components
```

---

## 8. Data Storage Strategy

### Option A: SQLite + Prisma (Recommended for local use)
- Zero cost, works offline
- Full SQL queries for stats
- Easy backup (single `.db` file)
- Prisma Studio for data inspection

### Option B: localStorage + JSON (Simplest, no backend)
- Zero setup
- Lives in browser only (no cross-device)
- Good for prototype

### Option C: PostgreSQL + Vercel (For cloud hosting)
- Accessible from any device
- Free tier available
- Vercel Postgres or Supabase

**Recommendation**: Start with SQLite locally, migrate to Postgres later if you want cloud sync.

---

## 9. Folder Structure

```
nihongo-tracker/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  # Dashboard
│   ├── kana/
│   │   ├── page.tsx
│   │   ├── hiragana/page.tsx
│   │   └── katakana/page.tsx
│   ├── [level]/                  # Dynamic: n5, n4, n3, n2, n1
│   │   ├── page.tsx
│   │   ├── vocabulary/page.tsx
│   │   ├── kanji/page.tsx
│   │   └── grammar/page.tsx
│   ├── sessions/
│   │   ├── page.tsx
│   │   └── new/page.tsx
│   └── stats/page.tsx
├── components/                   # (see Component Architecture above)
├── lib/
│   ├── db.ts                     # Prisma client
│   ├── data/
│   │   ├── hiragana.ts           # Static kana data
│   │   ├── katakana.ts
│   │   ├── n5-vocab.ts           # Seed data
│   │   ├── n5-kanji.ts
│   │   └── n5-grammar.ts
│   └── utils.ts
├── prisma/
│   └── schema.prisma
├── public/
│   └── fonts/
├── types/
│   └── index.ts                  # All TypeScript interfaces
├── PLANNING.md                   # This file
├── PROMPT.md                     # Full Hermes prompt
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 10. JLPT Content Counts (for planning)

| Level | Vocabulary | Kanji | Grammar Points |
|-------|-----------|-------|----------------|
| N5    | ~800      | 100   | ~60            |
| N4    | ~1,500    | 300   | ~100           |
| N3    | ~3,750    | 650   | ~150           |
| N2    | ~6,000    | 1,000 | ~200           |
| N1    | ~10,000   | 2,000 | ~250+          |

---

## 11. Tech Stack Summary

```
Frontend:   Next.js 14 (App Router) + TypeScript
Styling:    Tailwind CSS + shadcn/ui
Database:   SQLite (dev) / PostgreSQL (prod) via Prisma ORM
State:      Zustand (client UI state)
Charts:     Recharts
Fonts:      Noto Serif JP + Inter (Google Fonts)
Deployment: Vercel (free tier)
```

---

## 12. Milestones

| Milestone | Goal |
|-----------|------|
| M1 | Project scaffold + DB schema + Kana pages |
| M2 | N5 vocabulary tracker (CRUD + status) |
| M3 | N5 kanji + grammar tracker |
| M4 | Dashboard with progress stats |
| M5 | Study session log |
| M6 | N4 content |
| M7 | Charts + statistics page |
| M8 | N3–N1 content + SRS |
