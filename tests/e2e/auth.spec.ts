import { test, expect } from '@playwright/test';
import { loginAs, TEST_USER } from './helpers.ts';

test.describe('Login page', () => {
  test('redirects authenticated users away from /login', async ({ page }) => {
    await loginAs(page);
    await page.goto('/login');
    await expect(page).toHaveURL(/\/decks/);
  });

  test('shows login form at /login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('redirects to /decks after successful login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/decks/);
  });

  test('shows error for wrong password', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', 'wrong-password');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('shows error for unknown email', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'nobody@example.com');
    await page.fill('input[name="password"]', 'anything');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });
});

test.describe('Logout', () => {
  test('logs out and redirects to /login', async ({ page }) => {
    await loginAs(page);
    // Logout is a form POST button in the nav: <form action="/logout"><button type="submit">Log out</button></form>
    const logoutBtn = page.locator('nav form[action="/logout"] button[type="submit"]');
    await logoutBtn.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated /decks redirects to /login', async ({ page }) => {
    await page.goto('/decks');
    await expect(page).toHaveURL(/\/login/);
  });
});
