/**
 * Generates a unique, static alphanumeric referral code.
 * Format: IEH-[6-CHAR-ALPHANUMERIC]
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

  for (let i = 0; i < 6; i++) {
    const val = randomValues[i] ?? 0;
    result += chars.charAt(val % chars.length);
  }

  return `IEH-${result}`;
};
