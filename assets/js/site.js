/* =============================================================
   SITE SCRIPT — "The Price of Conflict"
   1. Leaflet map (lazy-loaded, OSM)
   2. Scroll progress
   3. Scroll reveal (JS-gated; no-JS shows all)
   4. Count-up hero indicators
   5. Contents-rail scroll spy
   ============================================================= */
(function () {
  'use strict';

  /* ---- 1. LEAFLET MAP ---------------------------------------- */
  function initMap() {
    var mapEl = document.getElementById('map');
    if (!mapEl || !window.L) return;
    var map = L.map('map', { scrollWheelZoom: false, attributionControl: true, zoomControl: true }).setView([24.85, 94.0], 7);
    window.__manipurMap = map;
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(map);

    /* enable scroll-zoom only while actively on the map */
    map.on('click', function () { map.scrollWheelZoom.enable(); });
    map.on('mouseout', function () { map.scrollWheelZoom.disable(); });

    var pinIcon = function (cat) {
      return L.divIcon({
        className: 'm-pinwrap',
        html: '<div class="pin ' + cat + '">' + ((cat === 'hotspot' || cat === 'border') ? '<span class="pulse"></span>' : '') + '<i></i></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
    };
    var popupHTML = function (p) {
      return '<div class="mpop"><span class="mpop-cat ' + p.cat + '">' + p.role + '</span>' +
        '<div class="mpop-name">' + p.name + '</div>' +
        '<div class="mpop-note">' + p.note + '</div>' +
        '<div class="mpop-stat">' + p.stat + '</div></div>';
    };

    var places = [
      { c: [24.7991, 93.9364], cat: 'capital', name: 'Imphal', role: 'State capital', note: 'Seat of government in the Meitei-valley heartland; repeated curfews and internet bans since May 2023.', stat: 'Political centre' },
      { c: [25.1528, 93.9714], cat: 'hotspot', name: 'Kangpokpi', role: 'Kuki-Zo district', note: 'Key NH-2 chokepoint; the epicentre of the 2026 Kuki–Naga escalation and a June 2026 attack that triggered CRPF COBRA deployment.', stat: 'Kuki–Naga flashpoint' },
      { c: [24.3469, 93.6994], cat: 'hotspot', name: 'Churachandpur', role: 'Kuki-Zo stronghold', note: 'Epicentre of the May 2023 violence; 1,557+ houses burnt here by May 23, 2023.', stat: 'Conflict origin' },
      { c: [24.3626, 94.2595], cat: 'hotspot', name: 'Tengnoupal', role: 'Kuki-Zo hill district', note: 'Overlooks the road to Moreh; a strategic corridor for the cross-border drugs trade.', stat: 'Border approach' },
      { c: [24.2481, 94.3029], cat: 'border', name: 'Moreh', role: 'Indo–Myanmar border', note: 'Porous transit town for Golden Triangle heroin & methamphetamines into India.', stat: 'Drug-trade gateway' },
      { c: [24.8024, 93.1165], cat: 'node', name: 'Jiribam', role: 'NH-37 · railhead', note: 'Manipur\u2019s only rail link and the NH-37 (Imphal–Silchar) supply lifeline.', stat: 'Supply lifeline' },
      { c: [25.0979, 94.3611], cat: 'hotspot', name: 'Ukhrul', role: 'Naga (Tangkhul) district', note: 'One of five new Kuki–Naga tension zones in 2026; 50 houses burnt and a 5-day internet ban in February 2026.', stat: 'Kuki–Naga flashpoint' },
      { c: [24.6387, 93.9969], cat: 'node', name: 'Thoubal', role: 'Meitei-valley district', note: 'Curfews and commercial shutdowns through the conflict period.', stat: 'Affected district' },
      { c: [25.3934, 94.1502], cat: 'hotspot', name: 'Senapati', role: 'Naga district · NH-2', note: 'A Kuki–Naga flashpoint in 2026; UNC counter-blockades here have repeatedly choked the NH-2 supply line.', stat: 'Kuki–Naga flashpoint' },
      { c: [25.5050, 93.6900], cat: 'hotspot', name: 'Noney', role: 'Naga (Zeme) district', note: 'Nungthut and Khongmol villages burnt here on July 8, 2026 in the widening Kuki–Naga violence.', stat: 'New conflict zone' }
    ];

    var hotspotLayer = L.layerGroup(), nodeLayer = L.layerGroup();
    var allBounds = [];
    places.forEach(function (p) {
      var m = L.marker(p.c, { icon: pinIcon(p.cat), title: p.name, alt: p.name, riseOnHover: true })
        .bindTooltip(p.name, { direction: 'top', offset: [0, -10], className: 'm-placelabel', opacity: 1 })
        .bindPopup(popupHTML(p), { className: 'm-popup', maxWidth: 250 });
      allBounds.push(p.c);
      (p.cat === 'hotspot' ? hotspotLayer : nodeLayer).addLayer(m);
    });
    hotspotLayer.addTo(map); nodeLayer.addTo(map);

    /* verified highway routes (Imphal→Dimapur via Kohima; Imphal→Silchar via Jiribam) */
    var nh2 = [[24.7991, 93.9364], [25.1528, 93.9714], [25.3934, 94.1502], [25.6619, 94.1019], [25.9041, 93.7178]];
    var nh37 = [[24.7991, 93.9364], [24.8024, 93.1165], [24.8303, 92.7876]];
    allBounds.push.apply(allBounds, nh2);
    allBounds.push.apply(allBounds, nh37);
    var highwayLayer = L.layerGroup().addTo(map);
    var drawHW = function (pts, color, code) {
      var g = L.layerGroup();
      g.addLayer(L.polyline(pts, { color: color, weight: 7, opacity: 0.12, lineCap: 'round', lineJoin: 'round' }));
      g.addLayer(L.polyline(pts, { color: color, weight: 2, opacity: 0.9, lineCap: 'round', lineJoin: 'round' })
        .bindTooltip(code, { permanent: true, direction: 'center', className: 'm-hwlabel' }));
      return g;
    };
    highwayLayer.addLayer(drawHW(nh2, '#A31621', 'NH-2'));
    highwayLayer.addLayer(drawHW(nh37, '#1E232A', 'NH-37'));

    L.control.scale({ position: 'bottomleft', imperial: false, maxWidth: 120 }).addTo(map);

    map.fitBounds(L.latLngBounds(allBounds), { padding: [30, 30] });
    map.invalidateSize();
    setTimeout(function () { map.invalidateSize(); }, 500);
    setTimeout(function () { map.invalidateSize(); }, 1300);
  }

  /* lazy-load Leaflet only when the map plate approaches the viewport */
  (function () {
    var mapEl = document.getElementById('map');
    if (!mapEl) return;
    var start = function () {
      if (window.L) { initMap(); return; }
      var s = document.createElement('script');
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      s.crossOrigin = 'anonymous';
      s.onload = function () { initMap(); };
      document.body.appendChild(s);
    };
    if ('IntersectionObserver' in window) {
      var mo = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { start(); mo.disconnect(); }
      }, { rootMargin: '0px', threshold: 0 });
      mo.observe(mapEl);
    } else { start(); }
  })();

  /* ---- 2. SCROLL PROGRESS ------------------------------------ */
  var prog = document.getElementById('progress');
  if (prog) {
    var ticking = false;
    var updateProgress = function () {
      var s = document.documentElement.scrollTop;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.width = h > 0 ? (s / h * 100) + '%' : '0%';
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(updateProgress); ticking = true; }
    }, { passive: true });
    updateProgress();
  }

  /* ---- 3. SCROLL REVEAL -------------------------------------- */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = document.querySelectorAll('.r');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('v'); });
  } else {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('v');
          revealObs.unobserve(e.target);
          /* animate data bars when their card reveals */
          e.target.querySelectorAll('.dbar-fill[data-w]').forEach(function (f) {
            requestAnimationFrame(function () { f.style.width = f.getAttribute('data-w') + '%'; });
          });
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -36px 0px' });
    revealEls.forEach(function (el) { revealObs.observe(el); });
    requestAnimationFrame(function () {
      document.querySelectorAll('.content > .chapter > .r, .chapter:first-of-type .r').forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('v');
      });
    });
  }

  /* ---- 4. COUNT-UP ------------------------------------------- */
  function runCount(el) {
    var to = parseFloat(el.getAttribute('data-count-to'));
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var comma = el.getAttribute('data-comma') === '1';
    var fmt = function (v) { return comma ? Math.round(v).toLocaleString('en-IN') : Math.round(v).toString(); };
    var render = function (v) { el.textContent = prefix + fmt(v) + suffix; };
    if (isNaN(to)) return;
    render(0);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { render(to); return; }
    var dur = 1400, start = performance.now();
    function step(now) {
      var t = Math.min(1, Math.max(0, (now - start) / dur));
      render(to * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  setTimeout(function () {
    document.querySelectorAll('[data-count-to]').forEach(runCount);
  }, 300);

  /* ---- 5. CONTENTS SCROLL SPY -------------------------------- */
  var tocLinks = document.querySelectorAll('.toc-list a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var sections = Array.prototype.slice.call(document.querySelectorAll('section[id]'));
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var id = e.target.id;
          tocLinks.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: 0.15, rootMargin: '-15% 0px -55% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }
})();
