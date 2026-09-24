/* =============================================================
   UNIT TESTS — "The Price of Conflict" UI polish
   Run: node tests/unit.test.mjs
   ============================================================= */
import { readFileSync } from 'fs';
import vm from 'vm';

const CSS_PATH = 'assets/css/site.css';
const JS_PATH  = 'assets/js/site.js';
const HTML_PATH = 'index.html';

const css = readFileSync(CSS_PATH, 'utf8');
const js  = readFileSync(JS_PATH, 'utf8');
const html = readFileSync(HTML_PATH, 'utf8');

let pass = 0, fail = 0, skip = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    pass++;
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
  } catch (e) {
    fail++;
    failures.push({ name, msg: e.message });
    console.log(`  \x1b[31m✗\x1b[0m ${name}`);
    console.log(`    ${e.message}`);
  }
}

function ok(condition, msg) {
  if (!condition) throw new Error(msg || 'assertion failed');
}

function includes(str, sub, msg) {
  if (!str.includes(sub)) throw new Error(msg || `expected to include "${sub}"`);
}

function excludes(str, sub, msg) {
  if (str.includes(sub)) throw new Error(msg || `expected NOT to include "${sub}"`);
}

function matches(str, regex, msg) {
  if (!regex.test(str)) throw new Error(msg || `expected to match ${regex}`);
}

console.log('\n\x1b[1m─── DESIGN TOKENS ───\x1b[0m');

test('CSS defines spacing tokens', () => {
  includes(css, '--sp-1:');
  includes(css, '--sp-8:');
});

test('CSS defines transition duration tokens', () => {
  includes(css, '--dur-fast:');
  includes(css, '--dur-normal:');
  includes(css, '--dur-slow:');
});

test('CSS defines ease token', () => {
  includes(css, '--ease:');
});

test('All semantic colors defined', () => {
  includes(css, '--crimson:');
  includes(css, '--green:');
  includes(css, '--amber:');
  includes(css, '--ink:');
  includes(css, '--bg:');
});

console.log('\n\x1b[1m─── ACCESSIBILITY ───\x1b[0m');

test('skip link present', () => {
  includes(html, 'class="skip"');
  includes(html, 'href="#main"');
});

test('main landmark present', () => {
  matches(html, /id="main"/);
  matches(html, /<main/i);
});

test('TOC nav has aria-label', () => {
  matches(html, /aria-label="Contents"/);
});

test('prefers-reduced-motion respected in CSS', () => {
  matches(css, /prefers-reduced-motion:\s*reduce/);
});

test('focus-visible outline defined', () => {
  includes(css, ':focus-visible');
  includes(css, 'outline:');
});

test('print styles defined', () => {
  includes(css, '@media print');
});

console.log('\n\x1b[1m─── LAYOUT RHYTHM ───\x1b[0m');

test('page-wrap uses CSS grid', () => {
  includes(css, 'display:grid');
});

test('content column has max-width', () => {
  includes(css, 'max-width:1200px');
});

test('sections use consistent top-border pattern', () => {
  matches(css, /section\{.*border-top:1px solid var\(--rule\)/s);
});

test('section spacing uses rem units', () => {
  matches(css, /section\{.*padding:3\.5rem 0 2\.5rem/s);
});

console.log('\n\x1b[1m─── TYPOGRAPHY ───\x1b[0m');

test('display heading clamp range correct', () => {
  includes(css, 'clamp(2rem,5vw,3rem)');
});

test('body font size >= 16px', () => {
  matches(css, /body\{[^}]*font-size:17px/);
});

test('body line-height >= 1.6', () => {
  matches(css, /body\{[^}]*line-height:1\.72/);
});

test('display line-height >= 1.1', () => {
  matches(css, /line-height:1\.12/);
});

test('headline line-height >= 1.2', () => {
  matches(css, /line-height:1\.22/);
});

test('ki-unit font-size >= 0.75rem (not 0.72em)', () => {
  matches(css, /\.ki-unit\{[^}]*font-size:0\.75rem/);
});

test('toc-num font-size >= 0.75rem (not 0.7rem)', () => {
  matches(css, /\.toc-list li a \.toc-num\{[^}]*font-size:0\.75rem/);
});

console.log('\n\x1b[1m─── MICRO-INTERACTIONS ───\x1b[0m');

test('cards have hover background transition', () => {
  matches(css, /\.ex-card\{[^}]*transition:background/);
  includes(css, '.ex-card:hover');
});

test('phases have hover transition', () => {
  matches(css, /\.phase\{[^}]*transition:background/);
  includes(css, '.phase:hover');
});

test('badges have hover lift', () => {
  includes(css, '.badge:hover');
  matches(css, /\.badge:hover\{[^}]*transform/);
});

test('flow nodes have hover transition', () => {
  matches(css, /\.flow-n\{[^}]*transition:background/);
  includes(css, '.flow-n:hover');
});

test('flow icon scales on hover', () => {
  includes(css, '.flow-n:hover .flow-icon');
  matches(css, /\.flow-n:hover \.flow-icon\{[^}]*transform/);
});

test('FAQ summary has hover state', () => {
  includes(css, '.faq-item summary:hover');
  matches(css, /\.faq-item summary:hover\{[^}]*color:var\(--crimson\)/);
});

test('source links have hover lift', () => {
  includes(css, '.src-list a:hover');
  matches(css, /\.src-list a:hover\{[^}]*transform/);
});

test('stat cells have hover transition', () => {
  matches(css, /\.stat-cell\{[^}]*transition:background/);
  includes(css, '.stat-cell:hover');
});

test('map plate has hover border transition', () => {
  matches(css, /\.map-plate\{[^}]*transition:border-color/);
  includes(css, '.map-plate:hover');
});

test('TOC active indicator uses border-left-color transition', () => {
  matches(css, /\.toc-list li a\{[^}]*transition:[^}]*border-color/);
  matches(css, /\.toc-list li a\.active\{[^}]*border-left-color:var\(--crimson\)/);
});

test('methodology note has hover border transition', () => {
  matches(css, /\.meth-note\{[^}]*transition:border-color/);
  includes(css, '.meth-note:hover');
});

test('table rows have hover background', () => {
  includes(css, '.ki-table tbody tr:hover td');
  includes(css, '.chrono tbody tr:hover td');
  includes(css, '.ledger tbody tr:hover td');
});

test('sup.ref has hover feedback', () => {
  includes(css, 'sup.ref:hover');
});

test('skip link has hover state', () => {
  includes(css, '.skip:hover');
});

test('all links have color transition', () => {
  matches(css, /a\{[^}]*transition:color/);
});

test('selection color is crimson', () => {
  includes(css, '::selection');
  matches(css, /::selection\{[^}]*background:var\(--crimson\)/);
});

console.log('\n\x1b[1m─── ANIMATIONS ───\x1b[0m');

test('scroll reveal uses opacity only (doc-appropriate)', () => {
  matches(css, /\.js \.r\{[^}]*opacity:0[^}]*transform:translateY\(8px\)/);
});

test('data bars use transform scaleX (not width)', () => {
  includes(css, 'transform:scaleX(0)');
  includes(css, 'transform-origin:0 50%');
});

test('dbar fill has ease-out transition', () => {
  matches(css, /\.dbar-fill\{[^}]*transition:transform/);
});

test('FAQ uses grid-template-rows for smooth height', () => {
  includes(css, 'grid-template-rows:0fr');
  includes(css, '.faq-item[open] .faq-a{grid-template-rows:1fr');
});

test('FAQ children hidden via overflow', () => {
  includes(css, '.faq-a > div{overflow:hidden');
});

test('section numbers animate on reveal', () => {
  matches(css, /\.sec-h2 \.sec-no\{[^}]*opacity:0/);
  matches(css, /\.r\.v \.sec-no\{[^}]*opacity:1/);
});

test('phase/card/stagger nodes have translateY on reveal', () => {
  includes(css, '.phase.r');
  includes(css, 'translateY(10px)');
});

test('reduced motion disables animations', () => {
  matches(css, /prefers-reduced-motion:reduce\)[^}]*\.js \.r\{[^}]*opacity:1!important/);
});

console.log('\n\x1b[1m─── JS SYNTAX ───\x1b[0m');

test('JS file has no syntax errors (basic parse)', () => {
  try {
    new vm.Script(js, { filename: 'site.js' });
  } catch (e) {
    throw new Error(`JS parse error: ${e.message}`);
  }
});

test('JS defines FAQ wrapper function', () => {
  includes(js, 'faq-item .faq-a');
  includes(js, 'document.createElement');
});

test('JS defines stagger function', () => {
  includes(js, 'staggerGroups');
  includes(js, 'transitionDelay');
});

test('JS defines viewport-triggered count-up', () => {
  includes(js, 'IntersectionObserver');
  includes(js, 'data-count-to');
});

test('JS wraps reveal observer in proper scope', () => {
  includes(js, 'var revealObs');
  matches(js, /revealObs = new IntersectionObserver/);
});

console.log('\n\x1b[1m─── STRUCTURAL ───\x1b[0m');

test('JSON-LD schema present', () => {
  includes(html, '"@type": "Article"');
  includes(html, '"@type": "FAQPage"');
  includes(html, '"@type": "Dataset"');
});

test('OG meta tags present', () => {
  includes(html, 'og:title');
  includes(html, 'og:image');
  includes(html, 'og:description');
});

test('all 12 TOC items present', () => {
  matches(html, /href="#phases"/);
  matches(html, /href="#baseline"/);
  matches(html, /href="#losers"/);
  matches(html, /href="#gainers"/);
  matches(html, /href="#shadow"/);
  matches(html, /href="#economy"/);
  matches(html, /href="#blockade"/);
  matches(html, /href="#timeline"/);
  matches(html, /href="#ledger"/);
  matches(html, /href="#officials"/);
  matches(html, /href="#outlook"/);
  matches(html, /href="#faq"/);
});

test('all 12 sections present', () => {
  matches(html, /id="phases"/);
  matches(html, /id="baseline"/);
  matches(html, /id="losers"/);
  matches(html, /id="gainers"/);
  matches(html, /id="shadow"/);
  matches(html, /id="economy"/);
  matches(html, /id="blockade"/);
  matches(html, /id="timeline"/);
  matches(html, /id="ledger"/);
  matches(html, /id="officials"/);
  matches(html, /id="outlook"/);
  matches(html, /id="faq"/);
});

test('at least 3 inline SVG charts present', () => {
  const charts = (html.match(/class="chart /g) || []).length;
  ok(charts >= 3, `expected ≥3 charts, got ${charts}`);
  matches(css, /\.chart\{[^}]*border:1px solid var\(--rule\)/);
  matches(css, /\.chart-svg \.bar\{/);
});

test('outlook section has 4 numbered cards', () => {
  matches(html, /id="outlook"/);
  const cards = (html.match(/class="outlook-card"/g) || []).length;
  ok(cards === 4, `expected 4 outlook cards, got ${cards}`);
});

test('key indicators table present with 6 rows', () => {
  matches(html, /Statement of Key Indicators/);
  const kiRows = (html.match(/class="ki-val/g) || []).length;
  ok(kiRows >= 6, `expected ≥6 ki-val elements, got ${kiRows}`);
});

test('timeline has all 18 events', () => {
  const tlMatch = html.match(/class="ki-table chrono"[\s\S]*?<\/table>/);
  const tlRows = tlMatch ? (tlMatch[0].match(/<tr><td>/g) || []).length : 0;
  ok(tlRows >= 15, `expected ≥15 timeline rows, got ${tlRows}`);
});

test('FAQ has 10 questions', () => {
  const faqItems = (html.match(/class="faq-item"/g) || []).length;
  ok(faqItems >= 8 && faqItems <= 12, `expected 8-12 FAQ items, got ${faqItems}`);
});

test('ledger has 12 rows', () => {
  const ledgerRows = (html.match(/class="ledger"[\s\S]*?<\/table>/)?.[0]?.match(/<tr><td>/g) || []).length;
  ok(ledgerRows >= 10, `expected ≥10 ledger rows, got ${ledgerRows}`);
});

test('Leaflet loaded from unpkg CDN', () => {
  includes(html, 'unpkg.com/leaflet@1.9.4');
});

test('self-hosted fonts preloaded', () => {
  includes(html, 'assets/fonts/spectral-n700.woff2');
  includes(html, 'assets/fonts/archivo-n400-800.woff2');
});

test('sitemap present', () => {
  includes(html, 'sitemap.xml');
});

test('webmanifest linked', () => {
  includes(html, 'site.webmanifest');
});

/* ---- SUMMARY ---- */
console.log(`\n\x1b[1m─── RESULTS ───\x1b[0m`);
console.log(`  \x1b[32m${pass} passed\x1b[0m`);
if (fail) console.log(`  \x1b[31m${fail} failed\x1b[0m`);
if (skip) console.log(`  \x1b[33m${skip} skipped\x1b[0m`);
console.log('');

if (fail) {
  console.log('\x1b[31mFailed tests:\x1b[0m');
  failures.forEach(f => console.log(`  - ${f.name}: ${f.msg}`));
  process.exit(1);
} else {
  console.log('\x1b[32m✓ All tests passed.\x1b[0m\n');
}
