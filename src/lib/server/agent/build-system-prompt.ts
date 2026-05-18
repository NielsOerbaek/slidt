import { db, decks, themes, slideTypes } from '$lib/server/db/index.ts';
import { eq, or, and } from 'drizzle-orm';
import { BASE_SYSTEM_PROMPT } from '$lib/server/agent/runner.ts';

/**
 * Build the full system prompt for a given deck, incorporating theme info,
 * theme system prompt, deck title, and available slide types. Shared between
 * runner.ts, ollama-runner.ts, and aisdk-runner.ts.
 */
export async function buildSystemPrompt(deckId: string): Promise<string> {
  const [deck] = await db.select().from(decks).where(eq(decks.id, deckId)).limit(1);
  let themeInfo = '';
  let themeSystemPrompt = '';
  if (deck?.themeId) {
    const [theme] = await db.select().from(themes).where(eq(themes.id, deck.themeId)).limit(1);
    if (theme) {
      themeInfo = `\nCurrent theme: ${theme.name}\nTheme tokens: ${JSON.stringify(theme.tokens)}`;
      if (theme.systemPrompt) {
        themeSystemPrompt = `\n\nTheme guidelines (${theme.name}):\n${theme.systemPrompt}`;
      }
    }
  }
  const allTypes = await db
    .select({ name: slideTypes.name, label: slideTypes.label })
    .from(slideTypes)
    .where(
      or(
        eq(slideTypes.scope, 'global'),
        and(eq(slideTypes.scope, 'deck'), eq(slideTypes.deckId, deckId)),
      ),
    );
  const typeList = allTypes.map((t) => `${t.name}: ${t.label}`).join('\n');
  return `${BASE_SYSTEM_PROMPT}${themeSystemPrompt}\n\nDeck: "${deck?.title ?? deckId}"${themeInfo}\n\nAvailable slide types:\n${typeList}`;
}
