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
  const prog = document.getElementById('progress');
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
        revealObs.unobserve(e.target);
        e.target.querySelectorAll('.dbar-fill[data-w]').forEach((f) => {
          const w = parseFloat(f.getAttribute('data-w')) / 100;
          requestAnimationFrame(() => {
            f.style.transform = `scaleX(${w})`;
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
function runCount(el) {
  const to = parseFloat(el.getAttribute('data-count-to'));
  if (Number.isNaN(to)) return;

  const opts = {
    prefix: el.getAttribute('data-prefix') || '',
    suffix: el.getAttribute('data-suffix') || '',
    comma: el.getAttribute('data-comma') === '1',
  };

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
  const step = (now) => {
    const t = clamp((now - start) / dur, 0, 1);
    render(to * easeOutCubic(t));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function initCountUp() {
  const countEls = document.querySelectorAll('[data-count-to]');
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
  const tocLinks = document.querySelectorAll('.toc-list a');
  if (!tocLinks.length || !hasIO()) return;

  const sections = document.querySelectorAll('section[id]');
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const id = e.target.id;
        tocLinks.forEach((a) => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      });
    },
    { threshold: 0.15, rootMargin: '-15% 0px -55% 0px' }
  );
  sections.forEach((s) => spy.observe(s));
}

/* ---- 5. FAQ height animation wrapper ------------------------ */
function initFaq() {
  document.querySelectorAll('.faq-item .faq-a').forEach((a) => {
    const inner = document.createElement('div');
    while (a.firstChild) inner.appendChild(a.firstChild);
    a.appendChild(inner);
  });
}

/* ---- 6. Scroll-reveal stagger ------------------------------- */
function initStagger(revealObs, reduce) {
  if (reduce || !revealObs) return;
  const staggerGroups = document.querySelectorAll('.phases, .stat-grid, .ex-grid, .ledger tbody');
  staggerGroups.forEach((grp) => {
    Array.from(grp.children).forEach((c, i) => {
      c.classList.add('r');
      c.style.transitionDelay = `${Math.min(i, 8) * 40}ms`;
      revealObs.observe(c);
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
