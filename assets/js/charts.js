/**
 * Chart.js figures — lazy-loaded with SRI; theme from CSS tokens;
 * editorial series loaded from data/charts.json.
 * @typedef {object} Theme
 * @property {string} ink
 * @property {string} crimson
 * @property {string} amber
 * @property {string} green
 * @property {string} grid
 * @property {string} muted
 * @property {string} sans
 * @property {string} mono
 * @typedef {object} ChartFigure
 * @property {string} id
 * @property {'line'|'bar'} type
 * @property {string[]} labels
 * @property {number[]} series
 * @property {number} [yMax]
 * @property {'thousands'} [yCallback]
 * @property {string} tooltip
 * @property {string} unit
 * @property {string[]} [colors]
 * @property {'month'} [xUnit] switches the x-axis to a time-proportional
 *   linear scale: labels are parsed as "Mon YYYY", so uneven reporting
 *   gaps keep their true width instead of being drawn as equal categories
 * @typedef {{figures: ChartFigure[]}} ChartsData
 *
 * CDN globals (loaded at runtime with SRI):
 */
import { onVisible, loadScript, cssVar, prefersReducedMotion } from './utils.js';

/**
 * Parse a "Mon YYYY" label ("May 2023") to a mid-month Date.
 * @param {string} label
 * @returns {Date}
 */
function parseMonthYear(label) {
  /** @type {Record<string, number>} */
  const MONTHS = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };
  const [month = '', year = ''] = label.split(' ');
  return new Date(Number(year), MONTHS[month] ?? 0, 15);
}

/**
 * Whole months between two "Mon YYYY" labels.
 * @param {string} label
 * @param {Date} base
 * @returns {number}
 */
function monthOffsetFromLabel(label, base) {
  const d = parseMonthYear(label);
  return (d.getFullYear() - base.getFullYear()) * 12 + (d.getMonth() - base.getMonth());
}

/**
 * Month offset from a base Date → "Sep 2026"-style tick label.
 * @param {number} offset
 * @param {Date} base
 * @returns {string}
 */
function labelFromMonthOffset(offset, base) {
  const d = new Date(base);
  d.setMonth(d.getMonth() + offset);
  return d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

const CHART_JS_SRC = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js';
/** sha384 of chart.umd.js @4.4.1 (205125 bytes, canonical npm file). */
const CHART_JS_SRI = 'sha384-dug+JxfBvklEQdJ4AYuBBAIScUz0bVN73xpy273gcAwHjb3qI0fXmuYNaNfdyYJG';

/** @type {Promise<void>|null} */
let loadPromise = null;
const initialized = new Set();

/** @type {Record<string, string>} */
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
 *
 * Charts use a categorical x-axis by default. Passing `xStart` switches
 * the x-axis to a linear time-proportional scale (xTickFmt renders tick
 * values), so uneven reporting gaps keep their true width instead of
 * being drawn as equal-width categories.
 *
 * @param {ReturnType<typeof theme>} t
 * @param {{max?: number, beginAtZero?: boolean, showGrid?: boolean, yCallback?: (v: number) => string|number, xStart?: number, xMax?: number, xTickFmt?: (v: number) => string, xTicks?: number[]}} [opts]
 * @returns {{y: object, x: object}}
 */
export function axis(
  t,
  { max, beginAtZero = true, showGrid = true, yCallback, xStart, xMax, xTickFmt, xTicks } = {}
) {
  /** @type {any} */
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

  /** @type {any} */
  const x = {
    grid: { display: false },
    ticks: { color: t.muted, font: { size: 11, family: t.sans } },
  };
  if (xStart != null) {
    x.type = 'linear';
    x.min = xStart;
    if (xMax != null) x.max = xMax;
    x.ticks = { ...x.ticks, autoSkip: true, maxTicksLimit: 6 };
    if (xTickFmt) x.ticks.callback = xTickFmt;
    if (xTicks) {
      x.afterBuildTicks = (/** @type {any} */ scale) => {
        scale.ticks = xTicks.map((v) => ({ value: v }));
      };
    }
  }
  return {
    y,
    x,
  };
}

/**
 * @param {Theme} t
 * @param {(v: number) => string} tooltipLabel
 */
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
          // Explicit title: with {x,y} points on a linear axis, the default
          // title can show the raw x value (e.g. "40") instead of "Sep 2026".
          title: (/** @type {any[]} */ items) => {
            const it = items[0];
            const labels = it?.chart?.data?.labels;
            return labels ? String(labels[it.dataIndex]) : '';
          },
          label: (/** @type {any} */ c) => tooltipLabel(c.parsed.y),
        },
      },
    },
  };
}

/** @param {string} unit */
function tooltipFormatter(unit) {
  return (/** @type {number} */ v) => {
    if (unit === 'arrivals') return `${v.toLocaleString('en-IN')} arrivals`;
    if (unit === 'killed') return `${v} killed`;
    if (unit === 'days') return `${v} disruption days`;
    return String(v);
  };
}

/** @param {number} v */
function thousandsCallback(v) {
  return v >= 1000 ? `${v / 1000}K` : v;
}

/**
 * Build Chart.js configs from editorial JSON + live theme.
 * Pure given (figures, theme).
 * @param {ChartsData} data
 * @param {Theme} t
 * @returns {Record<string, any>}
 */
export function buildConfigs(data, t) {
  /** @param {string} token */
  const resolve = (token) => {
    const cssName = COLOR_TOKENS[token] || token;
    const key = /** @type {keyof Theme} */ (cssName.replace('--', ''));
    return cssVar(cssName, t[key] || token);
  };

  /** @type {Record<string, any>} */
  const configs = {};
  for (const fig of data.figures) {
    const colors = fig.colors?.map((c) => resolve(c)) || Array(fig.series.length).fill(t.crimson);

    // xUnit: 'month' → plot on a time-proportional linear axis. Points
    // become {x, y} at numeric month offsets; labels stay as strings for
    // the tooltip title.
    /** @type {number[]|null} */
    let xOffsets = null;
    /** @type {{xStart?: number, xMax?: number, xTickFmt?: (v: number) => string, xTicks?: number[]}} */
    let xOpts = {};
    if (fig.xUnit === 'month') {
      const firstLabel = fig.labels[0] ?? '';
      const firstDate = parseMonthYear(firstLabel);
      xOffsets = fig.labels.map((l) => monthOffsetFromLabel(l, firstDate));
      const span = xOffsets[xOffsets.length - 1] ?? 0;
      // Grace padding so edge point markers are not clipped by the plot
      // boundary; ticks stay pinned at quarter intervals of the span.
      const pad = Math.max(1, Math.round(span * 0.05));
      xOpts = {
        xStart: -pad,
        xMax: span + pad,
        xTickFmt: (/** @type {number} */ v) => labelFromMonthOffset(v, firstDate),
        xTicks: [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(span * f)),
      };
    }
    /**
     * Map a series onto {x, y} points when a time axis is active.
     * @param {number[]} arr
     * @returns {Array<{x: number, y: number}>|number[]}
     */
    const pointData = (arr) =>
      xOffsets ? arr.map((v, i) => ({ x: /** @type {number} */ (xOffsets[i]), y: v })) : arr;

    configs[fig.id] = {
      type: fig.type,
      data: {
        labels: fig.labels,
        datasets: [
          fig.type === 'line'
            ? {
                data: pointData(fig.series),
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
          ...xOpts,
        }),
      },
    };
  }
  return configs;
}

/** @param {Record<string, any>} configs */
function initCharts(configs) {
  if (typeof Chart === 'undefined') return;
  Object.keys(configs).forEach((id) => {
    if (initialized.has(id)) return;
    const el = /** @type {HTMLCanvasElement | null} */ (document.getElementById(id));
    if (!el) return;
    initialized.add(id);
    new Chart(el.getContext('2d'), configs[id]);
  });
}

function ensureChartJs() {
  if (/** @type {any} */ (window).Chart) return Promise.resolve();
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

/**
 * Data URL carries a version stamp: force-cache serves stale copies
 * indefinitely (even past max-age), so the ONLY way a changed
 * charts.json reaches returning visitors is a changed URL. Bump this
 * whenever data/charts.json changes (README → Updating the data).
 */
const CHARTS_DATA_URL = 'data/charts.json?v=2026-10-06b';

async function fetchFigureData() {
  const res = await fetch(CHARTS_DATA_URL, { cache: 'force-cache' });
  if (!res.ok) throw new Error(`charts.json HTTP ${res.status}`);
  return res.json();
}

/** @param {Element} frame */
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
