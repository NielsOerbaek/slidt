import { db, slideTypes, themes } from '../src/lib/server/db/index.ts';
import { BUILT_IN_SLIDE_TYPES } from '../src/slide-types/index.ts';
import { antalThetaDefault } from '../src/themes/antal-theta-default.ts';
import { eq, and } from 'drizzle-orm';

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

  // Upsert the ANTAL-Theta default theme
  const [existingTheme] = await db
    .select({ id: themes.id })
    .from(themes)
    .where(eq(themes.name, antalThetaDefault.name))
    .limit(1);
  if (existingTheme) {
    await db
      .update(themes)
      .set({ tokens: antalThetaDefault.tokens })
      .where(eq(themes.id, existingTheme.id));
  } else {
    await db.insert(themes).values({
      name: antalThetaDefault.name,
      tokens: antalThetaDefault.tokens,
      scope: 'global',
      isPreset: true,
    });
  }

  console.log(`Seeded ${BUILT_IN_SLIDE_TYPES.length} slide types and 1 theme.`);
}

// Run directly: pnpm tsx scripts/seed.ts
if (process.argv[1]?.endsWith('seed.ts')) {
  await runSeed().catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  });
  process.exit(0);
}
