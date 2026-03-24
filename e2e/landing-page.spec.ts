import { test, expect } from '@playwright/test';

test('landing page loads and has key elements', async ({ page }) => {
    await page.goto('/');

    // Check Title
    await expect(page).toHaveTitle(/WorkMila.*recruitment platform/);

    // Check Hero Headline
    await expect(page.getByRole('heading', { name: /India's Smartest/i, level: 1 })).toBeVisible();

    // Check Search Bar
    const searchInput = page.getByPlaceholder(/Search roles, skills, companies.../i);
    await expect(searchInput).toBeVisible();
    // Search button is sibling to the search input
    await expect(searchInput.locator('..').locator('button')).toBeVisible();

    // Check Features
    await expect(page.getByText(/Software Engineering/i)).toBeVisible();

    // Verify Footer
    await expect(page.getByText(/© .* WorkMila/)).toBeVisible();
});
