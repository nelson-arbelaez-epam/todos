/**
 * Web e2e support — Playwright base page-object helper.
 *
 * This file is intentionally minimal: it acts as a placeholder for the
 * base Page Object Model (POM) class that will wrap Playwright's `Page`
 * once Playwright is installed.
 *
 * Installation (not yet performed — tracked in the follow-up PBI):
 *   yarn workspace @todos/web add -D @playwright/test
 *   yarn playwright install --with-deps chromium
 *
 * Usage pattern once installed:
 *   import { BasePage } from '../support/base-page';
 *   const page = new BasePage(playwrightPage);
 *   await page.goto('/');
 */

/**
 * Placeholder base URL helper — replace with actual Playwright `baseURL`
 * from `playwright.config.ts` once that config file is created.
 */
export const WEB_BASE_URL = process.env.WEB_BASE_URL ?? 'http://localhost:5173';
