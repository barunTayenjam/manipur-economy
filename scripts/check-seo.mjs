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

// 5b. AEO/GEO: answer-first summary + llms.txt + AI crawler access
if (!/class="in-short[\s"]/.test(HTML)) fail('missing .in-short answer-first summary block');
else ok('.in-short summary present');
const desc = HTML.match(/name="description"[\s\S]*?content="([^"]+)"/);
if (!desc) fail('missing meta description');
else if (desc[1].length < 70 || desc[1].length > 320)
  fail(`meta description length ${desc[1].length}`);
else ok(`meta description length ${desc[1].length}`);
if (!/name="author" content="[^"]*[A-Z][a-z]+ [A-Z][a-z]+/.test(HTML))
  fail('meta author is not a named person');
else ok('named author present');
try {
  const llms = readFileSync('llms.txt', 'utf8');
  for (const needle of [
    '346',
    '28,899',
    '523',
    '₹1,200',
    'baruntayenjam.github.io/manipur-economy/#faq',
  ]) {
    if (!llms.includes(needle)) fail(`llms.txt missing "${needle}"`);
  }
  ok('llms.txt readable');
} catch (e) {
  fail(`llms.txt unreadable: ${e.message}`);
}
try {
  const rb2 = readFileSync('robots.txt', 'utf8');
  for (const bot of [
    'GPTBot',
    'ClaudeBot',
    'PerplexityBot',
    'Google-Extended',
    'Applebot',
    'Amazonbot',
    'meta-externalagent',
    'cohere-ai',
    'YouBot',
    'Diffbot',
  ]) {
    if (!rb2.includes(`User-agent: ${bot}`)) fail(`robots.txt missing ${bot} allowance`);
  }
  ok('robots.txt AI crawlers addressed');
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

// 7. Head guardrails — canonical, twitter card, speakable, llms.txt alternate
const canonLink = HTML.match(/<link rel="canonical" href="([^"]+)"/);
if (!canonLink) fail('missing <link rel="canonical">');
else if (canonLink[1] !== CANON) fail(`canonical "${canonLink[1]}" expected "${CANON}"`);
else ok('canonical link present');

const twCard = HTML.match(/name="twitter:card" content="([^"]+)"/);
if (!twCard) fail('missing twitter:card');
else if (twCard[1] !== 'summary_large_image') fail(`twitter:card "${twCard[1]}"`);
else ok('twitter:card OK');

if (!HTML.includes('SpeakableSpecification')) fail('JSON-LD missing SpeakableSpecification');
else ok('speakable present');

if (!/rel="alternate"[\s\S]{0,300}href="llms\.txt"/.test(HTML)) {
  fail('missing <link rel="alternate" href="llms.txt">');
} else ok('llms.txt alternate link present');

// 8. Title: short, keyword-bearing
const title = (HTML.match(/<title>([^<]+)<\/title>/) || [])[1];
if (!title) fail('missing <title>');
else if (title.length > 60) fail(`title length ${title.length} > 60`);
else if (!/Manipur/.test(title)) fail('title missing "Manipur"');
else ok(`title OK (${title.length} chars)`);

// 9. Exactly one h1, no skipped heading levels (crawl + answer-engine structure)
const h1Count = (HTML.match(/<h1[\s>]/g) || []).length;
if (h1Count !== 1) fail(`expected exactly 1 <h1>, found ${h1Count}`);
else ok('single h1');
const headingLevels = [...HTML.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
let prevLevel = 0;
let skipAt = null;
for (const lvl of headingLevels) {
  if (prevLevel && lvl > prevLevel + 1) {
    skipAt = `h${prevLevel} -> h${lvl}`;
    break;
  }
  prevLevel = lvl;
}
if (skipAt) fail(`heading level skipped: ${skipAt}`);
else ok(`heading hierarchy OK (${headingLevels.length} headings)`);

// 10. Modified dates must agree across meta, JSON-LD and the sitemap
const ldObjs = ldBlocks.flatMap((b) => {
  try {
    const j = JSON.parse(b);
    return Array.isArray(j) ? j : [j];
  } catch {
    return [];
  }
});
const flat = ldObjs.flatMap((o) => (Array.isArray(o['@graph']) ? o['@graph'] : [o]));
const article = flat.find((o) => o['@type'] === 'Article');
const metaMod = (HTML.match(/property="article:modified_time" content="([^"]+)"/) || [])[1];
let sitemapMod = null;
try {
  sitemapMod = (readFileSync('sitemap.xml', 'utf8').match(/<lastmod>([^<]+)<\/lastmod>/) || [])[1];
} catch {
  /* reported by section 4 */
}
if (!metaMod) fail('missing article:modified_time');
else if (!article || !article.dateModified) fail('JSON-LD Article missing dateModified');
else if (article.dateModified !== metaMod)
  fail(`dateModified ${article.dateModified} != article:modified_time ${metaMod}`);
else if (sitemapMod !== metaMod) fail(`sitemap lastmod ${sitemapMod} != ${metaMod}`);
else ok(`modified dates consistent (${metaMod})`);

// 11. Dataset must stay downloadable, author must stay resolvable
const dataset = flat.find((o) => o['@type'] === 'Dataset');
const downloads = (dataset && dataset.distribution) || [];
if (!downloads.length || downloads.some((d) => !d.contentUrl)) {
  fail('Dataset missing distribution contentUrl downloads');
} else ok(`Dataset downloads present (${downloads.length})`);
const author = flat.find((o) => o['@id'] === `${CANON}#author`);
if (!author || !Array.isArray(author.sameAs) || !author.sameAs.length) {
  fail('author Person missing sameAs (entity resolution)');
} else ok('author sameAs present');

// 12. Custom 404 — GitHub Pages serves it for any missing path
try {
  const nf = readFileSync('404.html', 'utf8');
  if (!/name="robots" content="[^"]*noindex/.test(nf)) fail('404.html missing noindex');
  else if (!nf.includes('<base href=')) fail('404.html missing <base> (relative links break)');
  else if (!nf.includes('#faq')) fail('404.html missing section links');
  else ok('404.html present (noindex, base, section links)');
} catch (e) {
  fail(`404.html unreadable: ${e.message}`);
}

if (!process.exitCode) console.log('\nSEO check passed');
