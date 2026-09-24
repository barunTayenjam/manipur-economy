# Plan 003: Dependabot + Security Scanning in CI

**Category:** Security / DX  
**Leverage:** HIGH  
**Effort:** S  
**Risk:** LOW  
**Depends On:** —  
**Base Commit:** `192477d`

## Problem

No automated dependency updates or security scanning in CI. Dependencies drift (eslint 9→10, playwright 1.57→1.63, prettier 3.6→3.9). Security vulnerabilities could be introduced without detection.

## Current State

- `package.json` with 5 devDependencies
- `npm audit` shows 0 vulnerabilities currently
- No Dependabot config
- No security job in CI
- No `package-lock.json` audit in CI

## Implementation

### 1. Add Dependabot config: `.github/dependabot.yml`

```yaml
version: 2
updates:
  # npm dependencies
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
      timezone: "Asia/Kolkata"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "npm"
    commit-message:
      prefix: "deps"
      include: "scope"
    groups:
      development-dependencies:
        patterns:
          - "*"
        update-types:
          - "minor"
          - "patch"
    # Major updates require manual review
    allow:
      - dependency-type: "direct"
        update-type: "version-update:semver-major"

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
      timezone: "Asia/Kolkata"
    labels:
      - "dependencies"
      - "github-actions"
    commit-message:
      prefix: "deps"
      include: "scope"
```

### 2. Add security job to `.github/workflows/ci.yml`

```yaml
# Add to jobs section
security:
  name: Security Audit
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 22
        cache: npm
    - name: Install dependencies
      run: npm ci
    - name: Run npm audit
      run: npm audit --audit-level=high --json > audit-report.json || true
    - name: Check for high/critical vulnerabilities
      run: |
        HIGH_CRITICAL=$(cat audit-report.json | jq '.metadata.vulnerabilities.high + .metadata.vulnerabilities.critical')
        if [ "$HIGH_CRITICAL" -gt 0 ]; then
          echo "::error::Found $HIGH_CRITICAL high/critical vulnerabilities"
          cat audit-report.json | jq '.vulnerabilities[] | select(.severity == "high" or .severity == "critical") | {name: .name, severity: .severity, via: .via, fixAvailable: .fixAvailable}'
          exit 1
        fi
        echo "No high/critical vulnerabilities found"
    - name: Verify SRI integrity (charts.js + map.js)
      run: |
        # Verify Chart.js SRI
        CHART_SRI="sha384-9nhczxUqK87bcKHh20fSQcTGD4qq5GhayNYSYWqwBkINBhOfQLg/P5HG5lF1urn4"
        CHART_URL="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"
        curl -sL "$CHART_URL" | sha384sum -c <<< "$CHART_SRI  -" || echo "::error::Chart.js SRI mismatch"
        
        # Verify Leaflet SRI
        LEAFLET_SRI="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        LEAFLET_URL="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        curl -sL "$LEAFLET_URL" | sha256sum -c <<< "$LEAFLET_SRI  -" || echo "::error::Leaflet SRI mismatch"
```

### 3. Add npm script for local security check

```json
// package.json
"scripts": {
  ...
  "audit": "npm audit --audit-level=high",
  "audit:fix": "npm audit fix --audit-level=high"
}
```

### 4. Add `jq` for JSON parsing (Ubuntu has it by default, but document)

```yaml
# In security job, before audit step
- name: Install jq
  run: sudo apt-get update && sudo apt-get install -y jq
```

## Files to Create/Modify

| File | Action |
|------|--------|
| `.github/dependabot.yml` | Create (new) |
| `.github/workflows/ci.yml` | Add security job |
| `package.json` | Add audit scripts |

## Verification Commands

```bash
# Local
npm audit --audit-level=high
# Should show 0 vulnerabilities

# Verify SRI manually
curl -sL https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js | sha384sum
# Should match sha384-9nhczxUqK87bcKHh20fSQcTGD4qq5GhayNYSYWqwBkINBhOfQLg/P5HG5lF1urn4

curl -sL https://unpkg.com/leaflet@1.9.4/dist/leaflet.js | sha256sum
# Should match sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=
```

## Done Criteria

- [ ] `.github/dependabot.yml` created and active (check GitHub Insights → Dependency graph → Dependabot)
- [ ] Security job added to CI workflow
- [ ] CI run shows security job passing
- [ ] `npm audit --audit-level=high` passes locally
- [ ] SRI verification passes in CI
- [ ] Dependabot PRs auto-created for minor/patch updates (check after 1 week)
- [ ] No existing test regressions (`npm run check` passes)

## Escape Hatches

- If major version updates break build: Dependabot groups minors/patches only; majors require manual PR
- If SRI check fails due to CDN changes: update SRI in `utils.js` (`loadScript` calls) and `charts.js`/`map.js` constants
- If npm audit has false positives: use `npm audit fix --force` cautiously, or document accepted risk in `SECURITY.md`

## Maintenance Notes

- Review Dependabot PRs weekly — merge minors/patches after CI passes
- Manually evaluate major version PRs (eslint 10, playwright 1.63, etc.)
- Update SRI hashes when intentionally upgrading CDN libraries
- Add `SECURITY.md` with reporting process if not present