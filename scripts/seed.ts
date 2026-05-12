import { db, slideTypes, themes } from '../src/lib/server/db/index.ts';
import { BUILT_IN_SLIDE_TYPES } from '../src/slide-types/index.ts';
import { antalThetaDefault } from '../src/themes/antal-theta-default.ts';
import { minimal } from '../src/themes/minimal.ts';
import { eq, and } from 'drizzle-orm';

const BUILT_IN_THEMES = [antalThetaDefault, minimal];

export async function runSeed(): Promise<void> {
  // Upsert each built-in slide type by name (global scope, no deckId)
  for (const st of BUILT_IN_SLIDE_TYPES) {
    const [existing] = await db
      .select({ id: slideTypes.id })
      .from(slideTypes)
      .where(and(eq(slideTypes.name, st.name), eq(slideTypes.scope, 'global')))
      .limit(1);
    if (existing) {
      await db
        .update(slideTypes)
        .set({
          label: st.label,
          fields: st.fields,
          htmlTemplate: st.htmlTemplate,
          css: st.css,
        })
        .where(eq(slideTypes.id, existing.id));
    } else {
      await db.insert(slideTypes).values({
        name: st.name,
        label: st.label,
        fields: st.fields,
        htmlTemplate: st.htmlTemplate,
        css: st.css,
        scope: 'global',
      });
    }
  }

  // Upsert each built-in theme
  for (const theme of BUILT_IN_THEMES) {
    const [existingTheme] = await db
      .select({ id: themes.id })
      .from(themes)
      .where(eq(themes.name, theme.name))
      .limit(1);
    if (existingTheme) {
      await db
        .update(themes)
        .set({ tokens: theme.tokens, systemPrompt: theme.systemPrompt ?? null })
        .where(eq(themes.id, existingTheme.id));
    } else {
      await db.insert(themes).values({
        name: theme.name,
        tokens: theme.tokens,
        systemPrompt: theme.systemPrompt ?? null,
        scope: 'global',
        isPreset: true,
      });
    }
  }

  console.log(`Seeded ${BUILT_IN_SLIDE_TYPES.length} slide types and ${BUILT_IN_THEMES.length} themes.`);
}

// Run directly: pnpm tsx scripts/seed.ts
if (process.argv[1]?.endsWith('seed.ts')) {
  await runSeed().catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  });
  process.exit(0);
}
