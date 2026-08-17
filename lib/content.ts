import { prisma } from "@/lib/db";
import { CONTENT_REGISTRY } from "@/lib/content-registry";

/**
 * Server-side content access for Server Components (client components use
 * the /api/content/<type> route instead). Parses the JSON-string columns.
 */
export async function getContent<T = unknown>(
  type: string,
  opts?: { level?: string; category?: string }
): Promise<T[]> {
  const entry = CONTENT_REGISTRY[type];
  if (!entry) throw new Error(`Unknown content type: ${type}`);

  const where: Record<string, string> = {};
  if (entry.hasLevel && opts?.level && opts.level !== "ALL") where.level = opts.level.toUpperCase();
  if (entry.hasCategory && opts?.category && opts.category !== "all") where.category = opts.category.toLowerCase();

  const orderBy = entry.orderBy.split("_");
  const model = (prisma as any)[entry.model];
  const rows = await model.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    orderBy: { [orderBy[0]]: orderBy[1] },
  });

  return rows.map((row: Record<string, unknown>) => {
    for (const field of entry.jsonFields) {
      if (typeof row[field] === "string") {
        try {
          row[field] = JSON.parse(row[field] as string);
        } catch {}
      }
    }
    return row as T;
  });
}
