/**
 * Shared DOM / motion / loading utilities.
 * Side-effect free except loadScript / onScrollThrottled (documented above each).
 */

/** True when the user prefers reduced motion. */
export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** True when IntersectionObserver is available. */
export function hasIO() {
  return typeof window !== 'undefined' && 'IntersectionObserver' in window;
}

/**
 * Run `cb` once when `el` enters the viewport (with optional rootMargin).
 * Falls back to immediate invocation when IO is unavailable.
 * @param {Element|null} el
 * @param {() => void} cb
 * @param {{rootMargin?: string, threshold?: number}} [opts]
 * @returns {(() => void)|null} unobserve function, or null if fired immediately
 */
export function onVisible(el, cb, opts = {}) {
  if (!el) return null;
  if (!hasIO()) {
    cb();
    return null;
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        cb();
      }
    },
    { rootMargin: opts.rootMargin || '0px', threshold: opts.threshold || 0 }
  );
  io.observe(el);
  return () => io.disconnect();
}

/**
 * Read a CSS custom property from :root.
 * @param {string} name e.g. "--crimson"
 * @param {string} [fallback]
 * @returns {string}
 */
export function cssVar(name, fallback = '') {
  if (typeof document === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name);
  return v ? v.trim() : fallback;
}

/**
 * Inject a classic script tag with optional SRI.
 * Rejects on network / integrity failure so callers can degrade gracefully.
 * Side effect: appends to document.head.
 * @param {{src: string, integrity?: string, crossOrigin?: string}} spec
 * @param {Document} [doc] injectable for tests
 * @returns {Promise<void>}
 */
export function loadScript({ src, integrity, crossOrigin = 'anonymous' }, doc = document) {
  return new Promise((resolve, reject) => {
    const s = doc.createElement('script');
    s.src = src;
    if (integrity) {
      s.integrity = integrity;
      s.crossOrigin = crossOrigin;
    }
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      s.remove?.();
      reject(new Error(`Failed to load script: ${src}`));
    };
    doc.head.appendChild(s);
  });
}

/** rAF-throttled scroll listener. Side effect: window scroll listener. */
export function onScrollThrottled(handler) {
  let ticking = false;
  const wrapped = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        handler();
        ticking = false;
      });
    }
  };
  window.addEventListener('scroll', wrapped, { passive: true });
  return wrapped;
}

/**
 * Format a count-up value for display.
 * Pure — no DOM.
 * @param {number} value
 * @param {{prefix?: string, suffix?: string, comma?: boolean}} [opts]
 * @returns {string}
 */
export function formatCount(value, { prefix = '', suffix = '', comma = false } = {}) {
  const n = Math.round(value);
  return `${prefix}${comma ? n.toLocaleString('en-IN') : String(n)}${suffix}`;
}

/**
 * Cubic ease-out for count-up / motion curves.
 * Pure — no DOM.
 * @param {number} t progress in [0,1]
 * @returns {number} eased progress in [0,1]
 */
export function easeOutCubic(t) {
  const x = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - x, 3);
}

/**
 * Clamp a number into [min, max].
 * Pure — no DOM.
 * @param {number} v
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}
