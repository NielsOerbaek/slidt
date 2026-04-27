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

  const [preset] = await db
    .select()
    .from(themes)
    .where(eq(themes.isPreset, true))
    .limit(1);

  const previewTheme: Theme | null = preset
    ? { name: preset.name, tokens: preset.tokens }
    : null;

  return { slideTypes: rows, previewTheme };
};
