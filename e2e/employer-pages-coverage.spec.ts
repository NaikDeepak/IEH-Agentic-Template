import { test, expect, type Page } from '@playwright/test';
import { SEEDED_CREDENTIALS, ensureEmployerSeeded } from './helpers/authSeed';

async function loginEmployer(page: Page) {
  await ensureEmployerSeeded(page);
  await page.goto('/login/employer');
  await page.fill('input[name="email"]', SEEDED_CREDENTIALS.employer.email);
  await page.fill('input[name="password"]', SEEDED_CREDENTIALS.employer.password);
  await page.click('button[type="submit"]:has-text("Sign In")');

  // Auth state propagation can be async in emulator mode; poll protected route.
  for (let i = 0; i < 12; i++) {
    await page.goto('/employer/jobs');
    if (/\/employer\/jobs/.test(page.url())) {
      await page.waitForTimeout(2000); // Allow auth persistence to settle
      return;
    }
    await page.waitForTimeout(500);
  }

  throw new Error(`Employer login did not establish session; current URL: ${page.url()}`);
}

async function assertPageLoads(page: Page, route: string, expected: RegExp) {
  await page.goto(route);
  // Use a stricter regex to avoid matching query parameters like ?redirect=/employer/jobs
  // This ensures we are actually on the page, not the login page redirecting to it.
  const escapedRoute = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\:id/g, '[^/?]+');
  await expect(page).toHaveURL(new RegExp(`^.*${escapedRoute}$`));
  await expect(page.getByText(expected)).toBeVisible({ timeout: 15000 });
}

test.describe('Employer page-by-page coverage', () => {
  test('authenticated employer can access core employer pages', async ({ page }) => {
    await loginEmployer(page);

    await assertPageLoads(page, '/employer/jobs', /manage your postings/i);
    await assertPageLoads(page, '/post-job', /Post a Position/i);
    await assertPageLoads(page, '/employer/search', /Find Top Talent/i);
    await assertPageLoads(page, '/employer/company', /Company Branding/i);
  });
});
