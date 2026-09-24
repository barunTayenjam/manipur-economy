# Plan 005: Uptime Monitoring + Alerting

**Category:** Operations  
**Leverage:** MEDIUM  
**Effort:** S  
**Risk:** LOW  
**Depends On:** —  
**Base Commit:** `192477d`

## Problem

No uptime monitoring. If GitHub Pages deployment fails or the site goes down, we won't know until someone visits.

## Current State

- Deployed to GitHub Pages: `https://baruntayenjam.github.io/manipur-economy/`
- CI has deploy job but no post-deploy health check
- No external monitoring

## Implementation

### Option A: GitHub Actions + Uptime Robot (Recommended — free, simple)

#### 1. Add post-deploy health check to `.github/workflows/ci.yml`

```yaml
# In deploy job, after deployment step
- name: Verify deployment health
  run: |
    URL="https://baruntayenjam.github.io/manipur-economy/"
    for i in {1..5}; do
      CODE=$(curl -s -o /dev/null -w '%{http_code}' -L "$URL")
      if [ "$CODE" = "200" ]; then
        echo "✅ Deployment healthy (HTTP 200)"
        exit 0
      fi
      echo "Waiting for deployment... ($i/5)"
      sleep 10
    done
    echo "::error::Deployment health check failed (HTTP $CODE)"
    exit 1
```

#### 2. Set up UptimeRobot (free tier: 50 monitors, 5-min intervals)

1. Go to https://uptimerobot.com → Add Monitor
2. Type: HTTP(s)
3. URL: `https://baruntayenjam.github.io/manipur-economy/`
4. Interval: 5 minutes
5. Alert contacts: Email, Webhook (Slack/Discord), or GitHub Issues via webhook

#### 3. Add status badge to README.md

```markdown
![Uptime](https://img.shields.io/endpoint?url=https://api.uptimerobot.com/v2/getMonitors&api_key=YOUR_KEY&format=json&logs=1)
```

### Option B: GitHub Actions Self-Hosted Monitoring (No external service)

#### 1. Create `.github/workflows/uptime.yml`

```yaml
name: Uptime Monitor

on:
  schedule:
    - cron: '*/10 * * * *'  # Every 10 minutes
  workflow_dispatch:

jobs:
  uptime:
    name: Check Site Health
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: Check homepage
        id: homepage
        run: |
          URL="https://baruntayenjam.github.io/manipur-economy/"
          CODE=$(curl -s -o /dev/null -w '%{http_code}' -L --max-time 10 "$URL")
          echo "status=$CODE" >> $GITHUB_OUTPUT
          if [ "$CODE" != "200" ]; then
            echo "::error::Homepage returned HTTP $CODE"
            exit 1
          fi
      
      - name: Check critical assets
        run: |
          for asset in \
            "assets/js/main.js" \
            "assets/css/site.css" \
            "data/charts.json" \
            "data/map.geo.json"
          do
            CODE=$(curl -s -o /dev/null -w '%{http_code}' -L "https://baruntayenjam.github.io/manipur-economy/$asset")
            if [ "$CODE" != "200" ]; then
              echo "::error::$asset returned HTTP $CODE"
              exit 1
            fi
          done
      
      - name: Check Core Web Vitals (lightweight)
        run: |
          # Quick LCP proxy: measure time to first byte + HTML download
          START=$(date +%s%3N)
          curl -s -o /dev/null -L "https://baruntayenjam.github.io/manipur-economy/"
          END=$(date +%s%3N)
          LATENCY=$((END - START))
          if [ $LATENCY -gt 3000 ]; then
            echo "::warning::High latency: ${LATENCY}ms"
          fi
          echo "Latency: ${LATENCY}ms"

      - name: Create issue on failure
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            const { data: existing } = await github.rest.issues.listForRepo({
              owner: context.repo.owner,
              repo: context.repo.repo,
              state: 'open',
              labels: 'uptime'
            });
            if (existing.length === 0) {
              await github.rest.issues.create({
                owner: context.repo.owner,
                repo: context.repo.repo,
                title: '🚨 Site Down: manipur-economy',
                body: `Uptime check failed at ${new Date().toISOString()}. Check workflow run: ${context.runUrl}`,
                labels: ['uptime', 'critical', 'automated']
              });
            }
```

## Files to Modify

| File | Action |
|------|--------|
| `.github/workflows/ci.yml` | Add post-deploy health check |
| `.github/workflows/uptime.yml` | Create (new) — Option B |
| `README.md` | Add status badge — Option A |

## Verification Commands

```bash
# Manual health check
curl -s -o /dev/null -w '%{http_code}' -L https://baruntayenjam.github.io/manipur-economy/
# Should return 200

# Check critical assets
for a in assets/js/main.js assets/css/site.css data/charts.json data/map.geo.json; do
  curl -s -o /dev/null -w '%{http_code} ' -L "https://baruntayenjam.github.io/manipur-economy/$a"
done
echo
# All should be 200
```

## Done Criteria

- [ ] Post-deploy health check added to CI deploy job
- [ ] Uptime monitoring active (UptimeRobot OR scheduled workflow)
- [ ] Alerting configured (email/Slack/GitHub Issues)
- [ ] Status badge in README (if UptimeRobot)
- [ ] Manual verification passes
- [ ] No existing test regressions (`npm run check` passes)

## Escape Hatches

- If GitHub Pages has intermittent issues: increase retry logic in health check
- If UptimeRobot free tier limits hit: switch to GitHub Actions self-monitoring
- If false alerts: tune check frequency or add grace period

## Maintenance Notes

- Test alerting quarterly (temporarily break deploy)
- Review uptime reports monthly
- Update monitored URLs if site structure changes