import type { PageServerLoad } from './$types.js';
import { db, slideTypes, themes, decks } from '$lib/server/db/index.ts';
import { eq } from 'drizzle-orm';
import type { Theme } from '../../renderer/types.ts';

export const load: PageServerLoad = async () => {
  // Global templates (every user can use them) + every deck-scoped template
  // (so authors can find / promote them). The list is small enough that we
  // join the deck title rather than paging.
  const rows = await db
    .select({
      id: slideTypes.id,
      name: slideTypes.name,
      label: slideTypes.label,
      fields: slideTypes.fields,
      htmlTemplate: slideTypes.htmlTemplate,
      css: slideTypes.css,
      scope: slideTypes.scope,
      deckId: slideTypes.deckId,
      deckTitle: decks.title,
    })
    .from(slideTypes)
    .leftJoin(decks, eq(slideTypes.deckId, decks.id));

  const allThemeRows = await db.select().from(themes);

  const themeList: Array<Theme & { id: number }> = allThemeRows.map((t) => ({
    id: t.id,
    name: t.name,
    tokens: t.tokens as Theme['tokens'],
  }));

  const defaultTheme = allThemeRows.find((t) => t.isPreset) ?? allThemeRows[0];

  const previewTheme: Theme | null = defaultTheme
    ? { name: defaultTheme.name, tokens: defaultTheme.tokens as Theme['tokens'] }
    : null;

  return { slideTypes: rows, themes: themeList, previewTheme };
};
