import { test, expect } from '@playwright/test';

test('landing page loads and has key elements', async ({ page }) => {
    await page.goto('/');

    // Check Title
    await expect(page).toHaveTitle(/IEH.*recruitment platform/);

    // Check Hero Headline
    await expect(page.getByRole('heading', { name: /India Employment Hub/i, level: 1 })).toBeVisible();

    // Check Search Bar
    const searchInput = page.getByPlaceholder(/SEARCH ROLES/i);
    await expect(searchInput).toBeVisible();
    // Search button is sibling to the search input
    await expect(searchInput.locator('..').locator('button')).toBeVisible();

    // Check Features
    await expect(page.getByText(/Creative & Design/i)).toBeVisible();

    // Verify Footer
    await expect(page.getByText(/India Employment Hub/)).toBeVisible();
});
