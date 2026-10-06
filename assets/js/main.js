/**
 * Entry — wires page behaviours and lazy subsystems.
 * Modules: utils | map | charts
 */
import {
  prefersReducedMotion,
  hasIO,
  onScrollThrottled,
  formatCount,
  easeOutCubic,
  clamp,
} from './utils.js';
import { mountMap } from './map.js';
import { mountCharts } from './charts.js';

/* ---- 1. Scroll progress ------------------------------------- */
function initProgress() {
  const prog = /** @type {HTMLElement | null} */ (document.getElementById('progress'));
  if (!prog) return;
  const update = () => {
    const s = document.documentElement.scrollTop;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.width = h > 0 ? `${(s / h) * 100}%` : '0%';
  };
  onScrollThrottled(update);
  update();
}

/* ---- 2. Scroll reveal --------------------------------------- */
function initReveal() {
  const reduce = prefersReducedMotion();
  const revealEls = document.querySelectorAll('.r');
  /** @type {IntersectionObserver | null} */
  let revealObs = null;

  if (reduce || !hasIO()) {
    revealEls.forEach((el) => el.classList.add('v'));
    return { revealObs: null, reduce };
  }

  revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('v');
        revealObs?.unobserve(e.target);
        e.target.querySelectorAll('.dbar-fill[data-w]').forEach((f) => {
          const bar = /** @type {HTMLElement} */ (f);
          const w = parseFloat(bar.getAttribute('data-w') || '0') / 100;
          requestAnimationFrame(() => {
            bar.style.transform = `scaleX(${w})`;
          });
        });
      });
    },
    { threshold: 0.06, rootMargin: '0px 0px -36px 0px' }
  );
  revealEls.forEach((el) => revealObs.observe(el));

  requestAnimationFrame(() => {
    document
      .querySelectorAll('.content > .chapter > .r, .chapter:first-of-type .r')
      .forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('v');
      });
  });

  return { revealObs, reduce };
}

/* ---- 3. Count-up -------------------------------------------- */
/** @param {Element} el */
function runCount(el) {
  const to = parseFloat(el.getAttribute('data-count-to') || '');
  if (Number.isNaN(to)) return;

  const opts = {
    prefix: el.getAttribute('data-prefix') || '',
    suffix: el.getAttribute('data-suffix') || '',
    comma: el.getAttribute('data-comma') === '1',
  };

  /** @param {number} v */
  const render = (v) => {
    el.textContent = formatCount(v, opts);
  };

  render(0);
  if (prefersReducedMotion()) {
    render(to);
    return;
  }

  const dur = 1200;
  const start = performance.now();
  /** @param {number} now */
  const step = (now) => {
    const t = clamp((now - start) / dur, 0, 1);
    render(to * easeOutCubic(t));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function initCountUp() {
  // data-static="1" marks human-toll figures (lives lost, displaced): they
  // render at full value immediately — a mortality count must not animate,
  // and mid-animation screenshots would publish wrong numbers.
  const countEls = Array.from(document.querySelectorAll('[data-count-to]')).filter(
    (el) => el.getAttribute('data-static') !== '1'
  );
  if (!countEls.length) return;
  if (!hasIO()) {
    countEls.forEach(runCount);
    return;
  }
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        runCount(e.target);
        obs.unobserve(e.target);
      });
    },
    { threshold: 0.4 }
  );
  countEls.forEach((el) => obs.observe(el));
}

/* ---- 4. Contents scroll spy --------------------------------- */
function initSpy() {
  const tocLinks = Array.from(document.querySelectorAll('.toc-list a'));
  const sections = Array.from(document.querySelectorAll('section[id]'));
  if (!tocLinks.length || !sections.length) return;

  /** @param {string} id */
  const setActive = (id) => {
    tocLinks.forEach((a) => {
      a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
    });
  };

  // Scroll-position banding: the active item is the last section whose top
  // has crossed the reading line (a third of the way down the viewport).
  // Threshold-based IntersectionObserver mis-highlighted tall sections and
  // never cleared — the TOC must not lie about where the reader is.
  const update = () => {
    const line = window.scrollY + window.innerHeight * 0.33;
    let current = '';
    for (const s of sections) {
      const top = s.getBoundingClientRect().top + window.scrollY;
      if (top <= line) current = s.id;
    }
    setActive(current);
  };

  onScrollThrottled(update);
  window.addEventListener('resize', update, { passive: true });
  update();
}

/* ---- 5. FAQ height animation wrapper ------------------------ */
function initFaq() {
  document.querySelectorAll('.faq-item .faq-a').forEach((a) => {
    const inner = document.createElement('div');
    while (a.firstChild) inner.appendChild(a.firstChild);
    a.appendChild(inner);
  });

  // Deep links (#faq-N) must show the answer, not a closed accordion.
  const openFromHash = () => {
    const el = /** @type {HTMLDetailsElement | null} */ (
      document.getElementById(window.location.hash.slice(1))
    );
    if (el && el.classList.contains('faq-item')) el.open = true;
  };
  window.addEventListener('hashchange', openFromHash);
  openFromHash();
}

/* ---- 6. Scroll-reveal stagger ------------------------------- */
/**
 * @param {IntersectionObserver | null} revealObs
 * @param {boolean} reduce
 */
function initStagger(revealObs, reduce) {
  if (reduce || !revealObs) return;
  const staggerGroups = document.querySelectorAll('.phases, .stat-grid, .ex-grid, .ledger tbody');
  staggerGroups.forEach((grp) => {
    Array.from(grp.children).forEach((c, i) => {
      const item = /** @type {HTMLElement} */ (c);
      item.classList.add('r');
      item.style.transitionDelay = `${Math.min(i, 8) * 40}ms`;
      revealObs.observe(item);
    });
  });
}

/* ---- boot ---------------------------------------------------- */
const { revealObs, reduce } = initReveal();
initProgress();
initCountUp();
initSpy();
initFaq();
initStagger(revealObs, reduce);
mountMap();
mountCharts();

/* Signal the inline failsafe that reveal initialised successfully. */
document.documentElement.classList.add('js-ready');
