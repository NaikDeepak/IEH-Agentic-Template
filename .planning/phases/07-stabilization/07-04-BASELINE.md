# 07-04 Lighthouse Baseline — 2026-02-18

| Page | Performance | Accessibility | SEO | Best Practices |
|---|---|---|---|---|
| Landing (`/`) | 89 | 100 | 83 | 100 |
| Jobs (`/jobs`) | 89* | 100 | 82 | 100 |

*\*Estimated performance for Jobs page based on local run.*

### Observations
- **Performance:** Just below the 90 threshold. Main issues: lack of WebP, non-lazy-loaded images below the fold.
- **Accessibility:** Perfect (100) on automated checks, but manual audit revealed modal focus trapping and skip-to-content ID issues needed.
- **SEO:** Low due to missing meta description and potential tag hierarchy issues.
