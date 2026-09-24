/**
 * Content freshness + fact-check automation.
 * Run: npm run check:content
 */
import { readFileSync } from 'node:fs';

const fail = (msg) => {
  console.error(`CONTENT FAIL: ${msg}`);
  process.exitCode = 1;
};
const ok = (msg) => console.log(`ok: ${msg}`);

const charts = JSON.parse(readFileSync('data/charts.json', 'utf8'));
const geo = JSON.parse(readFileSync('data/map.geo.json', 'utf8'));
const HTML = readFileSync('index.html', 'utf8');

// Charts: death series non-decreasing, last label has year >= 2025
const death = charts.figures.find((f) => f.id === 'chart-death');
if (!death) fail('chart-death missing');
else {
  const s = death.series;
  for (let i = 1; i < s.length; i++) if (s[i] < s[i - 1]) fail('death series decreasing');
  const lastLabel = death.labels[death.labels.length - 1] || '';
  if (!/(202[5-9]|20[3-9]\d)/.test(lastLabel)) fail(`death last label stale: ${lastLabel}`);
  else ok(`death series OK (${s.join('→')})`);
}

// Tourism: 2024-25 < 2019-20 (conflict drop)
const tour = charts.figures.find((f) => f.id === 'chart-tourism');
if (!tour) fail('chart-tourism missing');
else if (!(tour.series[tour.series.length - 1] < tour.series[0])) {
  fail('tourism drop invariant broken');
} else ok('tourism drop OK');

// Disruption: all > 0
const dis = charts.figures.find((f) => f.id === 'chart-disruption');
if (!dis) fail('chart-disruption missing');
else if (!dis.series.every((v) => v > 0)) fail('disruption has non-positive value');
else ok('disruption OK');

// Map: 10 places, 2 highways, geo bounds
if (geo.places.length !== 10) fail(`places=${geo.places.length} expected 10`);
else ok('10 places');
if (geo.highways.length !== 2) fail(`highways=${geo.highways.length} expected 2`);
else ok('2 highways');
for (const p of geo.places) {
  if (!(p.c[0] > 23 && p.c[0] < 27 && p.c[1] > 92 && p.c[1] < 95.5))
    fail(`${p.name} out of bounds`);
  for (const k of ['name', 'role', 'note', 'stat']) if (!p[k]) fail(`${p.name} missing ${k}`);
}
ok('geo bounds + fields OK');

// HTML: 12 sections, FAQ 8-12, no placeholders
const sections = [...HTML.matchAll(/<section id="([^"]+)"/g)].map((m) => m[1]);
const expected = [
  'phases',
  'baseline',
  'losers',
  'gainers',
  'shadow',
  'economy',
  'blockade',
  'timeline',
  'ledger',
  'officials',
  'outlook',
  'faq',
];
for (const id of expected) if (!sections.includes(id)) fail(`section #${id} missing`);
ok(`sections OK (${sections.length})`);
const faqs = (HTML.match(/class="faq-item"/g) || []).length;
if (faqs < 8 || faqs > 12) fail(`faq count ${faqs}`);
else ok(`faq count ${faqs}`);
const bodyNoCharts = HTML.replace(/202[36]\*/g, '');
if (/lorem|TODO|FIXME|XXX/i.test(bodyNoCharts)) fail('placeholder text found');
else ok('no placeholders');

if (!process.exitCode) console.log('\nContent check passed');
