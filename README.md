# NihoLearn (日本語トラッカー) — Level Up Your Japanese Learning

NihoLearn combines everything you need to master Japanese in one place. It is a full-stack web app that helps learners track their JLPT study progress from beginner to advanced, plus hiragana and katakana mastery.

We feature a structured, data-driven approach to efficient vocabulary and grammar retention, complete JLPT content from N5 to N1, an interactive kana system that brings learning to life, comprehensive progress tracking for kana, vocabulary, grammar, and kanji, and a learning roadmap that guides you from beginner to advanced.

Built by a learner, for learners — designed to include the features we always wished existed.

## ✨ Key Features

- **Complete JLPT content (N5 → N1)** — vocabulary, grammar, and kanji across all five levels.
- **Interactive kana system** — hiragana and katakana charts with custom SVG stroke-order tracing, Japanese SpeechSynthesis pronunciation, and mnemonic flashcards.
- **Comprehensive progress tracking** — per-level progress for kana, vocabulary, grammar, and kanji, with a clear visual language (unlearned → reviewing → mastered).
- **Learning roadmap** — a guided path from beginner to advanced, so you always know what to study next.
- **Gamified experience** — progress dashboards and streak tracking keep you motivated to level up.
- **Responsive light-theme UI** — collapsible sidebar, Noto Serif JP typography, and a clean Japanese-stationery aesthetic.

## 🛠️ Tech Stack

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| Framework   | Next.js (App Router) + TypeScript               |
| Styling     | Tailwind CSS                                    |
| Database    | SQLite via Prisma ORM                           |
| State       | Zustand                                         |
| Charts      | Recharts                                        |
| Fonts       | Noto Serif JP + Inter                           |

## 🚀 Getting Started

```bash
npm install
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📈 Roadmap

- [x] Project scaffold + database schema + kana pages
- [x] Interactive kana system (stroke tracing, pronunciation, flashcards)
- [ ] N5 vocabulary, kanji, and grammar trackers
- [ ] Dashboard with progress stats and streak tracking
- [ ] Study-session logging
- [ ] Statistics charts
- [ ] SRS-style review and practice games
- [ ] Full N4 → N1 content

## 📂 Project Docs

- `PLANNING.md` — full design and architecture planning document
- `PROMPT.md` — the complete build prompt / specification
