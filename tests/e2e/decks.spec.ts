import { test, expect } from '@playwright/test';
import { loginAs } from './helpers.ts';

const DECK_TITLE = `e2e-test-deck-${Date.now()}`;

/** Delete a deck by title using the × button on the /decks list page. */
async function deleteDeckByTitle(page: import('@playwright/test').Page, title: string) {
  await page.goto('/decks');
  // Find the deck card that contains the given title link, then click its × button
  const deckCard = page.locator('.deck-card').filter({ has: page.locator(`text="${title}"`) });
  if ((await deckCard.count()) === 0) return;
  await deckCard.locator('button.btn-delete').click();
}

test.describe('Decks page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  test('shows deck list heading', async ({ page }) => {
    await page.goto('/decks');
    await expect(page.locator('h1', { hasText: 'Decks' })).toBeVisible();
  });

  test('shows + New deck button', async ({ page }) => {
    await page.goto('/decks');
    await expect(page.locator('button', { hasText: '+ New deck' })).toBeVisible();
  });

  test('can create a new deck', async ({ page }) => {
    await page.goto('/decks');
    await page.click('button:has-text("+ New deck")');
    await page.fill('input[name="title"]', DECK_TITLE);
    await page.click('button[type="submit"]:has-text("Create")');
    // After creation the deck editor should open
    await expect(page).toHaveURL(/\/decks\/.+/);
    // Navigate back and verify the deck appears in the list
    await page.goto('/decks');
    await expect(page.locator(`text=${DECK_TITLE}`)).toBeVisible();

    // Cleanup: delete the deck we just created
    await deleteDeckByTitle(page, DECK_TITLE);
    await expect(page.locator(`text=${DECK_TITLE}`)).not.toBeVisible();
  });

  test('clicking a deck opens the editor', async ({ page }) => {
    await page.goto('/decks');
    const firstDeck = page.locator('a[href^="/decks/"]').first();
    const count = await firstDeck.count();
    test.skip(count === 0, 'No decks to open');
    await firstDeck.click();
    await expect(page).toHaveURL(/\/decks\/.+/);
  });
});
