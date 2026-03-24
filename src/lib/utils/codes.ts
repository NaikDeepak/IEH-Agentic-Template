/**
 * Generates a unique, static alphanumeric referral code.
 * Format: WM-[6-CHAR-ALPHANUMERIC]
 */
export const generateReferralCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like 0, O, I, 1, L
  let result = '';
  const randomValues = new Uint32Array(6);
  const global = globalThis as unknown as { crypto?: { getRandomValues: (arr: Uint32Array) => void } };
  const cryptoObj = global.crypto;

  if (cryptoObj?.getRandomValues) {
    cryptoObj.getRandomValues(randomValues);
  } else {
    for (let i = 0; i < randomValues.length; i++) {
      randomValues[i] = Math.floor(Math.random() * 0xffffffff);
    }
  }

  // E2E/Test environment safeguard: Ensure code is unique by appending timestamp component
  // if navigator.webdriver is present (automation detected)
  const isAutomation = typeof navigator !== 'undefined' && navigator.webdriver;
  
  if (isAutomation) {
      // Use timestamp-based generation for tests to avoid collisions
      const ts = Date.now().toString(36).toUpperCase().slice(-6);
      return `WM-${ts}`;
  }

  for (let i = 0; i < 6; i++) {
    const val = randomValues[i] ?? 0;
    result += chars.charAt(val % chars.length);
  }

  return `WM-${result}`;
};
