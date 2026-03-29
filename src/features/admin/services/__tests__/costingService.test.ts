import { describe, it, expect } from 'vitest';
import { calculateFinancials, CALCULATOR_CONFIG } from '../costingService';

describe('costingService', () => {
  const defaultDevs = { ai: 1, fullstack: 1 };
  const defaultTools = { count: 2 };
  const defaultScale = { users: 1000 };
  const defaultOps = { qa: false, marketing: false, legal: false };
  const defaultMix = { pro: 5, enterprise: 10 }; // 5% paying, 10% of those are enterprise

  it('calculates human costs correctly', () => {
    const result = calculateFinancials(
      { ai: 2, fullstack: 3 },
      defaultTools,
      defaultScale,
      defaultOps,
      defaultMix
    );

    const expectedHuman = (2 * CALCULATOR_CONFIG.SALARY.AI_ENGINEER) + 
                         (3 * CALCULATOR_CONFIG.SALARY.FULL_STACK);
    expect(result.burn.human).toBe(expectedHuman);
    expect(result.breakdown.human['AI Engineers']).toBe(2 * CALCULATOR_CONFIG.SALARY.AI_ENGINEER);
  });

  it('calculates tool costs correctly', () => {
    const count = 5;
    const result = calculateFinancials(
      defaultDevs,
      { count },
      defaultScale,
      defaultOps,
      defaultMix
    );

    const perSeatToolCost = CALCULATOR_CONFIG.TOOLS.ANTIGRAVITY +
                           CALCULATOR_CONFIG.TOOLS.CLAUDE_CODE +
                           CALCULATOR_CONFIG.TOOLS.GPT4 +
                           CALCULATOR_CONFIG.TOOLS.GENERAL_SAAS;
    expect(result.burn.tools).toBe(count * perSeatToolCost);
  });

  it('scales API costs with user count', () => {
    const users = 5000;
    const result = calculateFinancials(
      defaultDevs,
      defaultTools,
      { users },
      defaultOps,
      defaultMix
    );

    const apiMultiplier = 50;
    const expectedApi = (users * apiMultiplier / 1000) * (
      CALCULATOR_CONFIG.APIS.GEMINI_FLASH_PER_1K +
      CALCULATOR_CONFIG.APIS.FIREBASE_OPS_PER_1K
    );
    expect(result.burn.api).toBeCloseTo(expectedApi, 2);
  });

  it('includes optional ops costs when enabled', () => {
    const resultEnabled = calculateFinancials(
      defaultDevs,
      defaultTools,
      defaultScale,
      { qa: true, marketing: true, legal: true },
      defaultMix
    );

    const resultDisabled = calculateFinancials(
      defaultDevs,
      defaultTools,
      defaultScale,
      { qa: false, marketing: false, legal: false },
      defaultMix
    );

    const opsDiff = resultEnabled.burn.ops - resultDisabled.burn.ops;
    const expectedDiff = CALCULATOR_CONFIG.OPS.QA_FIXED +
                        CALCULATOR_CONFIG.OPS.MARKETING_FIXED +
                        CALCULATOR_CONFIG.OPS.LEGAL_FIXED;
    
    // Note: PG fees might change with revenue, but for the same scale and mix, revenue is same.
    expect(opsDiff).toBe(expectedDiff);
  });

  it('calculates revenue and counts correctly', () => {
    const users = 10000;
    const mix = { pro: 10, enterprise: 20 }; // 1000 paying users, 200 enterprise, 800 pro
    const result = calculateFinancials(
      defaultDevs,
      defaultTools,
      { users },
      defaultOps,
      mix
    );

    expect(result.revenue.counts.pro).toBe(800);
    expect(result.revenue.counts.enterprise).toBe(200);
    expect(result.revenue.pro).toBe(800 * CALCULATOR_CONFIG.PRICING.PRO);
    expect(result.revenue.enterprise).toBe(200 * CALCULATOR_CONFIG.PRICING.ENTERPRISE);
    expect(result.revenue.total).toBe(result.revenue.pro + result.revenue.enterprise);
  });

  it('calculates profit correctly', () => {
    const result = calculateFinancials(
      defaultDevs,
      defaultTools,
      defaultScale,
      defaultOps,
      defaultMix
    );

    expect(result.profit).toBe(result.revenue.total - result.burn.total);
  });

  it('scales infrastructure costs correctly', () => {
    const smallScale = calculateFinancials(defaultDevs, defaultTools, { users: 5000 }, defaultOps, defaultMix);
    const largeScale = calculateFinancials(defaultDevs, defaultTools, { users: 25000 }, defaultOps, defaultMix);

    expect(smallScale.burn.infra).toBe(25000); // 0 extra (floor(5000/10000) = 0)
    expect(largeScale.burn.infra).toBe(25000 + (2 * 5000)); // floor(25000/10000) = 2
  });
});
