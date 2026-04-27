import type { PageServerLoad } from './$types.js';
import { db, slideTypes, themes } from '$lib/server/db/index.ts';
import { eq } from 'drizzle-orm';
import type { Theme } from '../../renderer/types.ts';

export const load: PageServerLoad = async () => {
  const global = await db
    .select()
    .from(slideTypes)
    .where(eq(slideTypes.scope, 'global'));

  const [preset] = await db
    .select()
    .from(themes)
    .where(eq(themes.isPreset, true))
    .limit(1);

  const previewTheme: Theme | null = preset
    ? { name: preset.name, tokens: preset.tokens }
    : null;

  return { slideTypes: global, previewTheme };
};
