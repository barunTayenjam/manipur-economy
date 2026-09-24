/**
 * Broken link checker — validates all external href/src in index.html
 * Run: npm run check:links
 * CI: runs weekly via GitHub Actions schedule
 */
import { readFileSync } from 'node:fs';

const HTML = readFileSync('index.html', 'utf8');

const hrefRegex = /href=["']([^"']+)["']/g;
const srcRegex = /src=["']([^"']+)["']/g;

const urls = new Set();
let match;
while ((match = hrefRegex.exec(HTML))) urls.add(match[1]);
while ((match = srcRegex.exec(HTML))) urls.add(match[1]);

const external = [...urls].filter((u) => {
  try {
    const url = new URL(u);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
});

// Domains that block HEAD or require JS — treat 403/405 as OK
const ALLOW_403 = ['economictimes.indiatimes.com', 'frontline.thehindu.com'];

console.log(`Checking ${external.length} external links...`);

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

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
      if (res.ok || res.status === 405) return { url, status: res.status, ok: true };
      if (res.status === 403) {
        try {
          if (ALLOW_403.some((d) => new URL(url).hostname.includes(d))) {
            return { url, status: res.status, ok: true, note: 'allowlisted 403' };
          }
        } catch {
          /* fall through */
        }
        return { url, status: res.status, ok: false, error: 'HTTP 403' };
      }
      if (res.status >= 400 && res.status < 500) {
        return { url, status: res.status, ok: false, error: `HTTP ${res.status}` };
      }
    } catch (e) {
      if (i === retries) return { url, ok: false, error: e.message };
    }
    await delay(1000 * (i + 1));
  }
  return { url, ok: false, error: 'Max retries exceeded' };
}

async function run() {
  const results = [];
  const concurrency = 5;
  for (let i = 0; i < external.length; i += concurrency) {
    const batch = external.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map((u) => checkUrl(u)));
    results.push(...batchResults);
  }
  const broken = results.filter((r) => !r.ok);
  console.log(`\nOK: ${results.length - broken.length}/${results.length}`);
  if (broken.length) {
    console.log(`\nBROKEN (${broken.length}):`);
    for (const b of broken) {
      console.log(`  ${b.status || 'ERR'} ${b.url}${b.error ? ` → ${b.error}` : ''}`);
    }
    process.exitCode = 1;
  } else {
    console.log('All links healthy');
  }
}

run();
