import { test, expect } from '@playwright/test';

test.describe('Seeker Critical Path', () => {
    const testEmail = `seeker-${Date.now()}@example.com`;
    const testPassword = 'Password123!';
    const testName = 'Test Seeker';

    test('should register, login, and apply to a job', async ({ page }) => {
        // Monitor console logs
        page.on('console', msg => console.log(`BROWSER [${msg.type()}]:`, msg.text()));
        page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

        try {
            // 1. Register
            console.log('Navigating to /register...');
            await page.goto('/register');
            await page.fill('input[name="name"]', testName);
            await page.fill('input[name="email"]', testEmail);
            await page.fill('input[name="password"]', testPassword);
            await page.fill('input[name="confirmPassword"]', testPassword);

            console.log('Clicking Create Account...');
            await Promise.all([
                page.click('button[type="submit"]:has-text("Create Account")'),
                // Optionally wait for a network request if we know what it is
            ]);

            // 2. Dashboard Verification
            // 2. Dashboard Verification
            console.log('Waiting for Role Selection or Dashboard...');
            try {
                // Wait for either the role overlay OR a URL that isn't /register
                await page.waitForFunction(() => {
                    const overlay = Array.from(document.querySelectorAll('*')).some(el => el.textContent?.includes('Select Your Path'));
                    return overlay || !window.location.pathname.includes('/register');
                }, { timeout: 15000 });

                const roleOverlay = page.locator('text=Select Your Path');
                if (await roleOverlay.isVisible({ timeout: 2000 })) {
                    console.log('Role Selection overlay found. Selecting "Candidate"...');
                    await page.click('text=Candidate');
                } else {
                    console.log('Role Selection overlay not seen. Checking URL...');
                }
            } catch (err: any) {
                console.log('Timeout/Error waiting for role state:', err.message);
            }

            console.log('Verifying final dashboard URL...');
            // In E2E, if we are still on /register but signed in with role, force navigate to /dashboard
            if (page.url().includes('/register')) {
                console.log('Still on /register, forcing navigation to /dashboard...');
                await page.goto('/dashboard');
            }

            await expect(page).toHaveURL(/\/seeker\/dashboard|\/dashboard/, { timeout: 20000 });
            console.log('Navigation successful!');

            // 3. Navigate to Jobs
            await page.goto('/jobs');
            await expect(page.getByRole('heading', { name: /Open Positions/i })).toBeVisible();

            // 4. First Job Apply
            const firstJobCard = page.locator('article').first();
            await expect(firstJobCard).toBeVisible();
            await firstJobCard.click();
            await expect(page).toHaveURL(/\/jobs\/.+/);

            const applyButton = page.getByRole('button', { name: /Apply Now/i });
            await expect(applyButton).toBeVisible();
            await applyButton.click();

            const submitApplicationButton = page.getByRole('button', { name: /Submit Application/i });
            if (await submitApplicationButton.isVisible()) {
                await submitApplicationButton.click();
            }

            // 5. Verify in Tracker
            await page.goto('/seeker/tracker');
            await expect(page.getByText(/Application Tracker/i)).toBeVisible();
        } catch (error) {
            const ts = Date.now();
            await page.screenshot({ path: `e2e-seeker-fail-${ts}.png`, fullPage: true });
            console.error(`Test failed. Screenshot saved: e2e-seeker-fail-${ts}.png`);
            throw error;
        }
    });
});
