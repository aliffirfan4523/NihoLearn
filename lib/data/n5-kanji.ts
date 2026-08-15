import type { KanjiEntry } from "@/types";

/**
 * @deprecated All Kanji (N5-N1, 2,136 Joyo & JLPT characters) are now loaded
 * dynamically from the PostgreSQL database via Prisma and `/api/kanji`.
 */
export const n5Kanji: KanjiEntry[] = [];
