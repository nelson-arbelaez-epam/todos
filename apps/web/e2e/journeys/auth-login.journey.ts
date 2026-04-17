/**
 * Web e2e journey — auth smoke.
 *
 * ⚠️  PLACEHOLDER — requires Playwright to be installed before running.
 *
 * Install Playwright first:
 *   yarn workspace @todos/web add -D @playwright/test
 *   yarn playwright install --with-deps chromium
 *
 * This file describes the auth login journey at a high level.
 * Uncomment the test body and implement Page Object helpers once Playwright
 * is installed and `playwright.config.ts` is created in apps/web.
 *
 * Journey:
 *   1. Navigate to the login page.
 *   2. Enter valid credentials (from a Firebase emulator test user).
 *   3. Submit the login form.
 *   4. Assert the user is redirected to the home/todo list page.
 *   5. Assert the user's name or email is visible in the header.
 *   6. Click "Logout" and assert the user is back on the login page.
 *
 * @see apps/web/e2e/fixtures/env.ts for test user credentials.
 * @see tools/e2e/env/docker-compose.e2e.yml for the Firebase emulator setup.
 */

/*
import { test, expect } from '@playwright/test';
import { TEST_USER, WEB_BASE_URL } from '../fixtures/env';

test.describe('Auth: login journey (smoke)', () => {
  test('user can log in and log out', async ({ page }) => {
    await page.goto(`${WEB_BASE_URL}/login`);

    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Password').fill(TEST_USER.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\//);
    await expect(page.getByText(TEST_USER.email)).toBeVisible();

    await page.getByRole('button', { name: /logout/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
*/
