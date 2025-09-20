
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('should load dashboard, verify title, and take a screenshot', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');

    // Verify the page title
    await expect(page).toHaveTitle('🤖 XAgent Control Dashboard - לוח בקרה');

    // Verify that the header component is visible
    await expect(page.locator('header')).toBeVisible();

    // Take a screenshot for visual regression testing
    await page.screenshot({ path: 'e2e/screenshots/dashboard-home.png', fullPage: true });
  });
});
