/**
 * Structured data + SEO check — validates JSON-LD, OG tags, sitemap, robots, manifest.
 * Run: npm run check:seo
 */
import { readFileSync } from 'node:fs';

const fail = (msg) => {
  console.error(`SEO FAIL: ${msg}`);
  process.exitCode = 1;
};
const ok = (msg) => console.log(`ok: ${msg}`);

const HTML = readFileSync('index.html', 'utf8');
const CANON = 'https://baruntayenjam.github.io/manipur-economy/';

// 1. JSON-LD blocks
const ldBlocks = [
  ...HTML.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g),
].map((m) => m[1]);
if (!ldBlocks.length) fail('no JSON-LD blocks found');
const types = new Set();
const collectTypes = (o) => {
  if (!o || typeof o !== 'object') return;
  if (o['@type']) types.add(o['@type']);
  if (Array.isArray(o['@graph'])) o['@graph'].forEach(collectTypes);
  if (Array.isArray(o.mainEntity)) o.mainEntity.forEach(collectTypes);
};
for (const [i, raw] of ldBlocks.entries()) {
  try {
    const j = JSON.parse(raw);
    const arr = Array.isArray(j) ? j : [j];
    for (const o of arr) {
      if (o['@context'] && o['@context'] !== 'https://schema.org') fail(`block ${i} bad @context`);
      collectTypes(o);
    }
  } catch (e) {
    fail(`block ${i} invalid JSON: ${e.message}`);
  }
}
for (const t of ['Article', 'FAQPage', 'Dataset']) {
  if (!types.has(t)) fail(`missing JSON-LD @type ${t}`);
  else ok(`JSON-LD ${t} present`);
}

// 2. FAQPage entity count matches .faq-item count
const faqItems = (HTML.match(/class="faq-item"/g) || []).length;
const faqBlock = ldBlocks.map((b) => {
  try {
    return JSON.parse(b);
  } catch {
    return null;
  }
});
const faqEntities = faqBlock
  .flatMap((j) => (Array.isArray(j) ? j : [j]))
  .filter(Boolean)
  .filter((o) => o['@type'] === 'FAQPage')
  .flatMap((o) => o.mainEntity || []);
if (faqEntities.length && Math.abs(faqEntities.length - faqItems) > 2) {
  fail(`FAQPage entities (${faqEntities.length}) vs .faq-item (${faqItems}) mismatch`);
} else {
  ok(`FAQ entities ${faqEntities.length} vs items ${faqItems}`);
}

// 3. OG tags
for (const [prop, val] of [
  ['og:title', null],
  ['og:description', null],
  ['og:image', null],
  ['og:url', CANON],
  ['og:type', 'article'],
]) {
  const m = HTML.match(new RegExp(`property="${prop}"[\\s\\S]*?content="([^"]+)"`));
  if (!m) fail(`missing og tag ${prop}`);
  else if (val && m[1] !== val) fail(`${prop}="${m[1]}" expected "${val}"`);
  else ok(`${prop} OK`);
}

// 4. sitemap.xml contains canonical
try {
  const sm = readFileSync('sitemap.xml', 'utf8');
  if (!sm.includes(CANON)) fail('sitemap.xml missing canonical URL');
  else ok('sitemap.xml contains canonical');
} catch (e) {
  fail(`sitemap.xml unreadable: ${e.message}`);
}

// 5. robots.txt has Sitemap
try {
  const rb = readFileSync('robots.txt', 'utf8');
  if (!/Sitemap:/i.test(rb)) fail('robots.txt missing Sitemap line');
  else ok('robots.txt Sitemap present');
} catch (e) {
  fail(`robots.txt unreadable: ${e.message}`);
}

// 6. manifest parses
try {
  const mf = JSON.parse(readFileSync('site.webmanifest', 'utf8'));
  if (!mf.name || !mf.icons) fail('manifest missing name/icons');
  else ok('manifest OK');
} catch (e) {
  fail(`manifest invalid: ${e.message}`);
}

if (!process.exitCode) console.log('\nSEO check passed');
