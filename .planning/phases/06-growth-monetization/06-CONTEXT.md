# Phase 06: Growth & Monetization - Context

## Overview
Phase 06 focuses on creating viral loops through a specialized referral system. While the original roadmap included monetization and affiliate programs, these have been deferred to prioritize the high-quality referral engine (Brownie Points).

## Decisions

### 1. Referral & Reward Ecosystem
*   **Unique Identifier**: Every user is assigned a permanent, static alphanumeric referral code upon account creation. This code does not change.
*   **Success Trigger**: A referral is considered "successful" only when the referred user completes their first job application. Sign-up alone is insufficient.
*   **Reward Type**: Users earn internal "Brownie Points." These are non-monetary platform credits.
*   **Utility**: Brownie Points can be redeemed for:
    *   Premium platform features (e.g., enhanced AI tools).
    *   Access to partner-provided courses/certifications.
*   **Verification & Trust**:
    *   **OTP Verification**: Mandatory for the referred user to validate their identity.
    *   **LinkedIn Verification**: Strongly preferred/integrated as a secondary trust signal for Seeker referrals.

## Deferred / Future Enhancements
The following areas are out of scope for the immediate implementation of Phase 06 and are moved to future development cycles:

### 1. Monetization & Payment Gateway
*   Integration of Razorpay/Stripe for Indian market payments.
*   Subscription tier management (Free vs. Pro).
*   GST and tax handling for paid services.

### 2. Specialized Affiliate Workflows
*   Advanced influencer dashboards for tracking multi-tier influence.
*   Bulk redemption processes and partner API integrations for external course fulfillment.

### 3. Growth Hooks & Premium UX
*   "Soft" and "Hard" paywalls for AI-driven seeker/employer tools.
*   Aggressive "Invite" prompt placements throughout the user journey.
*   Automated reward notification system (In-app and Email).

## Scope Guardrails
*   **Focus**: Quality over Quantity. The referral system must prioritize verified, active users over raw sign-up numbers.
*   **Implementation**: Internal point ledger system rather than a complex financial wallet for now.
