import type { PageServerLoad, Actions } from './$types.js';
import { error, fail } from '@sveltejs/kit';
import { db, decks, slides, slideTypes, themes } from '$lib/server/db/index.ts';
import { eq, or, asc } from 'drizzle-orm';
import type { SlideType, Theme } from '../../../renderer/types.ts';
import { resolveDeckAccess, listCollaborators, requireDeckRole, addCollaborator, removeCollaborator } from '$lib/server/deck-access.ts';

export const load: PageServerLoad = async ({ params, locals }) => {
  // Load deck
  const [deck] = await db
    .select()
    .from(decks)
    .where(eq(decks.id, params.id))
    .limit(1);

  const access = await resolveDeckAccess(params.id!, locals.user!.id);
  if (!access || !deck) throw error(404, 'Deck not found');

  // Load slides ordered by orderIndex
  const slideRows = await db
    .select()
    .from(slides)
    .where(eq(slides.deckId, params.id))
    .orderBy(asc(slides.orderIndex));

  // Re-order by deck.slideOrder (source of truth for order)
  const slideMap = new Map(slideRows.map((s) => [s.id, s]));
  const orderedSlides = deck.slideOrder
    .map((id) => slideMap.get(id))
    .filter((s): s is NonNullable<typeof s> => s !== undefined);

  // Append any slides not yet in slideOrder (shouldn't happen but be safe)
  for (const s of slideRows) {
    if (!deck.slideOrder.includes(s.id)) orderedSlides.push(s);
  }

  // Load slide types (global + deck-scoped for this deck)
  const typeRows = await db
    .select()
    .from(slideTypes)
    .where(or(eq(slideTypes.scope, 'global'), eq(slideTypes.deckId, params.id)));

  // Load theme (deck's theme, or first preset, or null)
  let theme: typeof themes.$inferSelect | null = null;
  if (deck.themeId) {
    const [t] = await db
      .select()
      .from(themes)
      .where(eq(themes.id, deck.themeId))
      .limit(1);
    theme = t ?? null;
  }
  if (!theme) {
    const [t] = await db.select().from(themes).where(eq(themes.isPreset, true)).limit(1);
    theme = t ?? null;
  }

  // Convert DB slide types to renderer SlideType shape
  const rendererTypes: (SlideType & { id: string; scope: string; deckId: string | null })[] =
    typeRows.map((t) => ({
      id: t.id,
      name: t.name,
      label: t.label,
      fields: t.fields,
      htmlTemplate: t.htmlTemplate,
      css: t.css,
      scope: t.scope,
      deckId: t.deckId,
    }));

  // Load all global themes for the theme picker
  const allThemes = await db
    .select({ id: themes.id, name: themes.name })
    .from(themes)
    .where(eq(themes.scope, 'global'));

  // Convert DB theme to renderer Theme shape
  const rendererTheme: (Theme & { id: string }) | null = theme
    ? { id: theme.id, name: theme.name, tokens: theme.tokens }
    : null;

  const collaborators = access === 'owner' ? await listCollaborators(params.id!) : [];

  return {
    deck,
    slides: orderedSlides,
    slideTypes: rendererTypes,
    theme: rendererTheme,
    availableThemes: allThemes,
    isOwner: access === 'owner',
    canEdit: access === 'owner' || access === 'editor',
    collaborators,
    vim: locals.user?.preferences?.vim ?? false,
  };
};

export const actions: Actions = {
  addCollaborator: async ({ params, locals, request }) => {
    if (!locals.user) throw error(401, 'Not authenticated');
    await requireDeckRole(params.id!, locals.user.id, 'owner');
    const fd = await request.formData();
    const email = fd.get('email') as string;
    const role = (fd.get('role') as string) === 'viewer' ? 'viewer' : 'editor';
    if (!email) return fail(400, { collabError: 'Email required' });
    const collab = await addCollaborator(params.id!, email, role);
    if (!collab) return fail(404, { collabError: `No user found: ${email}` });
    return { success: true };
  },

  removeCollaborator: async ({ params, locals, request }) => {
    if (!locals.user) throw error(401, 'Not authenticated');
    await requireDeckRole(params.id!, locals.user.id, 'owner');
    const fd = await request.formData();
    const userId = fd.get('userId') as string;
    if (!userId) return fail(400, { collabError: 'userId required' });
    await removeCollaborator(params.id!, userId);
    return { success: true };
  },
};
