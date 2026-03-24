import { test, expect, type Page } from '@playwright/test';

const PROTECTED_ROUTES = [
  '/jobs',
  '/jobs/invalid-job-id',
  '/onboarding',
  '/dashboard',
  '/seeker/dashboard',
  '/seeker/resume',
  '/seeker/skills',
  '/seeker/interview',
  '/seeker/assessments',
  '/seeker/networking',
  '/seeker/tracker',
  '/seeker/profile',
  '/seeker/referral',
  '/post-job',
  '/employer/search',
  '/employer/company',
  '/employer/jobs',
  '/employer/jobs/invalid-job-id/applicants',
  '/admin',
  '/admin/users',
  '/admin/jobs',
  '/admin/finance',
  '/admin/settings'
];

async function expectRedirectToLogin(page: Page, route: string) {
  await page.goto(route);
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
}

test.describe('Route smoke coverage', () => {
  test('public routes render expected entry points', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /india's smartest job platform/i })).toBeVisible();

    await page.goto('/pricing');
    await expect(page.getByRole('heading', { name: /simple, transparent pricing/i })).toBeVisible();

    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /join workmila/i })).toBeVisible();

    await page.goto('/register/seeker');
    await expect(page.getByRole('heading', { name: /start your job search/i })).toBeVisible();

    await page.goto('/register/employer');
    await expect(page.getByRole('heading', { name: /start hiring today/i })).toBeVisible();

    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /i'm a job seeker/i })).toBeVisible();

    await page.goto('/login/seeker');
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();

    await page.goto('/login/employer');
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
  });

  test('verify-email redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/verify-email');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  });

  test('company profile invalid id shows error state', async ({ page }) => {
    await page.goto('/companies/non-existent-company-id');
    await expect(page.getByRole('heading', { name: /company not found/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /browse jobs/i })).toBeVisible();
  });

  for (const route of PROTECTED_ROUTES) {
    test(`protected route redirects to login: ${route}`, async ({ page }) => {
      await expectRedirectToLogin(page, route);
    });
  }
});

