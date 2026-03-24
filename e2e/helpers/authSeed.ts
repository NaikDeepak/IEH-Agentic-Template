import type { Page } from '@playwright/test';

interface SeedUser {
  email: string;
  password: string;
  displayName: string;
  role: 'seeker' | 'employer' | 'admin';
}

const SEEKER: SeedUser = {
  email: 'e2e-seeker@example.com',
  password: 'Password123!',
  displayName: 'E2E Seeker',
  role: 'seeker'
};

const EMPLOYER: SeedUser = {
  email: 'e2e-employer@example.com',
  password: 'Password123!',
  displayName: 'E2E Employer',
  role: 'employer'
};

async function waitForAuthEmulator(page: Page, timeoutMs = 30000): Promise<void> {
  const start = Date.now();
  const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST ?? '127.0.0.1:9199';
  const probeUrl = `http://${authHost}/www.googleapis.com/identitytoolkit/v3/relyingparty/getOobConfirmationCode`;

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await page.request.post(probeUrl, {
        data: { email: 'probe@example.com', requestType: 'VERIFY_EMAIL' },
        timeout: 1500
      });
      if (response.status() >= 200 && response.status() < 500) {
        return;
      }
    } catch {
      // Emulator not ready yet
    }
    await page.waitForTimeout(1000);
  }

  throw new Error(`Firebase Auth emulator not reachable on ${authHost}`);
}

async function waitForFirestoreEmulator(page: Page, timeoutMs = 30000): Promise<void> {
  const start = Date.now();
  const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8180';
  // Simple probe to the root or a known endpoint
  const probeUrl = `http://${firestoreHost}/`;

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await page.request.get(probeUrl, {
        timeout: 1500
      });
      // Firestore emulator root usually returns "Ok" or similar, status 200
      if (response.status() >= 200 && response.status() < 500) {
        return;
      }
    } catch {
      // Emulator not ready yet
    }
    await page.waitForTimeout(1000);
  }

  throw new Error(`Firebase Firestore emulator not reachable on ${firestoreHost}`);
}

async function postWithRetry(
  page: Page,
  url: string,
  data: Record<string, unknown>,
  retries = 10
) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await page.request.post(url, { data, timeout: 3000 });
    } catch (error) {
      lastError = error;
      await page.waitForTimeout(700);
    }
  }
  throw lastError;
}

async function upsertAuthUser(page: Page, user: SeedUser): Promise<void> {
  await waitForAuthEmulator(page);
  await waitForFirestoreEmulator(page);

  const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST ?? '127.0.0.1:9199';
  const apiBase = `http://${authHost}/identitytoolkit.googleapis.com/v1`;

  const signupResp = await postWithRetry(
    page,
    `${apiBase}/accounts:signUp?key=fake-api-key`,
    {
      email: user.email,
      password: user.password,
      returnSecureToken: true
    }
  );

  if (!signupResp.ok()) {
    const payload = await signupResp.json().catch(() => ({}));
    const msg = payload?.error?.message;
    if (msg !== 'EMAIL_EXISTS') {
      throw new Error(`Auth signUp failed for ${user.email}: ${signupResp.status()} ${JSON.stringify(payload)}`);
    }
  }

  const signInResp = await postWithRetry(
    page,
    `${apiBase}/accounts:signInWithPassword?key=fake-api-key`,
    {
      email: user.email,
      password: user.password,
      returnSecureToken: true
    }
  );

  if (!signInResp.ok()) {
    throw new Error(`Auth signIn failed for ${user.email}: ${signInResp.status()} ${await signInResp.text()}`);
  }

  const signInPayload = await signInResp.json();
  const idToken = signInPayload.idToken as string | undefined;
  if (!idToken) {
    throw new Error(`Missing idToken after signIn for ${user.email}`);
  }

  const updateResp = await postWithRetry(
    page,
    `${apiBase}/accounts:update?key=fake-api-key`,
    {
      idToken,
      displayName: user.displayName,
      emailVerified: true,
      returnSecureToken: true
    }
  );

  if (!updateResp.ok()) {
    throw new Error(`Auth update failed for ${user.email}: ${updateResp.status()} ${await updateResp.text()}`);
  }
}

async function upsertFirestoreUser(page: Page, user: SeedUser): Promise<void> {
  const backend = process.env.PORT ? `http://localhost:${process.env.PORT}` : 'http://localhost:8001';

  const resp = await postWithRetry(
    page,
    `${backend}/api/user/e2e-seed-user`,
    {
      email: user.email,
      password: user.password,
      displayName: user.displayName,
      role: user.role
    }
  );

  if (!resp.ok()) {
    throw new Error(`Firestore seed failed for ${user.email}: ${resp.status()} ${await resp.text()}`);
  }
}

async function ensureSeeded(page: Page, user: SeedUser): Promise<void> {
  await upsertAuthUser(page, user);
  await upsertFirestoreUser(page, user);
}

export async function ensureSeekerSeeded(page: Page): Promise<void> {
  await ensureSeeded(page, SEEKER);
}

export async function ensureEmployerSeeded(page: Page): Promise<void> {
  await ensureSeeded(page, EMPLOYER);
}

export const SEEDED_CREDENTIALS = {
  seeker: { email: SEEKER.email, password: SEEKER.password },
  employer: { email: EMPLOYER.email, password: EMPLOYER.password }
};
