import { db, slideEdits, type EditKind } from './db/index.ts';
import { and, desc, eq, gt } from 'drizzle-orm';

const COALESCE_WINDOW_MS = 5_000;

interface RecordParams {
  deckId: string;
  slideId?: string | null | undefined;
  userId?: string | null | undefined;
  kind: EditKind;
  before: unknown;
  after: unknown;
  summary: string;
  /**
   * Set to opt into 5-second coalescing — the most recent edit by the same
   * user with the same key (typically `<slideId>::<fieldPath>`) gets folded
   * into the previous row instead of a new insert. Use null to disable.
   */
  coalesceKey?: string | null | undefined;
}

/**
 * Append (or coalesce) a row in the slide_edits log. Errors are swallowed and
 * logged — history loss is preferable to breaking a user's save.
 */
export async function recordEdit(params: RecordParams): Promise<void> {
  try {
    if (params.coalesceKey && params.userId) {
      const cutoff = new Date(Date.now() - COALESCE_WINDOW_MS);
      const [existing] = await db
        .select({ id: slideEdits.id, before: slideEdits.before })
        .from(slideEdits)
        .where(
          and(
            eq(slideEdits.deckId, params.deckId),
            eq(slideEdits.userId, params.userId),
            eq(slideEdits.coalesceKey, params.coalesceKey),
            gt(slideEdits.at, cutoff),
          ),
        )
        .orderBy(desc(slideEdits.at))
        .limit(1);
      if (existing) {
        await db
          .update(slideEdits)
          .set({ at: new Date(), after: params.after, summary: params.summary })
          .where(eq(slideEdits.id, existing.id));
        return;
      }
    }

    await db.insert(slideEdits).values({
      deckId: params.deckId,
      slideId: params.slideId ?? null,
      userId: params.userId ?? null,
      kind: params.kind,
      before: params.before,
      after: params.after,
      coalesceKey: params.coalesceKey ?? null,
      summary: params.summary,
    });
  } catch (err) {
    console.error('recordEdit failed', { deckId: params.deckId, kind: params.kind, err });
  }
}

/**
 * Build a coalesce key for an edit_field row. Falls back to the slideId only
 * when no specific field path is identifiable (i.e. whole-data replacement).
 */
export function fieldCoalesceKey(slideId: string, fieldPath?: string): string {
  return fieldPath ? `${slideId}::${fieldPath}` : `${slideId}::*`;
}

/**
 * Diff two slide-data objects at the top level only and return a list of the
 * field paths that actually changed. Used to make the field-edit summary
 * readable ("title, eyebrow") and to derive a coalesce key when only one
 * field changed.
 */
export function changedTopLevelFields(
  before: Record<string, unknown> | null | undefined,
  after: Record<string, unknown> | null | undefined,
): string[] {
  const a = before ?? {};
  const b = after ?? {};
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const changed: string[] = [];
  for (const k of keys) {
    if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) changed.push(k);
  }
  return changed;
}

export type { EditKind };
