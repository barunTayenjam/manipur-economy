# Runbook — manipur-economy

Incident owner: repo owner. Source of truth: this file + CI.

## Rollback (fast)
```bash
git revert <sha> --no-verify   # GPG fails in this repo; always --no-verify
git push origin main
```
Pages redeploys automatically (deploy job needs `check`+`security`+`e2e`+`lighthouse` green). Verify:
```bash
for u in '' data/charts.json data/map.geo.json assets/js/main.js assets/css/site.css; do
  curl -s -o /dev/null -w "%{http_code} $u\n" -L "https://baruntayenjam.github.io/manipur-economy/$u"
done
# expect all 200
```

## Rollback blocked (CI red)
Fix forward on a branch, open PR, merge only when `check`/`security`/`e2e`/`lighthouse` green. `deploy` has `needs: [check, security, e2e, lighthouse]` — red gates block Pages.

## Triage order
1. CI run URL (which job failed: check/security/e2e/lighthouse/deploy).
2. Pages: Actions → `pages build and deployment` status.
3. Local: `npm run check` (lint+format+unit+e2e+a11y+seo+content).
4. Browser: Console (CSP violations, CDN SRI failures), Network (tiles/Chart.js fetch).
5. Uptime/link-check issues (labels `uptime`, `links`).

## Contacts
- CI: `.github/workflows/ci.yml`
- Monitors: `.github/workflows/uptime.yml`, `link-check.yml`
- Live: https://baruntayenjam.github.io/manipur-economy/

## Post-incident (5 lines)
What / Impact / Root cause / Fix / Prevention.
