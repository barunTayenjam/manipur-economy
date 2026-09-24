/**
 * Chart.js figures — lazy-loaded with SRI; theme derived from CSS custom properties.
 */
import { onVisible, loadScript, cssVar, prefersReducedMotion } from './utils.js';

const CHART_JS_SRC = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
/** sha384 of chart.umd.min.js @4.4.1 (205399 bytes). */
const CHART_JS_SRI = 'sha384-9nhczxUqK87bcKHh20fSQcTGD4qq5GhayNYSYWqwBkINBhOfQLg/P5HG5lF1urn4';

/** @type {Promise<void>|null} */
let loadPromise = null;
const initialized = new Set();

function theme() {
  return {
    ink: cssVar('--ink', '#1E232A'),
    crimson: cssVar('--crimson', '#A31621'),
    amber: cssVar('--amber', '#7A4F00'),
    grid: cssVar('--rule', 'rgba(30,35,42,0.14)'),
    muted: cssVar('--ink-3', '#5C636B'),
    sans: cssVar('--ff-sans', 'system-ui, sans-serif'),
    mono: cssVar('--ff-mono', 'monospace'),
  };
}

/** Shared axis styling — single source of truth for ticks + grid. */
function axis(t, { max, beginAtZero = true, showGrid = true, yCallback } = {}) {
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

/**
 * Per-figure configs keyed by canvas id.
 * Data is editorial; styling is token-driven.
 */
function buildConfigs() {
  const t = theme();

  return {
    'chart-death': {
      type: 'line',
      data: {
        labels: ['May 2023', 'Oct 2023', 'Nov 2024', 'Sep 2026'],
        datasets: [
          {
            data: [60, 141, 258, 306],
            borderColor: t.crimson,
            backgroundColor: t.crimson,
            borderWidth: 2.5,
            stepped: 'after',
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: t.crimson,
            fill: false,
          },
        ],
      },
      options: {
        ...baseOptions(t, (v) => `${v} killed`),
        scales: axis(t, { max: 340 }),
      },
    },

    'chart-tourism': {
      type: 'bar',
      data: {
        labels: ['2019-20', '2022-23', '2023-24', '2024-25'],
        datasets: [
          {
            data: [179436, 161420, 36768, 17078],
            backgroundColor: [t.ink, '#3C4248', t.crimson, t.crimson],
            borderRadius: 2,
            maxBarThickness: 56,
          },
        ],
      },
      options: {
        ...baseOptions(t, (v) => `${v.toLocaleString('en-IN')} arrivals`),
        scales: axis(t, {
          yCallback: (v) => (v >= 1000 ? `${v / 1000}K` : v),
        }),
      },
    },

    'chart-disruption': {
      type: 'bar',
      data: {
        labels: ['2023*', '2024', '2025', '2026*'],
        datasets: [
          {
            data: [107, 113, 78, 225],
            backgroundColor: ['#3C4248', '#3C4248', t.amber, t.crimson],
            borderRadius: 2,
            maxBarThickness: 56,
          },
        ],
      },
      options: {
        ...baseOptions(t, (v) => `${v} disruption days`),
        scales: axis(t, { max: 260 }),
      },
    },
  };
}

function initCharts() {
  if (typeof Chart === 'undefined') return;
  const configs = buildConfigs();
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
 * No timers — deep links initialise when their own frame intersects.
 */
export function mountCharts() {
  const frames = Array.from(document.querySelectorAll('.chart-frame'));
  if (!frames.length) return;

  const boot = () => {
    ensureChartJs()
      .then(initCharts)
      .catch((err) => {
        console.warn('[charts] Chart.js failed to load', err);
        frames.forEach(markFrameFailed);
      });
  };

  frames.forEach((frame) => {
    onVisible(frame, boot, { rootMargin: '300px' });
  });
}
