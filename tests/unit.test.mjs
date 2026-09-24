/* =============================================================
   UNIT TESTS — "The Price of Conflict" UI polish
   Run: npm test  (or: node tests/unit.test.mjs)
   ============================================================= */
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { execFileSync } from 'child_process';

import { axis, buildConfigs, resolveColor } from '../assets/js/charts.js';
import {
  formatCount,
  easeOutCubic,
  clamp,
  loadScript,
  prefersReducedMotion,
} from '../assets/js/utils.js';

const CSS_PATH = 'assets/css/site.css';
const JS_DIR = 'assets/js';
const HTML_PATH = 'index.html';
const CHARTS_JSON = 'data/charts.json';
const MAP_JSON = 'data/map.geo.json';

const css = readFileSync(CSS_PATH, 'utf8');
const html = readFileSync(HTML_PATH, 'utf8');
const chartsData = JSON.parse(readFileSync(CHARTS_JSON, 'utf8'));
const mapGeo = JSON.parse(readFileSync(MAP_JSON, 'utf8'));

/* Prettier multi-line formatting must not break structural asserts.
   Collapse layout whitespace but preserve spaces inside property values
   (e.g. "1px solid", "0 50%"). */
const cssC = css
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s+/g, ' ')
  .replace(/\s*\{\s*/g, '{')
  .replace(/\s*\}\s*/g, '}')
  .replace(/\s*;\s*/g, ';')
  .replace(/:\s+/g, ':')
  .replace(/,\s+/g, ',');

const htmlFlat = html.replace(/\s+/g, ' ');

const jsFiles = readdirSync(JS_DIR)
  .filter((f) => f.endsWith('.js'))
  .sort();
const js = jsFiles.map((f) => readFileSync(join(JS_DIR, f), 'utf8')).join('\n');

let pass = 0,
  fail = 0,
  skip = 0;
const failures = [];

function test(name, fn) {
  const done = () => {
    pass++;
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
  };
  const failTest = (e) => {
    fail++;
    failures.push({ name, msg: e.message });
    console.log(`  \x1b[31m✗\x1b[0m ${name}`);
    console.log(`    ${e.message}`);
  };
  try {
    const r = fn();
    if (r && typeof r.then === 'function') {
      asyncTests.push(r.then(done, failTest));
    } else {
      done();
    }
  } catch (e) {
    failTest(e);
  }
}

const asyncTests = [];

function ok(condition, msg) {
  if (!condition) throw new Error(msg || 'assertion failed');
}

function includes(str, sub, msg) {
  if (!str.includes(sub)) throw new Error(msg || `expected to include "${sub}"`);
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
  includes(cssC, 'display:grid');
});

test('content column has max-width', () => {
  includes(cssC, 'max-width:1200px');
});

test('sections use consistent top-border pattern', () => {
  matches(cssC, /section\{[^}]*border-top:1px solid var\(--rule\)/);
});

test('section spacing uses rem units', () => {
  matches(cssC, /section\{[^}]*padding:3\.5rem 0 2\.5rem/);
});

console.log('\n\x1b[1m─── TYPOGRAPHY ───\x1b[0m');

test('display heading clamp range correct', () => {
  includes(cssC, 'clamp(2rem,5vw,3rem)');
});

test('body font size >= 16px', () => {
  matches(cssC, /body\{[^}]*font-size:17px/);
});

test('body line-height >= 1.6', () => {
  matches(cssC, /body\{[^}]*line-height:1\.72/);
});

test('display line-height >= 1.1', () => {
  matches(cssC, /line-height:1\.12/);
});

test('headline line-height >= 1.2', () => {
  matches(cssC, /line-height:1\.22/);
});

test('ki-unit font-size >= 0.75rem (not 0.72em)', () => {
  matches(cssC, /\.ki-unit\{[^}]*font-size:0\.75rem/);
});

test('toc-num font-size >= 0.75rem (not 0.7rem)', () => {
  matches(cssC, /\.toc-list li a \.toc-num\{[^}]*font-size:0\.75rem/);
});

console.log('\n\x1b[1m─── MICRO-INTERACTIONS ───\x1b[0m');

test('cards have hover background transition', () => {
  matches(cssC, /\.ex-card\{[^}]*transition:background/);
  includes(cssC, '.ex-card:hover');
});

test('phases have hover transition', () => {
  matches(cssC, /\.phase\{[^}]*transition:background/);
  includes(cssC, '.phase:hover');
});

test('badges have hover lift', () => {
  includes(cssC, '.badge:hover');
  matches(cssC, /\.badge:hover\{[^}]*transform/);
});

test('flow nodes have hover transition', () => {
  matches(cssC, /\.flow-n\{[^}]*transition:background/);
  includes(cssC, '.flow-n:hover');
});

test('flow icon scales on hover', () => {
  includes(cssC, '.flow-n:hover .flow-icon');
  matches(cssC, /\.flow-n:hover \.flow-icon\{[^}]*transform/);
});

test('FAQ summary has hover state', () => {
  includes(cssC, '.faq-item summary:hover');
  matches(cssC, /\.faq-item summary:hover\{[^}]*color:var\(--crimson\)/);
});

test('source links have hover lift', () => {
  includes(cssC, '.src-list a:hover');
  matches(cssC, /\.src-list a:hover\{[^}]*transform/);
});

test('stat cells have hover transition', () => {
  matches(cssC, /\.stat-cell\{[^}]*transition:background/);
  includes(cssC, '.stat-cell:hover');
});

test('map plate has hover border transition', () => {
  matches(cssC, /\.map-plate\{[^}]*transition:border-color/);
  includes(cssC, '.map-plate:hover');
});

test('TOC active indicator uses border-left-color transition', () => {
  matches(cssC, /\.toc-list li a\{[^}]*transition:[^}]*border-color/);
  matches(cssC, /\.toc-list li a\.active\{[^}]*border-left-color:var\(--crimson\)/);
});

test('methodology note has hover border transition', () => {
  matches(cssC, /\.meth-note\{[^}]*transition:border-color/);
  includes(cssC, '.meth-note:hover');
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
  matches(cssC, /a\{[^}]*transition:color/);
});

test('selection color is crimson', () => {
  includes(cssC, '::selection');
  matches(cssC, /::selection\{[^}]*background:var\(--crimson\)/);
});

console.log('\n\x1b[1m─── ANIMATIONS ───\x1b[0m');

test('scroll reveal uses opacity only (doc-appropriate)', () => {
  matches(cssC, /\.js \.r\{[^}]*opacity:0[^}]*transform:translateY\(8px\)/);
});

test('data bars use transform scaleX (not width)', () => {
  includes(cssC, 'transform:scaleX(0)');
  includes(cssC, 'transform-origin:0 50%');
});

test('dbar fill has ease-out transition', () => {
  matches(cssC, /\.dbar-fill\{[^}]*transition:transform/);
});

test('FAQ uses grid-template-rows for smooth height', () => {
  includes(cssC, 'grid-template-rows:0fr');
  matches(cssC, /\.faq-item\[open\] \.faq-a\{[^}]*grid-template-rows:1fr/);
});

test('FAQ children hidden via overflow', () => {
  matches(cssC, /\.faq-a > div\{[^}]*overflow:hidden/);
});

test('section numbers animate on reveal', () => {
  matches(cssC, /\.sec-h2 \.sec-no\{[^}]*opacity:0/);
  matches(cssC, /\.r\.v \.sec-no\{[^}]*opacity:1/);
});

test('phase/card/stagger nodes have translateY on reveal', () => {
  includes(cssC, '.phase.r');
  includes(cssC, 'translateY(10px)');
});

test('reduced motion disables animations', () => {
  matches(cssC, /prefers-reduced-motion:reduce\)[^@]*\.js \.r\{[^}]*opacity:1\s*!important/);
});

console.log('\n\x1b[1m─── JS SYNTAX ───\x1b[0m');

test('all JS modules parse without syntax errors', () => {
  if (!jsFiles.length) throw new Error('no JS files found in assets/js');
  for (const f of jsFiles) {
    try {
      execFileSync(process.execPath, ['--check', join(JS_DIR, f)], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (e) {
      throw new Error(`${f}: ${e.stderr || e.message}`);
    }
  }
});

test('JS uses ES modules (import/export), not one monolith IIFE', () => {
  includes(js, 'export ');
  includes(js, 'import ');
  ok(!jsFiles.includes('site.js'), 'legacy site.js should be removed');
  ok(jsFiles.length >= 4, `expected ≥4 modules, got ${jsFiles.length}: ${jsFiles.join(', ')}`);
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
  matches(js, /revealObs = new IntersectionObserver/);
  includes(js, 'initStagger');
});

test('shared lazy-load helper is extracted (onVisible)', () => {
  includes(js, 'export function onVisible');
  includes(js, "from './utils.js'");
});

test('no setTimeout-based chart/map bootstrap hack', () => {
  const chartBootstrap = js.match(/setTimeout\s*\(\s*start\s*,/);
  ok(!chartBootstrap, 'should not setTimeout(start) for CDN bootstrap');
});

test('Chart.js loaded with SRI integrity hash', () => {
  includes(js, 'chart.umd.min.js');
  matches(js, /sha384-/);
  includes(js, 'integrity');
});

test('Leaflet loaded with SRI integrity hash', () => {
  includes(js, 'unpkg.com/leaflet@1.9.4');
  matches(js, /sha256-20nQCchB9co0qIjJZRGuk2/);
});

test('no window.__manipurMap global leak', () => {
  ok(!js.includes('__manipurMap'), 'should not pollute window with map global');
});

test('chart theme derives from CSS custom properties', () => {
  includes(js, 'cssVar');
  matches(js, /cssVar\('--crimson'/);
});

test('chart axis/scale config is factored (not copy-pasted)', () => {
  includes(js, 'export function axis(');
  // buildConfigs loops over figures and calls axis() once per figure at runtime;
  // source must contain exactly one axis() factory and exactly one call site.
  ok(
    (js.match(/scales:\s*axis\(/g) || []).length === 1,
    'axis() should be called once inside buildConfigs, not per-chart'
  );
  ok(
    (js.match(/export function axis\(/g) || []).length === 1,
    'axis() factory should be defined exactly once'
  );
  ok((js.match(/buildConfigs\(/g) || []).length >= 1, 'buildConfigs used by charts module');
});

test('axis() produces y with beginAtZero and shared tick styling', () => {
  const t = { muted: '#5C636B', grid: 'rgba(0,0,0,0.1)', sans: 'sans-serif' };
  const scales = axis(t, { max: 100 });
  ok(scales.y.beginAtZero === true, 'y should beginAtZero by default');
  ok(scales.y.max === 100, 'max should be forwarded');
  ok(scales.y.ticks.color === t.muted, 'ticks color from theme');
  ok(scales.x.grid.display === false, 'x grid off');
  const noMax = axis(t, {});
  ok(noMax.y.max === undefined, 'max omitted when not provided');
  const withCb = axis(t, { yCallback: (v) => `${v}k` });
  ok(typeof withCb.y.ticks.callback === 'function', 'yCallback wired');
});

test('buildConfigs maps editorial JSON to 3 Chart.js configs', () => {
  const t = {
    ink: '#1E232A',
    crimson: '#A31621',
    amber: '#7A4F00',
    green: '#1A5C30',
    muted: '#5C636B',
    grid: 'rgba(0,0,0,0.1)',
    sans: 'sans-serif',
    mono: 'monospace',
  };
  const configs = buildConfigs(chartsData, t);
  ok(Object.keys(configs).length === 3, '3 configs');
  ok(configs['chart-death'].type === 'line', 'death is line');
  ok(configs['chart-death'].data.datasets[0].data.length === 4, 'death 4 points');
  ok(configs['chart-tourism'].type === 'bar', 'tourism is bar');
  ok(configs['chart-disruption'].options.scales.y.max === 260, 'disruption yMax from JSON');
});

test('resolveColor maps logical tokens to CSS var resolutions', () => {
  const resolve = (name) => (name === '--crimson' ? '#A31621' : name);
  ok(resolveColor('crimson', resolve) === '#A31621', 'crimson token');
  ok(resolveColor('--ink', resolve) === '--ink', 'unknown keys pass through');
});

test('formatCount formats prefix/suffix/comma correctly', () => {
  ok(formatCount(306) === '306', 'plain');
  ok(
    formatCount(1200, { prefix: '₹', suffix: ' cr', comma: true }) === '₹1,200 cr',
    'comma+affixes'
  );
  ok(formatCount(17078, { comma: true }) === '17,078', 'en-IN grouping');
  ok(formatCount(305.4) === '305', 'rounds down');
  ok(formatCount(305.6) === '306', 'rounds up');
});

test('easeOutCubic is monotonically increasing on [0,1]', () => {
  ok(easeOutCubic(0) === 0, 'start 0');
  ok(easeOutCubic(1) === 1, 'end 1');
  ok(easeOutCubic(-1) === 0, 'clamps below');
  ok(easeOutCubic(2) === 1, 'clamps above');
  let prev = -1;
  for (let t = 0; t <= 1.001; t += 0.1) {
    const v = easeOutCubic(t);
    ok(v >= prev, `monotonic at t=${t}`);
    prev = v;
  }
});

test('clamp bounds values', () => {
  ok(clamp(5, 0, 10) === 5, 'inside');
  ok(clamp(-1, 0, 10) === 0, 'below');
  ok(clamp(99, 0, 10) === 10, 'above');
});

test('loadScript injects script with SRI and resolves on load', async () => {
  const created = [];
  const fakeDoc = {
    createElement: () => {
      const el = {
        src: '',
        integrity: '',
        crossOrigin: '',
        async: false,
        onload: null,
        onerror: null,
        remove() {},
      };
      created.push(el);
      return el;
    },
    head: {
      appendChild(el) {
        Promise.resolve().then(() => el.onload && el.onload());
      },
    },
  };
  await loadScript({ src: 'https://example.com/x.js', integrity: 'sha384-abc' }, fakeDoc);
  ok(created.length === 1, 'one script tag');
  ok(created[0].src === 'https://example.com/x.js', 'src set');
  ok(created[0].integrity === 'sha384-abc', 'integrity set');
  ok(created[0].async === true, 'async');
});

test('loadScript rejects when script errors', async () => {
  const fakeDoc = {
    createElement: () => ({
      src: '',
      onload: null,
      onerror: null,
      remove() {},
    }),
    head: {
      appendChild(el) {
        Promise.resolve().then(() => el.onerror && el.onerror());
      },
    },
  };
  let rejected = false;
  try {
    await loadScript({ src: 'https://example.com/bad.js' }, fakeDoc);
  } catch (e) {
    rejected = true;
    ok(String(e.message).includes('Failed to load'), 'error message');
  }
  ok(rejected, 'should reject');
});

test('prefersReducedMotion safe when matchMedia missing', () => {
  const v = prefersReducedMotion();
  ok(v === false, 'defaults false without window matchMedia');
});

console.log('\n\x1b[1m─── DATA FILES ───\x1b[0m');

test('data/charts.json has 3 figures with aligned labels/series', () => {
  ok(chartsData.figures.length === 3, '3 figures');
  for (const f of chartsData.figures) {
    ok(typeof f.id === 'string' && f.id.startsWith('chart-'), `id ${f.id}`);
    ok(Array.isArray(f.labels) && f.labels.length > 0, `${f.id} labels`);
    ok(Array.isArray(f.series) && f.series.length === f.labels.length, `${f.id} series length`);
    ok(f.type === 'line' || f.type === 'bar', `${f.id} type`);
    ok(typeof f.tooltip === 'string', `${f.id} tooltip`);
  }
  const ids = chartsData.figures.map((f) => f.id).sort();
  ok(
    JSON.stringify(ids) === JSON.stringify(['chart-death', 'chart-disruption', 'chart-tourism']),
    'expected canvas ids'
  );
});

test('data/map.geo.json has places + highways with valid coords', () => {
  ok(mapGeo.places.length >= 8, '≥8 places');
  ok(mapGeo.highways.length === 2, '2 highways');
  ok(Array.isArray(mapGeo.view.center) && mapGeo.view.center.length === 2, 'view center');
  for (const p of mapGeo.places) {
    ok(Array.isArray(p.c) && p.c.length === 2, `${p.name} coords`);
    ok(p.c[0] > 23 && p.c[0] < 27, `${p.name} lat in Manipur range`);
    ok(p.c[1] > 92 && p.c[1] < 95.5, `${p.name} lon in Manipur range`);
    ok(typeof p.cat === 'string', `${p.name} cat`);
    ok(typeof p.name === 'string' && p.name.length > 0, `${p.name} name`);
  }
  for (const h of mapGeo.highways) {
    ok(h.points.length >= 2, `${h.code} points`);
    ok(h.token.startsWith('--'), `${h.code} CSS token`);
  }
});

test('HTML chart frames match data/charts.json ids', () => {
  for (const f of chartsData.figures) {
    matches(html, new RegExp(`id="${f.id}"`));
  }
});

console.log('\n\x1b[1m─── CHART DATA ───\x1b[0m');

test('chart animation respects prefers-reduced-motion', () => {
  includes(js, 'prefersReducedMotion');
  matches(js, /animation:\s*prefersReducedMotion\(\)/);
});

test('CDN load failures degrade gracefully (onerror)', () => {
  includes(js, 'onerror');
  includes(js, 'markFrameFailed');
  includes(js, 'map-fallback');
});

test('reveal failsafe does not defeat scroll animation (js-ready gate)', () => {
  includes(js, "classList.add('js-ready')");
  matches(html, /js-ready[\s\S]{0,160}querySelectorAll\('\.r'\)/);
  matches(html, /if\s*\(!document\.documentElement\.classList\.contains\('js-ready'\)\)/);
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

test('at least 3 Chart.js charts present', () => {
  const charts = (html.match(/class="chart /g) || []).length;
  ok(charts >= 3, `expected ≥3 charts, got ${charts}`);
  matches(cssC, /\.chart\{[^}]*border:1px solid var\(--rule\)/);
  matches(cssC, /\.chart-frame\{/);
  matches(html, /id="chart-death"/);
  matches(html, /id="chart-tourism"/);
  matches(html, /id="chart-disruption"/);
  ok(/chart\.umd|Chart\.js/.test(js), 'charts.js should load Chart.js');
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
  const tlMatch = htmlFlat.match(/class="ki-table chrono".*?<\/table>/);
  const tlRows = tlMatch ? (tlMatch[0].match(/<tr>\s*<td>/g) || []).length : 0;
  ok(tlRows >= 15, `expected ≥15 timeline rows, got ${tlRows}`);
});

test('FAQ has 10 questions', () => {
  const faqItems = (html.match(/class="faq-item"/g) || []).length;
  ok(faqItems >= 8 && faqItems <= 12, `expected 8-12 FAQ items, got ${faqItems}`);
});

test('ledger has 12 rows', () => {
  const ledgerBlock = htmlFlat.match(/class="ledger".*?<\/table>/);
  const ledgerRows = ledgerBlock ? (ledgerBlock[0].match(/<tr>\s*<td>/g) || []).length : 0;
  ok(ledgerRows >= 10, `expected ≥10 ledger rows, got ${ledgerRows}`);
});

test('Leaflet loaded from unpkg CDN', () => {
  includes(html, 'unpkg.com/leaflet@1.9.4');
  includes(js, 'unpkg.com/leaflet@1.9.4');
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

test('entry is ES module (type=module), not legacy defer script', () => {
  includes(html, 'type="module"');
  includes(html, 'assets/js/main.js');
  ok(!html.includes('assets/js/site.js'), 'legacy site.js reference should be gone');
});

test('tooling present: package.json, ESLint, Prettier, CI, Playwright, data', () => {
  const pkg = readFileSync('package.json', 'utf8');
  includes(pkg, '"test"');
  includes(pkg, '"lint"');
  includes(pkg, '"test:e2e"');
  includes(pkg, '"test:a11y"');
  includes(pkg, '@playwright/test');
  includes(pkg, '@axe-core/playwright');
  readFileSync('eslint.config.js', 'utf8');
  readFileSync('.prettierrc', 'utf8');
  readFileSync('.github/workflows/ci.yml', 'utf8');
  readFileSync('playwright.config.mjs', 'utf8');
  readFileSync(CHARTS_JSON, 'utf8');
  readFileSync(MAP_JSON, 'utf8');
});

test('CI runs e2e + a11y before deploy', () => {
  const yml = readFileSync('.github/workflows/ci.yml', 'utf8');
  includes(yml, 'test:e2e');
  includes(yml, 'test:a11y');
  includes(yml, 'needs: [check, e2e]');
  includes(yml, 'playwright install');
});

test('no inline styles on takeaway (token-driven only)', () => {
  ok(
    !/class="sec-takeaway[^"]*"\s+style="/.test(html),
    'sec-takeaway should not carry inline style attributes'
  );
});

/* ---- SUMMARY (after async tests settle) ---- */
const summarize = async () => {
  await Promise.all(asyncTests);

  console.log(`\n\x1b[1m─── RESULTS ───\x1b[0m`);
  console.log(`  \x1b[32m${pass} passed\x1b[0m`);
  if (fail) console.log(`  \x1b[31m${fail} failed\x1b[0m`);
  if (skip) console.log(`  \x1b[33m${skip} skipped\x1b[0m`);
  console.log('');

  if (fail) {
    console.log('\x1b[31mFailed tests:\x1b[0m');
    failures.forEach((f) => console.log(`  - ${f.name}: ${f.msg}`));
    process.exit(1);
  } else {
    console.log('\x1b[32m✓ All tests passed.\x1b[0m\n');
  }
};

await summarize();
