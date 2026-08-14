# Full Build Prompt — Nihongo Tracker
## Pass this entire prompt to Hermes (or any capable coding LLM)

---

## CONTEXT

You are building a personal Japanese language learning progress tracker called **Nihongo Tracker** (日本語トラッカー). This is a full-stack web app for one user to track their JLPT study progress from N5 to N1, as well as hiragana and katakana mastery.

---

## TECH STACK

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (use `npx shadcn-ui@latest init` to set up)
- **Database**: SQLite via Prisma ORM (for local development)
- **State Management**: Zustand (for client-side UI state)
- **Charts**: Recharts
- **Fonts**: Noto Serif JP + Inter via `next/font/google`

---

## DESIGN SYSTEM

Apply these design tokens consistently everywhere:

### Colors (add to `tailwind.config.ts`)
```typescript
colors: {
  washi: "#FAFAF8",         // page background (like washi paper)
  surface: "#FFFFFF",
  vermillion: "#C84B31",    // primary accent (hanko stamp red)
  indigo: "#2D5F8A",        // secondary accent (Japanese traditional blue)
  forest: "#3D7D52",        // mastered/success state
  ink: "#1A1A1A",           // primary text
  sumi: "#6B6B6B",          // muted text
  "unlearned-bg": "#F0F0F0",
  "reviewing-bg": "#FFF3CD",
  "mastered-bg": "#D4EDDA",
}
```

### Typography
- Display/headings: `Noto Serif JP` (weight 400, 700)
- Body/UI: `Inter` (weight 400, 500, 600)
- Use `font-serif` for Japanese characters in cards and charts

### Progress Status Visual Language (apply universally)
- **unlearned**: grey background `#F0F0F0`, empty circle icon
- **reviewing**: amber background `#FFF3CD`, half-circle icon
- **mastered**: green background `#D4EDDA`, checkmark icon `✓`

### Signature Design Element
Large semi-transparent Japanese characters (kana or kanji relevant to the page) as decorative watermarks in card backgrounds. Example: hiragana page shows 「あ」 at 120px, 5% opacity in the background of section headers.

---

## DATABASE SCHEMA

Create this Prisma schema at `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model KanaProgress {
  id          String   @id @default(cuid())
  character   String   @unique
  type        String   // "hiragana" | "katakana"
  romaji      String
  status      String   @default("unlearned") // "unlearned" | "reviewing" | "mastered"
  masteredAt  DateTime?
  updatedAt   DateTime @updatedAt
}

model VocabProgress {
  id           String    @id @default(cuid())
  wordId       String    @unique  // references static data ID
  level        String    // "N5" | "N4" | "N3" | "N2" | "N1"
  status       String    @default("unlearned")
  notes        String?
  nextReviewAt DateTime?
  masteredAt   DateTime?
  addedAt      DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model KanjiProgress {
  id          String    @id @default(cuid())
  kanjiId     String    @unique
  level       String
  status      String    @default("unlearned")
  notes       String?
  masteredAt  DateTime?
  updatedAt   DateTime  @updatedAt
}

model GrammarProgress {
  id          String    @id @default(cuid())
  grammarId   String    @unique
  level       String
  status      String    @default("unlearned")
  notes       String?
  masteredAt  DateTime?
  updatedAt   DateTime  @updatedAt
}

model StudySession {
  id              String   @id @default(cuid())
  date            DateTime @default(now())
  durationMinutes Int
  level           String   // "N5" | "N4" | ... | "kana" | "mixed"
  activities      String   // JSON array: ["vocabulary","kanji","grammar"]
  wordsReviewed   Int?
  kanjiReviewed   Int?
  notes           String?
  createdAt       DateTime @default(now())
}
```

---

## TYPESCRIPT TYPES

Create `types/index.ts`:

```typescript
export type KanaType = "hiragana" | "katakana";
export type JLPTLevel = "N5" | "N4" | "N3" | "N2" | "N1";
export type ProgressStatus = "unlearned" | "reviewing" | "mastered";
export type StudyActivity = "vocabulary" | "kanji" | "grammar" | "reading" | "listening" | "writing" | "kana";

export interface KanaCharacter {
  id: string;
  type: KanaType;
  character: string;
  romaji: string;
  row: string;          // "a", "ka", "sa", etc.
}

export interface VocabWord {
  id: string;
  level: JLPTLevel;
  word: string;
  reading: string;
  romaji: string;
  meaning: string[];
  partOfSpeech: string;
  exampleSentence?: string;
}

export interface KanjiEntry {
  id: string;
  level: JLPTLevel;
  character: string;
  onyomi: string[];
  kunyomi: string[];
  meaning: string[];
  strokeCount: number;
  exampleWords: string[];
}

export interface GrammarPoint {
  id: string;
  level: JLPTLevel;
  title: string;
  meaning: string;
  structure: string;
  examples: Array<{
    japanese: string;
    reading: string;
    english: string;
  }>;
}

export interface LevelStats {
  level: JLPTLevel | "kana";
  vocab: { total: number; mastered: number; reviewing: number; unlearned: number };
  kanji: { total: number; mastered: number; reviewing: number; unlearned: number };
  grammar: { total: number; mastered: number; reviewing: number; unlearned: number };
}
```

---

## STATIC DATA FILES

Create `lib/data/hiragana.ts` with the complete hiragana chart:

```typescript
import { KanaCharacter } from "@/types";

export const hiragana: KanaCharacter[] = [
  // a-row
  { id: "hira_a",  type: "hiragana", character: "あ", romaji: "a",   row: "a" },
  { id: "hira_i",  type: "hiragana", character: "い", romaji: "i",   row: "a" },
  { id: "hira_u",  type: "hiragana", character: "う", romaji: "u",   row: "a" },
  { id: "hira_e",  type: "hiragana", character: "え", romaji: "e",   row: "a" },
  { id: "hira_o",  type: "hiragana", character: "お", romaji: "o",   row: "a" },
  // ka-row
  { id: "hira_ka", type: "hiragana", character: "か", romaji: "ka",  row: "ka" },
  { id: "hira_ki", type: "hiragana", character: "き", romaji: "ki",  row: "ka" },
  { id: "hira_ku", type: "hiragana", character: "く", romaji: "ku",  row: "ka" },
  { id: "hira_ke", type: "hiragana", character: "け", romaji: "ke",  row: "ka" },
  { id: "hira_ko", type: "hiragana", character: "こ", romaji: "ko",  row: "ka" },
  // sa-row
  { id: "hira_sa", type: "hiragana", character: "さ", romaji: "sa",  row: "sa" },
  { id: "hira_shi",type: "hiragana", character: "し", romaji: "shi", row: "sa" },
  { id: "hira_su", type: "hiragana", character: "す", romaji: "su",  row: "sa" },
  { id: "hira_se", type: "hiragana", character: "せ", romaji: "se",  row: "sa" },
  { id: "hira_so", type: "hiragana", character: "そ", romaji: "so",  row: "sa" },
  // ta-row
  { id: "hira_ta", type: "hiragana", character: "た", romaji: "ta",  row: "ta" },
  { id: "hira_chi",type: "hiragana", character: "ち", romaji: "chi", row: "ta" },
  { id: "hira_tsu",type: "hiragana", character: "つ", romaji: "tsu", row: "ta" },
  { id: "hira_te", type: "hiragana", character: "て", romaji: "te",  row: "ta" },
  { id: "hira_to", type: "hiragana", character: "と", romaji: "to",  row: "ta" },
  // na-row
  { id: "hira_na", type: "hiragana", character: "な", romaji: "na",  row: "na" },
  { id: "hira_ni", type: "hiragana", character: "に", romaji: "ni",  row: "na" },
  { id: "hira_nu", type: "hiragana", character: "ぬ", romaji: "nu",  row: "na" },
  { id: "hira_ne", type: "hiragana", character: "ね", romaji: "ne",  row: "na" },
  { id: "hira_no", type: "hiragana", character: "の", romaji: "no",  row: "na" },
  // ha-row
  { id: "hira_ha", type: "hiragana", character: "は", romaji: "ha",  row: "ha" },
  { id: "hira_hi", type: "hiragana", character: "ひ", romaji: "hi",  row: "ha" },
  { id: "hira_fu", type: "hiragana", character: "ふ", romaji: "fu",  row: "ha" },
  { id: "hira_he", type: "hiragana", character: "へ", romaji: "he",  row: "ha" },
  { id: "hira_ho", type: "hiragana", character: "ほ", romaji: "ho",  row: "ha" },
  // ma-row
  { id: "hira_ma", type: "hiragana", character: "ま", romaji: "ma",  row: "ma" },
  { id: "hira_mi", type: "hiragana", character: "み", romaji: "mi",  row: "ma" },
  { id: "hira_mu", type: "hiragana", character: "む", romaji: "mu",  row: "ma" },
  { id: "hira_me", type: "hiragana", character: "め", romaji: "me",  row: "ma" },
  { id: "hira_mo", type: "hiragana", character: "も", romaji: "mo",  row: "ma" },
  // ya-row
  { id: "hira_ya", type: "hiragana", character: "や", romaji: "ya",  row: "ya" },
  { id: "hira_yu", type: "hiragana", character: "ゆ", romaji: "yu",  row: "ya" },
  { id: "hira_yo", type: "hiragana", character: "よ", romaji: "yo",  row: "ya" },
  // ra-row
  { id: "hira_ra", type: "hiragana", character: "ら", romaji: "ra",  row: "ra" },
  { id: "hira_ri", type: "hiragana", character: "り", romaji: "ri",  row: "ra" },
  { id: "hira_ru", type: "hiragana", character: "る", romaji: "ru",  row: "ra" },
  { id: "hira_re", type: "hiragana", character: "れ", romaji: "re",  row: "ra" },
  { id: "hira_ro", type: "hiragana", character: "ろ", romaji: "ro",  row: "ra" },
  // wa-row
  { id: "hira_wa", type: "hiragana", character: "わ", romaji: "wa",  row: "wa" },
  { id: "hira_wi", type: "hiragana", character: "ゐ", romaji: "wi",  row: "wa" },
  { id: "hira_we", type: "hiragana", character: "ゑ", romaji: "we",  row: "wa" },
  { id: "hira_wo", type: "hiragana", character: "を", romaji: "wo",  row: "wa" },
  // n
  { id: "hira_n",  type: "hiragana", character: "ん", romaji: "n",   row: "n"  },
];
```

Do the same for `lib/data/katakana.ts` with all katakana characters.

Create `lib/data/n5-vocab.ts` with at least 50 sample N5 vocabulary words using this shape:

```typescript
import { VocabWord } from "@/types";
export const n5Vocab: VocabWord[] = [
  { id: "n5_v001", level: "N5", word: "食べる", reading: "たべる", romaji: "taberu", meaning: ["to eat"], partOfSpeech: "verb (ichidan)", exampleSentence: "りんごを食べる。(I eat an apple.)" },
  { id: "n5_v002", level: "N5", word: "飲む",   reading: "のむ",   romaji: "nomu",   meaning: ["to drink"], partOfSpeech: "verb (godan)", exampleSentence: "みずを飲む。(I drink water.)" },
  // ... continue for all N5 vocabulary
];
```

Create `lib/data/n5-kanji.ts` with the 100 N5 kanji.
Create `lib/data/n5-grammar.ts` with all N5 grammar points (〜は〜です, 〜が, 〜を, 〜に, 〜で, 〜と, 〜も, 〜の, 〜ている, 〜たい, 〜ません, 〜ましょう, etc.).

---

## API ROUTES

Create these Next.js API routes under `app/api/`:

### `app/api/kana/route.ts`
```typescript
// GET /api/kana?type=hiragana — returns all kana with their progress status
// POST /api/kana — update status for a kana character
// Body: { id: string, status: "unlearned" | "reviewing" | "mastered" }
```

### `app/api/vocab/route.ts`
```typescript
// GET /api/vocab?level=N5&status=reviewing — filtered vocab with progress
// POST /api/vocab — upsert progress for a vocab word
// Body: { wordId: string, level: string, status: string, notes?: string }
```

### `app/api/kanji/route.ts`
```typescript
// GET /api/kanji?level=N5
// POST /api/kanji — upsert kanji progress
```

### `app/api/grammar/route.ts`
```typescript
// GET /api/grammar?level=N5
// POST /api/grammar — upsert grammar progress
```

### `app/api/sessions/route.ts`
```typescript
// GET /api/sessions — list all study sessions, ordered by date desc
// POST /api/sessions — create a new study session
```

### `app/api/stats/route.ts`
```typescript
// GET /api/stats — returns aggregated stats for dashboard
// Returns: { kana, n5, n4, n3, n2, n1, streak, totalSessionMinutes, recentSessions }
```

---

## PAGE IMPLEMENTATIONS

### Dashboard (`app/page.tsx`)

Display these sections in this order:
1. **Header**: "日本語トラッカー" title + current date + study streak badge
2. **Quick Stats Row**: 4 stat cards — Total Words Mastered, Kana Complete %, Current Level, Study Streak
3. **Level Progress Cards**: One card per JLPT level (N5→N1) showing vocab/kanji/grammar progress bars
4. **Weekly Activity Chart**: Recharts BarChart showing minutes studied per day for the last 7 days
5. **Recent Sessions**: Last 3 study sessions with date, duration, level, activities tags

### Kana Overview (`app/kana/page.tsx`)
- Two large progress rings (hiragana %, katakana %)
- Link cards to `/kana/hiragana` and `/kana/katakana`
- Show count: e.g. "42/46 hiragana mastered"

### Hiragana Chart (`app/kana/hiragana/page.tsx`)
- Group characters by row (a, ka, sa, ta, na, ha, ma, ya, ra, wa, n)
- Display as a responsive grid, one row per section
- Each character card shows: big Japanese character, romaji below, status color background
- Clicking a card cycles through: unlearned → reviewing → mastered → unlearned
- Row-level "Mark All as Mastered" button
- Progress bar at top: "X / 46 mastered"

### N5 Vocabulary (`app/[level]/vocabulary/page.tsx`)

Dynamic route handling all levels. Features:
- Search input (searches word, reading, romaji, meaning)
- Filter tabs: All | Unlearned | Reviewing | Mastered
- Sort: By status | Alphabetical | Recently updated
- Table with columns: Word (Japanese), Reading (furigana), Meaning, Part of Speech, Status, Notes
- Status can be clicked to cycle through states
- Row expansion to show example sentence + notes input
- Pagination (50 per page)
- Export button (CSV)
- "Mark all filtered as..." bulk action

### N5 Kanji (`app/[level]/kanji/page.tsx`)
- Grid view of kanji characters (large, beautiful display)
- Click to open a modal/drawer showing: character large, onyomi, kunyomi, meanings, stroke count, example words, status selector, notes
- Toggle between grid and list view
- Filter by status

### N5 Grammar (`app/[level]/grammar/page.tsx`)
- Accordion list of grammar points
- Each item: title pattern (bold), meaning, structure, 3 example sentences with reading/translation
- Status selector on each
- Notes field

### Study Sessions (`app/sessions/page.tsx`)
- Timeline list of past sessions (most recent first)
- Each entry: date, duration badge, level badge, activity tags, notes preview
- "Log Study Session" button → `/sessions/new`

### Log Session (`app/sessions/new/page.tsx`)
- Form fields: Date (default today), Duration (number input, minutes), Level (select), Activities (multi-checkbox), Words Reviewed (optional), Kanji Reviewed (optional), Notes (textarea)
- Submit saves and redirects to `/sessions`

---

## SIDEBAR NAVIGATION

Create a persistent left sidebar (`components/layout/Sidebar.tsx`):

```
🏠 Dashboard
──────────
かな  Kana
  ↳ Hiragana
  ↳ Katakana
──────────
N5  [progress %]
  ↳ Vocabulary
  ↳ Kanji
  ↳ Grammar
N4  [progress %]
  ↳ Vocabulary
  ↳ Kanji
  ↳ Grammar
N3
N4
N1
──────────
📚 Sessions
📊 Statistics
```

Active link should be highlighted with vermillion left border.
Collapsed sidebar on mobile (hamburger menu).

---

## ZUSTAND STORE

Create `lib/store.ts`:

```typescript
import { create } from "zustand";

interface AppStore {
  // UI state
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  
  // Filter state (persisted per page via URL params instead)
  vocabFilter: "all" | "unlearned" | "reviewing" | "mastered";
  setVocabFilter: (filter: AppStore["vocabFilter"]) => void;
  
  vocabSearch: string;
  setVocabSearch: (q: string) => void;
}

export const useStore = create<AppStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  vocabFilter: "all",
  setVocabFilter: (filter) => set({ vocabFilter: filter }),
  vocabSearch: "",
  setVocabSearch: (q) => set({ vocabSearch: q }),
}));
```

---

## KEY COMPONENTS TO BUILD

### `components/kana/KanaCard.tsx`
```typescript
// Props: character (KanaCharacter), status (ProgressStatus), onStatusChange
// Visual: 
//   - Background color based on status
//   - Large Japanese character (80px, Noto Serif JP)
//   - Romaji below (14px, Inter, muted)
//   - Click handler calls onStatusChange with next status
//   - Subtle hover lift animation
//   - Decorative watermark of the character at 5% opacity
```

### `components/vocabulary/VocabTable.tsx`
```typescript
// Props: words (VocabWord[]), progress (Map<string, VocabProgress>)
// Use TanStack Table (react-table v8) for sorting/filtering
// OR build simple table manually
// Key: status badge is clickable in-line (no modal needed)
```

### `components/dashboard/LevelProgressCard.tsx`
```typescript
// Props: level, vocabStats, kanjiStats, grammarStats
// Shows level badge, three mini progress bars (vocab/kanji/grammar)
// Overall % in large text
// Links to /[level] page
// Background uses level-specific subtle color
```

### `components/dashboard/ActivityChart.tsx`
```typescript
// Recharts BarChart
// X-axis: last 7 day names (Mon, Tue...)
// Y-axis: minutes studied
// Bar color: vermillion for days with sessions, grey for empty days
// Tooltip: "45 min studied"
```

---

## SETUP COMMANDS

At the start of your implementation, initialize the project like this:

```bash
# Create Next.js app
npx create-next-app@latest nihongo-tracker --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"

cd nihongo-tracker

# Install dependencies
npm install prisma @prisma/client zustand recharts
npm install @radix-ui/react-dialog @radix-ui/react-progress @radix-ui/react-tabs
npm install lucide-react clsx tailwind-merge
npm install -D @types/node

# Setup shadcn/ui
npx shadcn-ui@latest init
# Choose: Default style, slate base color, CSS variables: yes

# Add shadcn components
npx shadcn-ui@latest add button card badge input select tabs progress dialog drawer accordion toast

# Setup Prisma
npx prisma init --datasource-provider sqlite
# (paste the schema from above into prisma/schema.prisma)
npx prisma migrate dev --name init
npx prisma generate
```

---

## IMPLEMENTATION ORDER

Build in this exact order to stay unblocked:

1. **Project setup** — scaffold + Prisma + Tailwind config + Zustand store
2. **Layout** — `app/layout.tsx` with Sidebar + Header, mobile responsive
3. **Static data files** — `lib/data/hiragana.ts`, `katakana.ts`, `n5-vocab.ts`, `n5-kanji.ts`, `n5-grammar.ts`
4. **Kana API** — `app/api/kana/route.ts` (GET + POST)
5. **Hiragana page** — full grid with click-to-cycle status
6. **Katakana page** — same as hiragana
7. **Vocab API** — `app/api/vocab/route.ts`
8. **N5 Vocabulary page** — searchable, filterable table
9. **Kanji API + N5 Kanji page**
10. **Grammar API + N5 Grammar page**
11. **Sessions API + Sessions pages**
12. **Stats API**
13. **Dashboard** — connect all stats, charts, recent sessions
14. **N4-N1 content** — reuse all dynamic routes, just add data files

---

## CODE QUALITY RULES

- Always use TypeScript strict types — no `any`
- All API routes return `{ data, error }` shape
- All DB calls wrapped in try/catch
- Loading states on every async operation (use shadcn Skeleton)
- Empty states with helpful messages (e.g. "No N5 vocab mastered yet — start studying!")
- Mobile responsive from day one
- Kana characters always use `font-serif` (Noto Serif JP)
- Status updates are optimistic (update UI instantly, sync to DB in background)
- Use `server actions` or API routes — not both mixed together

---

## DELIVERABLE

Produce the full working codebase for this application. When done:
1. All files should compile with `tsc --noEmit` without errors
2. `npm run dev` should start with no runtime errors
3. The hiragana and katakana pages should be fully interactive
4. The N5 vocabulary page should be searchable and filterable
5. The dashboard should show real data from the database
6. The app should look polished and match the design system described above

Start with the project scaffold and work through the implementation order above. Show me each major file as you complete it.
