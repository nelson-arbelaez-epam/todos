/**
 * Web e2e journey — todo CRUD smoke.
 *
 * ⚠️  PLACEHOLDER — requires Playwright to be installed before running.
 *
 * Install Playwright first:
 *   yarn workspace @todos/web add -D @playwright/test
 *   yarn playwright install --with-deps chromium
 *
 * Journey:
 *   1. Log in as a test user (Firebase emulator).
 *   2. Create a new todo item.
 *   3. Assert the todo is visible in the list.
 *   4. Mark the todo as complete.
 *   5. Assert the todo is in the completed state.
 *   6. Delete the todo.
 *   7. Assert the todo is no longer visible.
 *
 * @see apps/web/e2e/fixtures/env.ts for test user credentials.
 * @see tools/e2e/env/docker-compose.e2e.yml for the Firebase emulator setup.
 */

/*
import { test, expect } from '@playwright/test';
import { TEST_USER, WEB_BASE_URL } from '../fixtures/env';

test.describe('Todos: CRUD journey (smoke)', () => {
  test.beforeEach(async ({ page }) => {
    // Log in before each test.
    await page.goto(`${WEB_BASE_URL}/login`);
    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Password').fill(TEST_USER.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\//);
  });

  test('user can create, complete, and delete a todo', async ({ page }) => {
    const todoText = `E2E todo ${Date.now()}`;

    // Create
    await page.getByPlaceholder(/add a todo/i).fill(todoText);
    await page.keyboard.press('Enter');
    await expect(page.getByText(todoText)).toBeVisible();

    // Complete
    await page.getByRole('checkbox', { name: todoText }).check();
    await expect(page.getByRole('checkbox', { name: todoText })).toBeChecked();

    // Delete
    await page.getByRole('button', { name: /delete/i }).first().click();
    await expect(page.getByText(todoText)).not.toBeVisible();
  });
});
*/
