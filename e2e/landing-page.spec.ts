import { test, expect } from '@playwright/test';

test('landing page loads and has key elements', async ({ page }) => {
    await page.goto('/');

    // Check Title
    await expect(page).toHaveTitle(/India Employment Hub/);

    // Check Hero Headline
    await expect(page.getByRole('heading', { name: /Active/i, level: 1 })).toBeVisible();

    // Check CTA
    const hireBtn = page.getByRole('button', { name: /Hire Talent/i });
    await expect(hireBtn).toBeVisible();

    // Check Features
    await expect(page.getByText(/AI Hiring Assistant/i)).toBeVisible();

    // Verify Footer
    await expect(page.getByText(/India Employment Hub/)).toBeVisible();
});
