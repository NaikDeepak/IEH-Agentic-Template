import { test, expect, type Page } from '@playwright/test';
import { SEEDED_CREDENTIALS, ensureSeekerSeeded } from './helpers/authSeed';

async function loginSeeker(page: Page) {
  await ensureSeekerSeeded(page);
  await page.goto('/login/seeker');
  await page.fill('input[name="email"]', SEEDED_CREDENTIALS.seeker.email);
  await page.fill('input[name="password"]', SEEDED_CREDENTIALS.seeker.password);
  await page.click('button[type="submit"]:has-text("Sign In")');

  // Auth state propagation can be async in emulator mode; poll protected route.
  for (let i = 0; i < 12; i++) {
    await page.goto('/seeker/dashboard');
    if (/\/seeker\/dashboard/.test(page.url())) {
      await page.waitForTimeout(2000); // Allow auth persistence to settle
      return;
    }
    await page.waitForTimeout(500);
  }

  throw new Error(`Seeker login did not establish session; current URL: ${page.url()}`);
}

test.describe('Seeker page-by-page coverage', () => {
  test('authenticated seeker can access core seeker pages', async ({ page }) => {
    await loginSeeker(page);

    await page.goto('/seeker/dashboard');
    
    // Debug: Check if loader is visible
    if (await page.locator('div.animate-spin').count() > 0) {
        console.log('Loader detected. Waiting for it to disappear...');
        try {
            await expect(page.locator('div.animate-spin')).toHaveCount(0, { timeout: 20000 });
        } catch (e) {
            console.log('Loader failed to disappear. Page content:', await page.content());
            throw e;
        }
    }

    await expect(page.getByText(/your dashboard/i)).toBeVisible({ timeout: 15000 });

    await page.goto('/seeker/resume');
    await expect(page.getByRole('heading', { name: /resume intelligence/i })).toBeVisible();

    await page.goto('/seeker/skills');
    await expect(page.getByRole('heading', { name: /skill gap analysis/i })).toBeVisible();

    await page.goto('/seeker/interview');
    await expect(page.getByRole('heading', { name: /ai interview prep/i })).toBeVisible();

    await page.goto('/seeker/assessments');
    await expect(page.getByRole('heading', { name: /verified skill proofs/i })).toBeVisible();

    await page.goto('/seeker/networking');
    await expect(page).toHaveURL(/\/seeker\/networking/);

    await page.goto('/seeker/tracker');
    await expect(page.getByRole('heading', { name: /application tracker/i })).toBeVisible();

    await page.goto('/seeker/profile');
    await expect(page.getByRole('heading', { name: /edit profile/i })).toBeVisible();

    await page.goto('/seeker/referral');
    await expect(page.getByRole('heading', { name: /referral hub/i })).toBeVisible();
  });
});
