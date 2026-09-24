/**
 * Chart.js figures — lazy-loaded with SRI; theme from CSS tokens;
 * editorial series loaded from data/charts.json.
 */
import { onVisible, loadScript, cssVar, prefersReducedMotion } from './utils.js';

const CHART_JS_SRC = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
/** sha384 of chart.umd.min.js @4.4.1 (205399 bytes). */
const CHART_JS_SRI = 'sha384-9nhczxUqK87bcKHh20fSQcTGD4qq5GhayNYSYWqwBkINBhOfQLg/P5HG5lF1urn4';

/** @type {Promise<void>|null} */
let loadPromise = null;
const initialized = new Set();

const COLOR_TOKENS = {
  ink: '--ink',
  'ink-2': '--ink-3',
  crimson: '--crimson',
  amber: '--amber',
  green: '--green',
};

function theme() {
  return {
    ink: cssVar('--ink', '#1E232A'),
    crimson: cssVar('--crimson', '#A31621'),
    amber: cssVar('--amber', '#7A4F00'),
    green: cssVar('--green', '#1A5C30'),
    grid: cssVar('--rule', 'rgba(30,35,42,0.14)'),
    muted: cssVar('--ink-3', '#5C636B'),
    sans: cssVar('--ff-sans', 'system-ui, sans-serif'),
    mono: cssVar('--ff-mono', 'monospace'),
  };
}

/**
 * Resolve a logical color key ("crimson") or CSS var name to a hex/string.
 * Pure given a resolver — used so JSON never hardcodes theme hex.
 * @param {string} key
 * @param {(token: string) => string} resolve
 * @returns {string}
 */
export function resolveColor(key, resolve) {
  const token = COLOR_TOKENS[key];
  if (!token) return key;
  return resolve(token);
}

/**
 * Shared axis styling — single source of truth for ticks + grid.
 * Pure given theme object.
 * @param {ReturnType<typeof theme>} t
 * @param {{max?: number, beginAtZero?: boolean, showGrid?: boolean, yCallback?: (v: number) => string|number}} [opts]
 * @returns {{y: object, x: object}}
 */
export function axis(t, { max, beginAtZero = true, showGrid = true, yCallback } = {}) {
  const y = {
    beginAtZero,
    ticks: {
      color: t.muted,
      font: { size: 11, family: t.sans },
      ...(yCallback ? { callback: yCallback } : {}),
    },
    grid: { color: showGrid ? t.grid : false },
  };
  if (max != null) y.max = max;
  return {
    y,
    x: {
      ticks: { color: t.muted, font: { size: 11, family: t.sans } },
      grid: { display: false },
    },
  };
}

function baseOptions(t, tooltipLabel) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: prefersReducedMotion() ? false : { duration: 600, easing: 'easeOutQuart' },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: t.ink,
        titleFont: { family: t.sans, size: 12 },
        bodyFont: { family: t.mono, size: 12 },
        padding: 10,
        cornerRadius: 2,
        displayColors: false,
        callbacks: {
          label: (c) => tooltipLabel(c.parsed.y),
        },
      },
    },
  };
}

function tooltipFormatter(unit) {
  return (v) => {
    if (unit === 'arrivals') return `${v.toLocaleString('en-IN')} arrivals`;
    if (unit === 'killed') return `${v} killed`;
    if (unit === 'days') return `${v} disruption days`;
    return String(v);
  };
}

function thousandsCallback(v) {
  return v >= 1000 ? `${v / 1000}K` : v;
}

/**
 * Build Chart.js configs from editorial JSON + live theme.
 * Pure given (figures, theme).
 * @param {{figures: Array<object>}} data
 * @param {ReturnType<typeof theme>} t
 * @returns {Record<string, object>}
 */
export function buildConfigs(data, t) {
  const resolve = (token) => {
    const cssName = COLOR_TOKENS[token] || token;
    return cssVar(cssName, t[cssName.replace('--', '')] || token);
  };

  const configs = {};
  for (const fig of data.figures) {
    const colors = fig.colors?.map((c) => resolve(c)) || Array(fig.series.length).fill(t.crimson);

    configs[fig.id] = {
      type: fig.type,
      data: {
        labels: fig.labels,
        datasets: [
          fig.type === 'line'
            ? {
                data: fig.series,
                borderColor: colors[0],
                backgroundColor: colors[0],
                borderWidth: 2.5,
                stepped: 'after',
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: colors[0],
                fill: false,
              }
            : {
                data: fig.series,
                backgroundColor: colors,
                borderRadius: 2,
                maxBarThickness: 56,
              },
        ],
      },
      options: {
        ...baseOptions(t, tooltipFormatter(fig.tooltip)),
        scales: axis(t, {
          max: fig.yMax,
          yCallback: fig.yCallback === 'thousands' ? thousandsCallback : undefined,
        }),
      },
    };
  }
  return configs;
}

function initCharts(configs) {
  if (typeof Chart === 'undefined') return;
  Object.keys(configs).forEach((id) => {
    if (initialized.has(id)) return;
    const el = document.getElementById(id);
    if (!el) return;
    initialized.add(id);
    new Chart(el.getContext('2d'), configs[id]);
  });
}

function ensureChartJs() {
  if (window.Chart) return Promise.resolve();
  if (!loadPromise) {
    loadPromise = loadScript({
      src: CHART_JS_SRC,
      integrity: CHART_JS_SRI,
    }).catch((err) => {
      loadPromise = null;
      throw err;
    });
  }
  return loadPromise;
}

async function fetchFigureData() {
  const res = await fetch('data/charts.json', { cache: 'force-cache' });
  if (!res.ok) throw new Error(`charts.json HTTP ${res.status}`);
  return res.json();
}

function markFrameFailed(frame) {
  frame.classList.add('chart-failed');
  const note = frame.closest('.chart')?.querySelector('.chart-note');
  if (note) {
    note.insertAdjacentHTML(
      'afterbegin',
      '<strong>Chart unavailable</strong> — data is listed in the note and tables below. '
    );
  }
}

/**
 * Observe every chart frame independently; load Chart.js once when any nears view.
 * Editorial data comes from data/charts.json; no timers.
 */
export function mountCharts() {
  const frames = Array.from(document.querySelectorAll('.chart-frame'));
  if (!frames.length) return;

  const boot = () => {
    Promise.all([ensureChartJs(), fetchFigureData()])
      .then(([, data]) => initCharts(buildConfigs(data, theme())))
      .catch((err) => {
        console.warn('[charts] failed to load', err);
        frames.forEach(markFrameFailed);
      });
  };

  frames.forEach((frame) => {
    onVisible(frame, boot, { rootMargin: '300px' });
  });
}
