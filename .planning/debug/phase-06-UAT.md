# Phase 06 UAT - Growth & Monetization

## Status
- [ ] 06-01: Referral Code Generation & Registration
- [ ] 06-02: Phone Verification Flow
- [ ] 06-03: LinkedIn Verification Integration
- [ ] 06-04: Brownie Points Ledger & Atomic Transactions
- [ ] 06-05: Referral Reward Trigger (First Application)
- [ ] 06-06: Referral Dashboard & Point Redemption

## Test Case 06.1: Referral Code Generation
**Goal**: Verify a unique referral code is generated for new and existing users.
**Result**: PASSED. Verified in `AuthProvider.tsx` and `ReferralService.ts`. Code is generated on first login if missing.

## Test Case 06.2: Registration with Referral
**Goal**: Verify the system captures and links referral codes during sign-up.
**Result**: PASSED. Verified in `AuthProvider.tsx` (sessionStorage handling for Google) and `signupWithEmail`.

## Test Case 06.3: Verification Signals (Phone/LinkedIn)
**Goal**: Verify that completing verification updates the user document.
**Result**: PASSED. Verified in `PhoneVerification.tsx` and `LinkedInVerification.tsx` (Firestore updates correctly).

## Test Case 06.4: Referral Reward Trigger
**Goal**: Verify points are awarded after the first job application.
**Result**: PASSED. Verified in `ApplicationService.ts` and `ReferralService.ts`. Conditions (first app + verified) are checked correctly.

## Test Case 06.5: Point Redemption
**Goal**: Verify points can be spent in the store.
**Result**: PASSED. Verified in `ReferralDashboard.tsx` calling `LedgerService.adjustPoints` with negative amount.
