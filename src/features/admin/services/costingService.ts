export interface CostFactors {
    monthlySalary: number;
    count: number;
}

export interface ToolCosts {
    antigravity: number;
    claudeCode: number;
    gpt4: number;
}

export interface ScaleFactors {
    users: number;
    conversions: number; // percentage
}

export const CALCULATOR_CONFIG = {
    SALARY: {
        AI_ENGINEER: 40000, // Monthly avg INR (Senior)
        FULL_STACK: 20000, // Monthly avg INR
    },
    TOOLS: {
        ANTIGRAVITY: 5000, // Per seat INR (Enterprise License)
        CLAUDE_CODE: 2500, // Per seat INR (Pro)
        GPT4: 2000, // Per seat INR (API usage)
        GENERAL_SAAS: 6000, // Slack, Workspace, Linear, Notion per head
    },
    APIS: {
        GEMINI_FLASH_PER_1K: 4.25, // INR (scaled from $0.05)
        FIREBASE_OPS_PER_1K: 1.70, // INR
    },
    OPS: {
        QA_FIXED: 25000, // Monthly retainer for specialized AI QA
        MARKETING_FIXED: 150000, // Aggressive LinkedIn & Content strategy
        LEGAL_FIXED: 55000, // Retainer for AI ethics & data privacy & DPDP
        OFFICE_FIXED: 20000, // Remote stipends / WeWork hot desks
        BUFFER_FIXED: 50000 // 10% contingency for compute spikes
    },
    FINANCE: {
        PG_FEE_PERCENT: 2.5 // Razorpay/Stripe standard transaction fee
    },
    PRICING: {
        PRO: 2499,
        ENTERPRISE: 39999
    }
};

export const calculateFinancials = (
    devs: { ai: number; fullstack: number },
    tools: { count: number },
    scale: { users: number },
    opsEnabled: { qa: boolean; marketing: boolean; legal: boolean },
    mix: { pro: number; enterprise: number } // pro is total paying %, enterprise is % of that which is enterprise
) => {
    // 1. Burn Rate Calculation
    const humanCosts = (devs.ai * CALCULATOR_CONFIG.SALARY.AI_ENGINEER) +
        (devs.fullstack * CALCULATOR_CONFIG.SALARY.FULL_STACK);

    const toolCosts = tools.count * (
        CALCULATOR_CONFIG.TOOLS.ANTIGRAVITY +
        CALCULATOR_CONFIG.TOOLS.CLAUDE_CODE +
        CALCULATOR_CONFIG.TOOLS.GPT4 +
        CALCULATOR_CONFIG.TOOLS.GENERAL_SAAS
    );

    // API usage scales with active users (avg 50 searches/actions per user/mo)
    const apiUsageMultiplier = 50;
    const apiCosts = (scale.users * apiUsageMultiplier / 1000) * (
        CALCULATOR_CONFIG.APIS.GEMINI_FLASH_PER_1K +
        CALCULATOR_CONFIG.APIS.FIREBASE_OPS_PER_1K
    );

    const opsCosts = (opsEnabled.qa ? CALCULATOR_CONFIG.OPS.QA_FIXED : 0) +
        (opsEnabled.marketing ? CALCULATOR_CONFIG.OPS.MARKETING_FIXED : 0) +
        (opsEnabled.legal ? CALCULATOR_CONFIG.OPS.LEGAL_FIXED : 0) +
        CALCULATOR_CONFIG.OPS.OFFICE_FIXED +
        CALCULATOR_CONFIG.OPS.BUFFER_FIXED;

    // Infrastructure scales: base 25k + approx 5k per 10k users for storage/bandwidth
    const infrastructure = 25000 + (Math.floor(scale.users / 10000) * 5000);

    const totalRevenuePreliminary =
        (Math.max(0, (scale.users * (mix.pro / 100)) - Math.floor((scale.users * (mix.pro / 100)) * (mix.enterprise / 100))) * CALCULATOR_CONFIG.PRICING.PRO) +
        (Math.floor((scale.users * (mix.pro / 100)) * (mix.enterprise / 100)) * CALCULATOR_CONFIG.PRICING.ENTERPRISE);

    // Add Payment Gateway Fee to Ops because it is a cost of doing business (COGB)
    const paymentGatewayFee = (totalRevenuePreliminary * CALCULATOR_CONFIG.FINANCE.PG_FEE_PERCENT) / 100;

    // Mutate opsCosts to include PG Fee for display purposes in the "Ops" bucket
    const finalOpsCosts = opsCosts + paymentGatewayFee;

    const totalBurn = humanCosts + toolCosts + apiCosts + finalOpsCosts + infrastructure;

    // 2. Revenue Projection
    const payingUsersCount = (scale.users * (mix.pro / 100)); // Total paying
    const enterpriseCount = Math.floor(payingUsersCount * (mix.enterprise / 100));
    const proCount = Math.max(0, payingUsersCount - enterpriseCount);

    const proRevenue = proCount * CALCULATOR_CONFIG.PRICING.PRO;
    const entRevenue = enterpriseCount * CALCULATOR_CONFIG.PRICING.ENTERPRISE;
    const totalRevenue = proRevenue + entRevenue;

    return {
        burn: {
            human: humanCosts,
            tools: toolCosts,
            api: apiCosts,
            ops: finalOpsCosts,
            infra: infrastructure,
            total: totalBurn
        },
        revenue: {
            pro: proRevenue,
            enterprise: entRevenue,
            total: totalRevenue,
            counts: { pro: proCount, enterprise: enterpriseCount }
        },
        profit: totalRevenue - totalBurn,
        breakdown: {
            human: {
                "AI Engineers": devs.ai * CALCULATOR_CONFIG.SALARY.AI_ENGINEER,
                "Full Stack Devs": devs.fullstack * CALCULATOR_CONFIG.SALARY.FULL_STACK
            },
            tools: {
                "Antigravity": tools.count * CALCULATOR_CONFIG.TOOLS.ANTIGRAVITY,
                "Claude Code": tools.count * CALCULATOR_CONFIG.TOOLS.CLAUDE_CODE,
                "GPT-4 API": tools.count * CALCULATOR_CONFIG.TOOLS.GPT4,
                "General SaaS": tools.count * CALCULATOR_CONFIG.TOOLS.GENERAL_SAAS
            },
            api: {
                "Gemini Flash": (scale.users * apiUsageMultiplier / 1000) * CALCULATOR_CONFIG.APIS.GEMINI_FLASH_PER_1K,
                "Firebase Ops": (scale.users * apiUsageMultiplier / 1000) * CALCULATOR_CONFIG.APIS.FIREBASE_OPS_PER_1K
            },
            ops: {
                "QA Retainer": opsEnabled.qa ? CALCULATOR_CONFIG.OPS.QA_FIXED : 0,
                "Marketing": opsEnabled.marketing ? CALCULATOR_CONFIG.OPS.MARKETING_FIXED : 0,
                "Legal/Compliance": opsEnabled.legal ? CALCULATOR_CONFIG.OPS.LEGAL_FIXED : 0,
                "Office/Remote": CALCULATOR_CONFIG.OPS.OFFICE_FIXED,
                "PG Fees (2.5%)": paymentGatewayFee,
                "Buffer": CALCULATOR_CONFIG.OPS.BUFFER_FIXED
            },
            infra: {
                "Base Cloud": 25000,
                "Scale Costs": (Math.floor(scale.users / 10000) * 5000)
            }
        }
    };
};
