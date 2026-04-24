import type { Page } from '@playwright/test';

export const TEST_USER = {
  email: 'niels@osogdata.dk',
  password: 'bussemand',
};

/** Log in via the login form and wait for redirect to /decks. */
export async function loginAs(page: Page, email = TEST_USER.email, password = TEST_USER.password) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/decks');
}

/** Delete a deck by its title via the UI (assumes user is on /decks). */
export async function deleteDeckByTitle(page: Page, title: string) {
  const deckLink = page.locator('a', { hasText: title });
  if (await deckLink.count() === 0) return;
  await deckLink.click();
  await page.waitForURL('**/decks/**');
  const deleteBtn = page.locator('button', { hasText: /delete deck/i });
  if (await deleteBtn.count() > 0) {
    await deleteBtn.click();
    const confirmBtn = page.locator('button', { hasText: /confirm|yes/i });
    if (await confirmBtn.count() > 0) await confirmBtn.click();
    await page.waitForURL('**/decks');
  }
}
