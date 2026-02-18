# Phase 06 Research: Growth & Monetization

## 1. Alphanumeric Referral Codes
**Goal**: Unique, static, short codes for every user.
**Design**:
- **Format**: `IEH-[6-CHAR-ALPHANUMERIC]` (e.g., `IEH-X7B2K9`).
- **Generation**: Use a custom utility function with `crypto.getRandomValues` or `Math.random` if `nanoid` is not preferred.
- **Persistence**:
  - `users/{uid}/referralCode`: Store the code in the user profile.
  - `referralCodes/{code}`: A reverse lookup collection to ensure uniqueness and allow quick retrieval of the `uid` during registration.
- **Workflow**:
  1. On first login/registration, check if the user has a `referralCode`.
  2. If not, generate one and verify it doesn't exist in `referralCodes/` collection.
  3. Save to both locations.

## 2. Trust Signals (LinkedIn & OTP)
### LinkedIn Verification
- **Mechanism**: Use Firebase Auth with LinkedIn as an OIDC provider (requires Firebase Identity Platform) OR implement a custom OAuth2 flow.
- **Outcome**: Once verified, set `linkedinVerified: true` in the user profile. This acts as a high-quality filter for referrals.

### OTP Verification (Firebase Phone Auth)
- **Mechanism**: 
  - Use `RecaptchaVerifier` for bot protection.
  - Use `auth.linkWithPhoneNumber` or `signInWithPhoneNumber` to verify the user's mobile number.
- **Outcome**: Once the 6-digit OTP is verified, set `phoneVerified: true` in the user profile.

## 3. "Brownie Points" Ledger System
**Goal**: Atomic, audit-ready point tracking.
**Schema**:
- **`users/{uid}`**:
  - `browniePoints`: `number` (Current balance).
- **`ledger/{transactionId}`**:
  - `uid`: `string` (Owner of points).
  - `amount`: `number` (e.g., `+50`, `-10`).
  - `type`: `string` (`'referral_bonus' | 'redemption'`).
  - `metadata`: `object` (e.g., `{ referredUid: '...' }`).
  - `timestamp`: `FieldValue.serverTimestamp()`.

**Atomic Operations**:
- Use Firestore `runTransaction` or `writeBatch` to ensure that incrementing the user's balance and creating the ledger entry happen together.

## 4. Referral Success Trigger
**Condition**: Successful referral occurs only when the referred user applies for their **first** job.
**Logic**:
1. In `ApplicationService.submitApplication`, check if the user has a `referredBy` field.
2. If yes, check if this is their first application (count `applications` collection for this `uid`).
3. If it's the first application:
   - Verify `phoneVerified` and `linkedinVerified` are `true`.
   - If all conditions met, trigger the reward for the referrer.

## 5. Implementation Roadmap
- **Service**: Create `src/features/growth/services/referralService.ts`.
- **UI**: 
  - `ReferralDashboard`: Show code and points balance.
  - `VerificationChecklist`: Guide users through Phone/LinkedIn verification.
- **Trigger**: Hook into the existing `submitApplication` flow.
