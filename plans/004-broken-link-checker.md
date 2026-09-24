# Plan 004: Broken Link Checker (Scheduled)

**Category:** Operations  
**Leverage:** MEDIUM  
**Effort:** S  
**Risk:** LOW  
**Depends On:** —  
**Base Commit:** `192477d`

## Problem

External links in the article (sources, references) can rot. A "source of truth" reference site must guarantee all citations remain accessible.

## Current State

- ~30 external links in `index.html` (sources, PDFs, news articles, Wikipedia)
- No automated link checking
- Manual verification only

## Implementation

### 1. Add link checker script: `scripts/check-links.mjs`

```javascript
/**
 * Broken link checker — validates all external href/src in index.html
 * Run: node scripts/check-links.mjs
 * CI: runs weekly via GitHub Actions schedule
 */
import { readFileSync } from 'fs';
import { URL } from 'url';

const HTML = readFileSync('index.html', 'utf8');

// Extract all href and src attributes
const hrefRegex = /href=["']([^"']+)["']/g;
const srcRegex = /src=["']([^"']+)["']/g;

const urls = new Set();
let match;
while ((match = hrefRegex.exec(HTML))) urls.add(match[1]);
while ((match = srcRegex.exec(HTML))) urls.add(match[1]);

// Filter: only external HTTP(S) URLs
const external = [...urls].filter(u => {
  try {
    const url = new URL(u);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
});

console.log(`Checking ${external.length} external links...`);

const results = [];
const concurrency = 5;
const delay = (ms) => new Promise(r => setTimeout(r, ms));

async function checkUrl(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      const res = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok || res.status === 405 || res.status === 403) {
        // 405/403 = HEAD not allowed but resource exists
        return { url, status: res.status, ok: true };
      }
      if (res.status >= 400 && res.status < 500) {
        return { url, status: res.status, ok: false, error: `HTTP ${res.status}` };
      }
      // 5xx = retry
    } catch (e) {
      if (i === retries) return { url, ok: false, error: e.message };
    }
    await delay(1000 * (i + 1));
  }
  return { url, ok: false, error: 'Max retries exceeded' };
}

async function run() {
  for (let i = 0; i < external.length; i += concurrency) {
    const batch = external.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(u => checkUrl(u)));
    results.push(...batchResults);
  }

  const broken = results.filter(r => !r.ok);
  const ok = results.filter(r => r.ok);

  console.log(`\n✅ ${ok.length} OK`);
  if (broken.length) {
    console.log(`\n❌ ${broken.length} BROKEN:`);
    for (const b of broken) {
      console.log(`  ${b.status || 'ERR'} ${b.url}`);
      if (b.error) console.log(`    → ${b.error}`);
    }
    process.exitCode = 1;
  } else {
    console.log('\n✅ All links healthy');
  }
}

run();
```

### 2. Add npm script

```json
// package.json
"scripts": {
  ...
  "check:links": "node scripts/check-links.mjs"
}
```

### 3. Add scheduled CI job: `.github/workflows/link-check.yml`

```yaml
name: Link Check

on:
  schedule:
    - cron: '0 6 * * 1'  # Weekly Monday 06:00 UTC
  workflow_dispatch:     # Manual trigger

jobs:
  link-check:
    name: Check External Links
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Check links
        run: npm run check:links
      - name: Notify on failure
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '🔗 Broken links detected',
              body: 'Scheduled link check found broken external references. Check workflow logs for details.',
              labels: ['bug', 'links', 'automated']
            })
```

### 4. Add local ignore list for known problematic domains (optional)

```javascript
// scripts/check-links.mjs - add to top
const ALLOWLIST_403 = [
  'economictimes.indiatimes.com',  // blocks HEAD
  'frontline.thehindu.com',         // paywall
];
// In checkUrl: treat 403 from these as OK
```

## Files to Create/Modify

| File | Action |
|------|--------|
| `scripts/check-links.mjs` | Create (new) |
| `package.json` | Add check:links script |
| `.github/workflows/link-check.yml` | Create (new) |

## Verification Commands

```bash
# Local
npm run check:links
# Should show all links OK (or list known 403s as OK)

# CI: Trigger manually via Actions tab → Link Check → Run workflow
```

## Done Criteria

- [ ] `npm run check:links` runs locally and reports all links healthy
- [ ] Scheduled workflow created (runs weekly)
- [ ] Manual workflow dispatch works
- [ ] Failure creates GitHub issue automatically
- [ ] Known 403 domains (paywalls) handled gracefully
- [ ] No existing test regressions (`npm run check` passes)

## Escape Hatches

- If a source permanently dies: archive via Wayback Machine, update link to archive.org snapshot
- If rate limited: add exponential backoff, reduce concurrency
- If false positives: refine allowlist or switch to GET for specific domains

## Maintenance Notes

- Run manually before major releases
- Review generated issues weekly
- Update allowlist as domains change behavior
- Consider adding `link-check` to PR checks (fast subset only)