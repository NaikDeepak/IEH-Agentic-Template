---
description: "Start a new feature with strict branching (No direct commits to main)"
---
1. **Sync Main**: Ensure we are starting from the latest code.
// turbo
2. git checkout main && git pull origin main
3. **Ask Feature Name**: Request a concise feature name from the user (e.g., `user-auth`, `landing-page-v2`).
4. **Create Branch**: Create and switch to the new feature branch.
   - naming convention: `feature/[feature-name]`
   - command: `git checkout -b feature/[feature-name]`
5. **Verify**: Ensure you are on the correct branch before writing any code.
   - command: `git branch --show-current`
