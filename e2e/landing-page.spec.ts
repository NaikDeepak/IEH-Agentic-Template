import { test, expect } from '@playwright/test';

test('landing page loads and has key elements', async ({ page }) => {
    await page.goto('/');

    // Check Title
    await expect(page).toHaveTitle(/India Employment Hub/);

    // Check Hero Headline
    await expect(page.getByRole('heading', { name: /Find your dream job/i, level: 1 })).toBeVisible();

    // Check Search Bar
    const searchInput = page.getByPlaceholder(/Ex: Product Designer/i);
    await expect(searchInput).toBeVisible();
    await expect(page.getByRole('button', { name: /Search/i })).toBeVisible();

    // Check Features
    await expect(page.getByText(/AI Hiring Assistant/i)).toBeVisible();

    // Verify Footer
    await expect(page.getByText(/India Employment Hub/)).toBeVisible();
});
