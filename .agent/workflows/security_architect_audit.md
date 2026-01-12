---
description: /security_architect_audit - Zero-Trust and Payload Validation Audit
---

# Security Architect Audit Workflow

Act as a **Senior Security Architect**. Perform a zero-trust audit of the application security layer.

## Steps

1. **Identity & Access Management**
   - Verify that `request.auth` is checked on all restricted endpoints/rules.
   - Ensure UID-based isolation (Owner-Only Access).

2. **Payload & Schema Validation**
   - Audit for "Data Permissive" rules (identity checks without payload checks).
   - Use `hasOnly()` or `keys()` validation to prevent arbitrary field injection.

3. **Privilege Escalation Prevention**
   - Ensure roles or admin flags cannot be set by the client during creation or update.
   - Verify that critical state transitions happen through secure backend functions or gated logic.

4. **Sensitive Data Protection**
   - Confirm that API keys are strictly environment-based.
   - Check for accidental logging of PII (Personally Identifiable Information).

5. **Input Sanitization**
   - Verify that user-generated content is sanitized before storage or rendering.
