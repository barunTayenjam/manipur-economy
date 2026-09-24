# ADR 0005: Zero-Build, GitHub Pages, CI-Gated Deploy

## Status
Accepted

## Context
No backend, no env vars. Need free static hosting with reviewable deploys.

## Decision
No build step. GitHub Pages serves repo root (`.nojekyll`). CI (`CI` workflow) gates `deploy`: `needs: [check, security, e2e, lighthouse]` on `push` to `main`; deploy job uploads `.` via `upload-pages-artifact` + `deploy-pages`, then curl health-checks homepage 200. Scheduled `link-check.yml` (weekly) + `uptime.yml` (30min) open issues on failure. Lighthouse via `npx @lhci/cli` (not pinned — transitive high vulns in its lighthouse chain; see commit `a6c1835`).

## Alternatives
- Netlify/Vercel: rejected — Pages suffices; avoids extra vendor + secrets.
- Build pipeline (minify): rejected — gains small at this size; keep `npm run check` as the only gate.

## Consequences
Positive: deploys are git pushes; rollback is `git revert`.
Negative: no HTTP header control (CSP via meta only); no preview deploys per PR (visual job runs PR-only without deploy).
