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
**Steps**:
1. Log in to the application.
2. Navigate to the Referral Dashboard.
3. Observe if "Your Referral Code" is populated.
**Expected**: A code in format `IEH-XXXXXX` is visible and copied to clipboard correctly.
**Result**: 

## Test Case 06.2: Registration with Referral
**Goal**: Verify the system captures and links referral codes during sign-up.
**Steps**:
1. Open a new browser session with a referral link (e.g., `/register?ref=IEH-TEST12`).
2. Verify the "Referral Code" field is pre-filled.
3. Complete registration (Email or Google).
4. Check Firestore `users` document for the new user.
**Expected**: The `referredBy` field contains the UID of the referrer.
**Result**: 

## Test Case 06.3: Verification Signals (Phone/LinkedIn)
**Goal**: Verify that completing verification updates the user document.
**Steps**:
1. In the Referral Dashboard, complete Phone Verification.
2. Complete LinkedIn Verification.
**Expected**: Dashboard shows green checkmarks; Firestore document has `phoneVerified: true` and `linkedinVerified: true`.
**Result**: 

## Test Case 06.4: Referral Reward Trigger
**Goal**: Verify points are awarded after the first job application.
**Steps**:
1. User B (referred by User A) is fully verified.
2. User B applies for any job.
3. Check User A's point balance.
**Expected**: User A receives 50 Brownie Points; a ledger entry is created.
**Result**: 

## Test Case 06.5: Point Redemption
**Goal**: Verify points can be spent in the store.
**Steps**:
1. Earn at least 100 points.
2. In the Referral Hub store, click "Redeem Now" for a 100 BP item.
**Expected**: Point balance decreases; alert confirms redemption; ledger entry of type `redemption` is created.
**Result**: 
