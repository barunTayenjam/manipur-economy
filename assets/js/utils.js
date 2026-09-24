/**
 * Shared DOM / motion / loading utilities.
 * No side effects — pure helpers only.
 */

/** True when the user prefers reduced motion. */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** True when IntersectionObserver is available. */
export function hasIO() {
  return 'IntersectionObserver' in window;
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
  const v = getComputedStyle(document.documentElement).getPropertyValue(name);
  return v ? v.trim() : fallback;
}

/**
 * Inject a classic script tag with optional SRI.
 * Rejects on network / integrity failure so callers can degrade gracefully.
 * @param {{src: string, integrity?: string, crossOrigin?: string}} spec
 * @returns {Promise<void>}
 */
export function loadScript({ src, integrity, crossOrigin = 'anonymous' }) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    if (integrity) {
      s.integrity = integrity;
      s.crossOrigin = crossOrigin;
    }
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      s.remove();
      reject(new Error(`Failed to load script: ${src}`));
    };
    document.head.appendChild(s);
  });
}

/** rAF-throttled scroll listener. */
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
